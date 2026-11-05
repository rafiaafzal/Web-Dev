'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/ai/gemini';
import type { ActionResult, Assessment, ParsedResume } from '@/types/core';
import type { InterviewQuestion, Job } from '@/types/recruiter';

const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
const categoryEnum = z.enum(['role', 'project']);

const questionItemSchema = z.object({
  difficulty: difficultyEnum,
  category: categoryEnum,
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer_guide: z.string().min(5, 'Answer guide must be at least 5 characters'),
});

const generatedQuestionsSchema = z.array(questionItemSchema);

const updateQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer_guide: z.string().min(5, 'Answer guide must be at least 5 characters'),
  difficulty: difficultyEnum,
});

const difficultyOrder: Record<'beginner' | 'intermediate' | 'advanced', number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export async function listQuestions(
  applicationId: string
): Promise<ActionResult<InterviewQuestion[]>> {
  try {
    await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (error) {
      return { ok: false, error: error.message };
    }

    const questions: InterviewQuestion[] = (data || []).map((q) => ({
      id: q.id,
      application_id: q.application_id,
      difficulty: q.difficulty as 'beginner' | 'intermediate' | 'advanced',
      category: q.category as 'role' | 'project',
      question: q.question,
      answer_guide: q.answer_guide,
      created_at: q.created_at,
    }));

    // Sort by difficulty (beginner -> intermediate -> advanced) then created_at
    questions.sort((a, b) => {
      const diffDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      if (diffDiff !== 0) return diffDiff;
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    });

    return { ok: true, data: questions };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list questions';
    return { ok: false, error: message };
  }
}

export async function generateQuestions(
  applicationId: string
): Promise<ActionResult<{ questions: InterviewQuestion[]; note?: string }>> {
  try {
    await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const supabase = await createClient();

    // 1. Fetch application + job + assessment + resume
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        job:jobs (*),
        assessment:assessments (*),
        resume:resumes (*)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !appData) {
      return { ok: false, error: appError?.message || 'Application not found' };
    }

    const rawJob = Array.isArray(appData.job) ? appData.job[0] : appData.job;
    const job: Job | null = rawJob ? (rawJob as Job) : null;

    const rawAssessment = Array.isArray(appData.assessment) ? appData.assessment[0] : appData.assessment;
    const assessment: Assessment | null = rawAssessment
      ? {
          total_score: Number(rawAssessment.total_score ?? 0),
          breakdown: rawAssessment.breakdown,
          matched_skills: rawAssessment.details?.matched_skills || rawAssessment.matched_skills || [],
          gaps: rawAssessment.details?.gaps || rawAssessment.gaps || [],
          summary: rawAssessment.details?.summary || rawAssessment.summary || '',
          learning_suggestions: rawAssessment.details?.learning_suggestions || rawAssessment.learning_suggestions || [],
          unsupported_claims: rawAssessment.details?.unsupported_claims || rawAssessment.unsupported_claims || [],
        }
      : null;

    const rawResume = Array.isArray(appData.resume) ? appData.resume[0] : appData.resume;
    const parsedResume: ParsedResume | null = rawResume?.parsed ? (rawResume.parsed as ParsedResume) : null;

    const jobTitle = job?.title || 'Target Role';
    const jobDescription = job?.description || '';
    const jobSkills = (job?.skills || []).map((s) => s.name).join(', ');

    const matchedSkillsStr = assessment?.matched_skills?.map((m) => m.skill).join(', ') || 'None identified yet';
    const gapsStr = assessment?.gaps?.map((g) => `${g.skill} (${g.status}: ${g.note})`).join('; ') || 'None identified yet';
    const projects = parsedResume?.projects || [];
    const projectsStr =
      projects.length > 0
        ? projects
            .map(
              (p) =>
                `Project: "${p.name}". Description: ${p.description}. Tech: ${p.tech?.join(', ') || 'N/A'}`
            )
            .join('\n')
        : 'No parsed candidate projects available.';

    const isMissingContext = !assessment || !parsedResume;

    const prompt = `You are an expert technical recruiter and interviewer conducting a comprehensive candidate assessment.
Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${jobSkills}

Candidate Assessment Context:
- Verified Matched Skills: ${matchedSkillsStr}
- Identified Skill Gaps: ${gapsStr}
- Candidate Projects:
${projectsStr}

Generate a tailored list of approximately 9 interview questions:
- Exactly 3 beginner difficulty questions
- Exactly 3 intermediate difficulty questions
- Exactly 3 advanced difficulty questions
- At least 3 questions MUST have category "project" and specifically name and explore the candidate's actual projects (or realistic projects relevant to the job if candidate projects are unavailable).
- At least 2 questions MUST probe the candidate's listed skill gaps to verify actual depth or absent knowledge.
- For every question, provide a concise, high-value "answer_guide" explaining what a good response looks like and key signals to listen for.

Return a JSON array of objects with the exact schema:
[
  {
    "difficulty": "beginner" | "intermediate" | "advanced",
    "category": "role" | "project",
    "question": "string",
    "answer_guide": "string"
  }
]`;

    const generated = await generateJSON(prompt, generatedQuestionsSchema);

    // 2. Delete existing questions for this application
    await supabase
      .from('interview_questions')
      .delete()
      .eq('application_id', applicationId);

    // 3. Insert newly generated questions
    const insertPayload = generated.map((q) => ({
      application_id: applicationId,
      difficulty: q.difficulty,
      category: q.category,
      question: q.question,
      answer_guide: q.answer_guide,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('interview_questions')
      .insert(insertPayload)
      .select('*');

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    const resultQuestions: InterviewQuestion[] = (inserted || []).map((q) => ({
      id: q.id,
      application_id: q.application_id,
      difficulty: q.difficulty as 'beginner' | 'intermediate' | 'advanced',
      category: q.category as 'role' | 'project',
      question: q.question,
      answer_guide: q.answer_guide,
      created_at: q.created_at,
    }));

    resultQuestions.sort((a, b) => {
      const diffDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      if (diffDiff !== 0) return diffDiff;
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    });

    return {
      ok: true,
      data: {
        questions: resultQuestions,
        note: isMissingContext
          ? 'Generated from job requirements (assessment/resume data is still pending)'
          : undefined,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate interview questions';
    return { ok: false, error: message };
  }
}

export async function updateQuestion(
  id: string,
  data: {
    question: string;
    answer_guide: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }
): Promise<ActionResult<InterviewQuestion>> {
  try {
    await requireRole('recruiter');

    if (!id) {
      return { ok: false, error: 'Question ID is required' };
    }

    const validated = updateQuestionSchema.safeParse(data);
    if (!validated.success) {
      return { ok: false, error: validated.error.issues[0]?.message || 'Invalid question data' };
    }

    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from('interview_questions')
      .update({
        question: validated.data.question,
        answer_guide: validated.data.answer_guide,
        difficulty: validated.data.difficulty,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      return { ok: false, error: error?.message || 'Failed to update question' };
    }

    return {
      ok: true,
      data: {
        id: updated.id,
        application_id: updated.application_id,
        difficulty: updated.difficulty as 'beginner' | 'intermediate' | 'advanced',
        category: updated.category as 'role' | 'project',
        question: updated.question,
        answer_guide: updated.answer_guide,
        created_at: updated.created_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update question';
    return { ok: false, error: message };
  }
}

export async function deleteQuestion(
  id: string
): Promise<ActionResult<{ success: true }>> {
  try {
    await requireRole('recruiter');

    if (!id) {
      return { ok: false, error: 'Question ID is required' };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('interview_questions')
      .delete()
      .eq('id', id);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: { success: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete question';
    return { ok: false, error: message };
  }
}

export async function regenerateQuestion(
  id: string
): Promise<ActionResult<InterviewQuestion>> {
  try {
    await requireRole('recruiter');

    if (!id) {
      return { ok: false, error: 'Question ID is required' };
    }

    const supabase = await createClient();

    // 1. Fetch current question
    const { data: currentQuestion, error: fetchError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentQuestion) {
      return { ok: false, error: fetchError?.message || 'Question not found' };
    }

    // 2. Fetch sibling questions for the same application
    const { data: siblings } = await supabase
      .from('interview_questions')
      .select('question')
      .eq('application_id', currentQuestion.application_id)
      .neq('id', id);

    const siblingQuestionsList = (siblings || []).map((s) => `- ${s.question}`).join('\n');

    const prompt = `You are replacing a single interview question for a candidate.
Target Difficulty: ${currentQuestion.difficulty}
Target Category: ${currentQuestion.category}

Existing questions already used for this interview that you MUST NOT repeat or duplicate:
${siblingQuestionsList}

Generate ONE high-quality replacement interview question of difficulty "${currentQuestion.difficulty}" and category "${currentQuestion.category}".
Provide a clear question and a concise answer_guide explaining what a strong answer contains.

Return JSON in this exact shape:
{
  "difficulty": "${currentQuestion.difficulty}",
  "category": "${currentQuestion.category}",
  "question": "string",
  "answer_guide": "string"
}`;

    const singleSchema = questionItemSchema;
    const replacement = await generateJSON(prompt, singleSchema);

    // 3. Update the question row
    const { data: updated, error: updateError } = await supabase
      .from('interview_questions')
      .update({
        question: replacement.question,
        answer_guide: replacement.answer_guide,
        category: replacement.category,
        difficulty: replacement.difficulty,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return { ok: false, error: updateError?.message || 'Failed to update replacement question' };
    }

    return {
      ok: true,
      data: {
        id: updated.id,
        application_id: updated.application_id,
        difficulty: updated.difficulty as 'beginner' | 'intermediate' | 'advanced',
        category: updated.category as 'role' | 'project',
        question: updated.question,
        answer_guide: updated.answer_guide,
        created_at: updated.created_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to regenerate question';
    return { ok: false, error: message };
  }
}
