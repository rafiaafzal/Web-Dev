'use server';

export const maxDuration = 60;

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';
import { embed, generateJSON } from '@/lib/ai/gemini';
import { normalizeSkill } from '@/lib/ai/normalize';
import { verifyParsedResume, verifyExcerpt } from '@/lib/ai/verify';
import {
  SCORING_WEIGHTS,
  SIMILARITY_LOW,
  SIMILARITY_HIGH,
  mapSimilarity,
  cosineSimilarity,
} from '@/lib/ai/config';
import type { ActionResult, Assessment, ApplicationStatus } from '@/types/core';

const explanationSchema = z.object({
  qualification_score: z.number().min(0).max(100).default(70),
  qualification_reason: z.string().default(''),
  summary: z.string().default('Candidate profile reviewed against job requirements.'),
  learning_suggestions: z.array(z.string()).default([]),
  gap_explanations: z
    .array(
      z.object({
        skill: z.string(),
        explicit_absence_quote: z.string().nullable().default(null),
        note: z.string().default('Missing evidence in resume'),
      })
    )
    .default([]),
});

type JobSkill = {
  name: string;
  importance: 1 | 2 | 3 | 4 | 5;
  required: boolean;
};

export async function runAssessment(
  applicationId: string,
  skillOverrides?: { name: string; present: boolean }[]
): Promise<ActionResult<Assessment>> {
  try {
    // 1. Fetch application, job, and resume
    const { data: app, error: appErr } = await adminClient
      .from('applications')
      .select('*, job:jobs(*), resume:resumes(*)')
      .eq('id', applicationId)
      .single();

    if (appErr || !app || !app.job || !app.resume) {
      return { ok: false, error: 'Application, job or resume not found' };
    }

    const job = app.job;
    const resume = app.resume;
    const parsed = resume.parsed || {};
    const rawText = resume.raw_text || '';

    // Anonymized candidate data (fairness/privacy: NO name, email, phone, gender, age)
    const verifiedSkills: { name: string; excerpt: string; verified: boolean }[] =
      (parsed.skills || []).filter((s: { verified?: boolean }) => s.verified !== false);

    const candidateYears: number = Number(parsed.total_experience_years || 0);
    const candidateProjects = parsed.projects || [];
    const candidateEducation = parsed.education || [];

    // Collect all unsupported claims (skills, experience, projects, education)
    const { unsupportedClaims } = verifyParsedResume(rawText, parsed);

    // 2. Fetch candidate chunks
    const { data: chunks } = await adminClient
      .from('resume_chunks')
      .select('id, kind, content, embedding')
      .eq('resume_id', resume.id);

    const validChunks = (chunks || []).filter(
      (c) => c.embedding && Array.isArray(c.embedding)
    );

    // 3. Process job skills
    const rawJobSkills = (Array.isArray(job.skills) ? job.skills : []) as JobSkill[];
    const jobSkills: JobSkill[] =
      rawJobSkills.length > 0
        ? rawJobSkills
        : [{ name: job.title, importance: 3, required: true }];

    // Embed job skills for semantic matching
    const skillNames = jobSkills.map((s) => s.name);
    let skillEmbeddings: number[][] = [];
    try {
      skillEmbeddings = await embed(skillNames);
    } catch (e) {
      console.warn('Embedding call failed for skills, falling back to exact match:', e);
      skillEmbeddings = skillNames.map(() => []);
    }

    // Embed job description for projects matching
    let jobDescEmbedding: number[] = [];
    try {
      const descTexts = [`${job.title}. ${job.description}`];
      const descEmbeds = await embed(descTexts);
      jobDescEmbedding = descEmbeds[0] || [];
    } catch (e) {
      console.warn('Embedding call failed for job description:', e);
    }

    // 4. Skills Scoring (50%)
    const matchedSkills: { skill: string; similarity: number; excerpt: string }[] = [];
    const gaps: { skill: string; status: 'missing_evidence' | 'confirmed_absent'; note: string }[] = [];

    let weightedMatchSum = 0;
    let totalImportance = 0;

    for (let i = 0; i < jobSkills.length; i++) {
      const jSkill = jobSkills[i];
      const jNorm = normalizeSkill(jSkill.name).toLowerCase();
      const importance = jSkill.importance || 3;
      totalImportance += importance;

      // Check recruiter override first if provided
      const override = skillOverrides?.find(
        (o) => o.name.toLowerCase() === jSkill.name.toLowerCase()
      );

      if (override !== undefined) {
        if (override.present) {
          weightedMatchSum += importance * 1.0;
          matchedSkills.push({
            skill: jSkill.name,
            similarity: 1.0,
            excerpt: 'Recruiter verified skill presence',
          });
          continue;
        } else {
          gaps.push({
            skill: jSkill.name,
            status: 'confirmed_absent',
            note: 'Recruiter confirmed skill is absent',
          });
          continue;
        }
      }

      // Check exact normalized match against candidate verified skills
      const exactSkill = verifiedSkills.find(
        (cs) => normalizeSkill(cs.name).toLowerCase() === jNorm
      );

      if (exactSkill) {
        weightedMatchSum += importance * 1.0;
        matchedSkills.push({
          skill: jSkill.name,
          similarity: 1.0,
          excerpt: exactSkill.excerpt || `Exact match in skills list: ${exactSkill.name}`,
        });
        continue;
      }

      // Semantic matching with candidate chunks
      const sEmbedding = skillEmbeddings[i];
      let bestSim = 0;
      let bestExcerpt = '';

      if (sEmbedding && sEmbedding.length > 0 && validChunks.length > 0) {
        for (const chunk of validChunks) {
          const sim = cosineSimilarity(sEmbedding, chunk.embedding);
          if (sim > bestSim) {
            bestSim = sim;
            bestExcerpt = chunk.content;
          }
        }
      }

      const match = mapSimilarity(bestSim, SIMILARITY_LOW, SIMILARITY_HIGH);
      weightedMatchSum += importance * match;

      if (match >= 0.5) {
        matchedSkills.push({
          skill: jSkill.name,
          similarity: Math.round(bestSim * 100) / 100,
          excerpt: bestExcerpt.slice(0, 200),
        });
      } else if (jSkill.required) {
        gaps.push({
          skill: jSkill.name,
          status: 'missing_evidence',
          note: `Required skill score ${Math.round(match * 100)}% is below threshold (best similarity: ${Math.round(bestSim * 100)}%)`,
        });
      }
    }

    const skillsScore = totalImportance > 0
      ? Math.min(100, Math.max(0, Math.round((weightedMatchSum / totalImportance) * 100)))
      : 100;

    // 5. Experience Scoring (25%)
    const minYears = Number(job.min_experience_years || 0);
    const expScore =
      minYears <= 0
        ? 100
        : Math.min(100, Math.round((candidateYears / minYears) * 100));

    // 6. Projects Scoring (15%)
    let projectsScore = 50;
    if (jobDescEmbedding.length > 0 && validChunks.length > 0) {
      const projChunks = validChunks.filter(
        (c) => c.kind === 'project' || c.kind === 'experience'
      );
      const targetChunks = projChunks.length > 0 ? projChunks : validChunks;

      const similarities = targetChunks
        .map((c) => cosineSimilarity(jobDescEmbedding, c.embedding))
        .sort((a, b) => b - a);

      const top1 = similarities[0] || 0;
      const top2 = similarities[1] || similarities[0] || 0;

      const m1 = mapSimilarity(top1, SIMILARITY_LOW, SIMILARITY_HIGH);
      const m2 = mapSimilarity(top2, SIMILARITY_LOW, SIMILARITY_HIGH);
      projectsScore = Math.round(((m1 + m2) / 2) * 100);
    }

    // 7. Qualifications & Explanations (10%) via Gemini
    const anonymizedPrompt = `You are a recruitment assessment AI. Evaluate candidate qualifications and evidence strictly on objective merit.
Do not consider gender, age, nationality, name or background.

JOB REQUIREMENTS:
Title: ${job.title}
Required Experience: ${job.min_experience_years || 0} years
Qualifications desired: ${job.qualifications || 'Relevant technical background'}
Required Skills: ${jobSkills.map((s) => `${s.name} (Importance ${s.importance})`).join(', ')}

CANDIDATE OBJECTIVE EVIDENCE:
Verified Skills: ${verifiedSkills.map((s) => s.name).join(', ')}
Total Years of Experience: ${candidateYears} years
Education Degrees: ${candidateEducation.map((e: { degree: string; institution: string }) => `${e.degree} at ${e.institution}`).join('; ')}
Projects: ${candidateProjects.map((p: { name: string; tech: string[]; description: string }) => `${p.name} using [${(p.tech || []).join(', ')}]: ${p.description}`).join('; ')}

Identified Gaps: ${gaps.map((g) => g.skill).join(', ') || 'None'}

TASKS:
1. Score qualifications from 0 to 100 with clear justification.
2. Provide a concise, evidence-based summary of the candidate's alignment.
3. Suggest 2-3 specific learning suggestions for the missing or weak areas.
4. For each identified gap, state if there is any explicit quote indicating absent experience or if it is purely missing evidence.`;

    let qualScore = 75;
    let summary = 'Candidate profile matches the core requirements for the role.';
    let learningSuggestions: string[] = ['Deepen hands-on experience in required technical stack.'];

    try {
      const explanation = await generateJSON(anonymizedPrompt, explanationSchema);
      qualScore = explanation.qualification_score;
      summary = explanation.summary;
      learningSuggestions = explanation.learning_suggestions;

      // Check explicit absence quotes against raw text to promote to confirmed_absent
      if (explanation.gap_explanations) {
        for (const ge of explanation.gap_explanations) {
          const gapItem = gaps.find((g) => g.skill.toLowerCase() === ge.skill.toLowerCase());
          if (gapItem && ge.explicit_absence_quote) {
            const isQuotedInText = verifyExcerpt(rawText, ge.explicit_absence_quote);
            if (isQuotedInText) {
              gapItem.status = 'confirmed_absent';
              gapItem.note = `Explicitly stated in resume: "${ge.explicit_absence_quote}"`;
            }
          }
        }
      }
    } catch (aiErr) {
      console.warn('AI explanation call fallback:', aiErr);
    }

    // 8. Total Score (50% skills, 25% experience, 15% projects, 10% qualifications)
    const totalScore = Math.round(
      SCORING_WEIGHTS.skills * skillsScore +
        SCORING_WEIGHTS.experience * expScore +
        SCORING_WEIGHTS.projects * projectsScore +
        SCORING_WEIGHTS.qualifications * qualScore
    );

    const assessment: Assessment = {
      total_score: totalScore,
      breakdown: {
        skills: skillsScore,
        experience: expScore,
        projects: projectsScore,
        qualifications: qualScore,
      },
      matched_skills: matchedSkills,
      gaps,
      summary,
      learning_suggestions: learningSuggestions,
      unsupported_claims: unsupportedClaims,
    };

    // Save assessment to database
    await adminClient.from('assessments').upsert({
      application_id: applicationId,
      total_score: totalScore,
      breakdown: assessment.breakdown,
      details: {
        matched_skills: assessment.matched_skills,
        gaps: assessment.gaps,
        summary: assessment.summary,
        learning_suggestions: assessment.learning_suggestions,
        unsupported_claims: assessment.unsupported_claims,
      },
    });

    return { ok: true, data: assessment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Assessment computation failed';
    return { ok: false, error: message };
  }
}

export async function getAssessment(
  applicationId: string
): Promise<ActionResult<Assessment | null>> {
  try {
    await requireRole('recruiter');

    const { data, error } = await adminClient
      .from('assessments')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!data) {
      return { ok: true, data: null };
    }

    const details = data.details || {};
    const assessment: Assessment = {
      total_score: Number(data.total_score),
      breakdown: data.breakdown || { skills: 0, experience: 0, projects: 0, qualifications: 0 },
      matched_skills: details.matched_skills || [],
      gaps: details.gaps || [],
      summary: details.summary || '',
      learning_suggestions: details.learning_suggestions || [],
      unsupported_claims: details.unsupported_claims || [],
    };

    return { ok: true, data: assessment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve assessment';
    return { ok: false, error: message };
  }
}

export async function rerunAssessment(
  applicationId: string
): Promise<ActionResult<Assessment>> {
  await requireRole('recruiter');
  return runAssessment(applicationId);
}

export async function correctSkills(
  applicationId: string,
  overrides: { name: string; present: boolean }[]
): Promise<ActionResult<Assessment>> {
  await requireRole('recruiter');
  return runAssessment(applicationId, overrides);
}
