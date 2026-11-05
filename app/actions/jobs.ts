"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { ActionResult, Job, JobInput, SkillRequirement } from "@/types/recruiter";

// Zod validation schemas
const skillRequirementSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  importance: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  required: z.boolean(),
});

const jobInputSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  department: z.string().default(""),
  location: z.string().default(""),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  salary: z.string().default(""),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  skills: z.array(skillRequirementSchema).default([]),
  min_experience_years: z.coerce.number().min(0, "Minimum experience must be 0 or more").default(0),
  qualifications: z.string().default(""),
});

// TEMP-STUB: remove when Dev A delivers lib/supabase/server.ts
async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Component context
        }
      },
    },
  });
}

/**
 * Creates a new job posting.
 */
export async function createJob(input: JobInput): Promise<ActionResult<Job>> {
  try {
    const validated = jobInputSchema.safeParse(input);
    if (!validated.success) {
      return {
        ok: false,
        error: validated.error.issues.map((e) => e.message).join(", "),
      };
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not yet logged in during local testing, generate/fallback to a placeholder
    const recruiter_id = user?.id || "00000000-0000-0000-0000-000000000000";

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        recruiter_id,
        title: validated.data.title,
        department: validated.data.department,
        location: validated.data.location,
        type: validated.data.type,
        salary: validated.data.salary,
        description: validated.data.description,
        skills: validated.data.skills,
        min_experience_years: validated.data.min_experience_years,
        qualifications: validated.data.qualifications,
        status: "open",
      })
      .select("*")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Job };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create job",
    };
  }
}

/**
 * Updates an existing job posting.
 */
export async function updateJob(id: string, input: JobInput): Promise<ActionResult<Job>> {
  try {
    const validated = jobInputSchema.safeParse(input);
    if (!validated.success) {
      return {
        ok: false,
        error: validated.error.issues.map((e) => e.message).join(", "),
      };
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .update({
        title: validated.data.title,
        department: validated.data.department,
        location: validated.data.location,
        type: validated.data.type,
        salary: validated.data.salary,
        description: validated.data.description,
        skills: validated.data.skills,
        min_experience_years: validated.data.min_experience_years,
        qualifications: validated.data.qualifications,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Job };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update job",
    };
  }
}

/**
 * Updates the status of a job (open or closed).
 */
export async function setJobStatus(
  id: string,
  status: "open" | "closed"
): Promise<ActionResult<Job>> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Job };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update job status",
    };
  }
}

/**
 * Fetches a single job by id.
 */
export async function getJob(id: string): Promise<ActionResult<Job>> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Job };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to fetch job",
    };
  }
}

/**
 * Lists jobs created by the current recruiter with applicant count.
 */
export async function listMyJobs(): Promise<ActionResult<Job[]>> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

    // If authenticated, filter by recruiter_id
    if (user?.id) {
      query = query.eq("recruiter_id", user.id);
    }

    const { data: jobs, error } = await query;
    if (error) {
      return { ok: false, error: error.message };
    }

    if (!jobs || jobs.length === 0) {
      return { ok: true, data: [] };
    }

    // Fetch applicant count from applications table
    const jobIds = jobs.map((j) => j.id);
    const { data: appCounts } = await supabase
      .from("applications")
      .select("job_id")
      .in("job_id", jobIds);

    const countMap: Record<string, number> = {};
    if (appCounts) {
      for (const app of appCounts) {
        countMap[app.job_id] = (countMap[app.job_id] || 0) + 1;
      }
    }

    const enrichedJobs: Job[] = jobs.map((job) => ({
      ...job,
      applicant_count: countMap[job.id] || 0,
    }));

    return { ok: true, data: enrichedJobs };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to list jobs",
    };
  }
}

/**
 * Extracts requirements, skills, min experience, and qualifications from a raw job description using AI.
 * TEMP-STUB: will call lib/ai/gemini.ts generateJSON once Dev A delivers it.
 */
export async function extractRequirements(
  description: string
): Promise<ActionResult<{ skills: SkillRequirement[]; min_experience_years: number; qualifications: string }>> {
  try {
    if (!description || description.trim().length < 10) {
      return {
        ok: false,
        error: "Please enter a descriptive job description (at least 10 characters) to extract requirements.",
      };
    }

    // TEMP-STUB: Once Dev A delivers lib/ai/gemini.ts, uncomment:
    // import { generateJSON } from "@/lib/ai/gemini";
    // const aiResult = await generateJSON(prompt, schema);
    // return { ok: true, data: aiResult };

    // TEMP-STUB: intelligent rule-based fallback while waiting for Dev A's lib/ai/gemini.ts
    const lower = description.toLowerCase();
    const commonSkills = [
      { name: "Python", regex: /\bpython\b/i, importance: 5 as const, required: true },
      { name: "Django", regex: /\bdjango\b/i, importance: 4 as const, required: true },
      { name: "PostgreSQL", regex: /\bpostgres(ql)?\b/i, importance: 4 as const, required: true },
      { name: "Docker", regex: /\bdocker\b/i, importance: 4 as const, required: false },
      { name: "Kubernetes", regex: /\bkubernetes|k8s\b/i, importance: 3 as const, required: false },
      { name: "TypeScript", regex: /\btypescript\b/i, importance: 5 as const, required: true },
      { name: "React", regex: /\breact(\.js)?\b/i, importance: 4 as const, required: true },
      { name: "Next.js", regex: /\bnext(\.js)?\b/i, importance: 4 as const, required: false },
      { name: "Node.js", regex: /\bnode(\.js)?\b/i, importance: 4 as const, required: false },
      { name: "AWS", regex: /\baws|amazon web services\b/i, importance: 3 as const, required: false },
      { name: "REST APIs", regex: /\brest(ful)? api(s)?\b/i, importance: 4 as const, required: true },
      { name: "Git", regex: /\bgit\b/i, importance: 3 as const, required: false },
    ];

    const extractedSkills: SkillRequirement[] = commonSkills
      .filter((s) => s.regex.test(lower))
      .map(({ name, importance, required }) => ({ name, importance, required }));

    // If none matched, provide default starter skills from context
    if (extractedSkills.length === 0) {
      extractedSkills.push(
        { name: "Python", importance: 5, required: true },
        { name: "PostgreSQL", importance: 4, required: true },
        { name: "Docker", importance: 3, required: false }
      );
    }

    // Experience detection
    let minExperience = 0;
    const expMatch = lower.match(/(\d+)\+?\s*(years?|yrs?)/);
    if (expMatch && expMatch[1]) {
      minExperience = parseInt(expMatch[1], 10);
    }

    // Qualifications detection
    let qualifications = "Bachelor's degree in Computer Science, Software Engineering, or equivalent experience";
    if (lower.includes("master") || lower.includes("msc") || lower.includes("phd")) {
      qualifications = "Master's degree or advanced qualification preferred";
    }

    return {
      ok: true,
      data: {
        skills: extractedSkills,
        min_experience_years: minExperience,
        qualifications,
      },
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to extract requirements",
    };
  }
}
