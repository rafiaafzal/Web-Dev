"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { generateJSON } from "@/lib/ai/gemini";
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

/**
 * Creates a new job posting.
 */
export async function createJob(input: JobInput): Promise<ActionResult<Job>> {
  try {
    const recruiter = await requireRole("recruiter");

    const validated = jobInputSchema.safeParse(input);
    if (!validated.success) {
      return {
        ok: false,
        error: validated.error.issues.map((e) => e.message).join(", "),
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        recruiter_id: recruiter.id,
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
    const recruiter = await requireRole("recruiter");

    const validated = jobInputSchema.safeParse(input);
    if (!validated.success) {
      return {
        ok: false,
        error: validated.error.issues.map((e) => e.message).join(", "),
      };
    }

    const supabase = await createClient();
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
      .eq("recruiter_id", recruiter.id)
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
    const recruiter = await requireRole("recruiter");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", id)
      .eq("recruiter_id", recruiter.id)
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
    const supabase = await createClient();
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
    const recruiter = await requireRole("recruiter");
    const supabase = await createClient();

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiter.id)
      .order("created_at", { ascending: false });

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

const aiRequirementsSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string().min(1, "Skill name cannot be empty"),
      importance: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
      required: z.boolean(),
    })
  ),
  min_experience_years: z.number().default(0),
  qualifications: z.string().default(""),
});

/**
 * Extracts requirements, skills, min experience, and qualifications from a raw job description using Gemini AI.
 * Strict: No hardcoded output.
 */
export async function extractRequirements(
  description: string
): Promise<ActionResult<{ skills: SkillRequirement[]; min_experience_years: number; qualifications: string }>> {
  try {
    await requireRole("recruiter");

    if (!description || description.trim().length < 10) {
      return {
        ok: false,
        error: "Please enter a descriptive job description (at least 10 characters) to extract requirements.",
      };
    }

    const prompt = `You are an expert talent acquisition and AI recruitment assistant.
Carefully analyze the following job description. Extract:
1. "skills": An array of technical and core skills mentioned. For each skill provide:
   - "name": Standardized skill name (e.g. "Python", "PostgreSQL", "Docker", "React").
   - "importance": Integer from 1 to 5, where 5 is critical/mandatory, and 1 is nice-to-have.
   - "required": Boolean true if the skill is strictly required/essential, false if preferred/optional.
2. "min_experience_years": Minimum years of experience required (number, or 0 if not specified).
3. "qualifications": Required education or degrees (e.g. "Bachelor's degree in Computer Science or equivalent experience").

Job Description:
"""
${description}
"""

Return a JSON object with EXACTLY this structure:
{
  "skills": [
    { "name": "Python", "importance": 5, "required": true }
  ],
  "min_experience_years": 3,
  "qualifications": "Bachelor's degree in Computer Science or equivalent"
}`;

    const aiResult = await generateJSON(prompt, aiRequirementsSchema);

    return {
      ok: true,
      data: aiResult,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to extract requirements with Gemini AI",
    };
  }
}
