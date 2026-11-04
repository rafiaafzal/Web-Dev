'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import type { ActionResult, ApplicationStatus, Assessment, ParsedResume } from '@/types/core';
import type { ComparisonData, ComparedCandidate, DuplicatePair, SkillRequirement } from '@/types/recruiter';

const compareIdsSchema = z
  .array(z.string().uuid('Invalid application ID'))
  .min(2, 'Please select at least 2 candidates to compare')
  .max(4, 'You can compare at most 4 candidates at once');

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;
  let [local, domain] = parts;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0].replace(/\./g, '');
    domain = 'gmail.com';
  } else {
    local = local.split('+')[0];
  }
  return `${local}@${domain}`;
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return digits.slice(-10);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function parseEmbedding(raw: unknown): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as number[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as number[];
    } catch {
      return null;
    }
  }
  return null;
}

export async function compareApplications(
  ids: string[]
): Promise<ActionResult<ComparisonData>> {
  try {
    await requireRole('recruiter');

    const validation = compareIdsSchema.safeParse(ids);
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message || 'Invalid candidate selection' };
    }

    const validIds = validation.data;
    const supabase = await createClient();

    const { data: apps, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        job:jobs (*),
        candidate:profiles!candidate_id (*),
        resume:resumes (*),
        assessment:assessments (*)
      `)
      .in('id', validIds);

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!apps || apps.length === 0) {
      return { ok: false, error: 'No matching applications found' };
    }

    // Preserve the order of requested ids
    const appMap = new Map(apps.map((a) => [a.id, a]));
    const orderedApps = validIds.map((id) => appMap.get(id)).filter(Boolean) as typeof apps;

    const firstJob = Array.isArray(orderedApps[0].job) ? orderedApps[0].job[0] : orderedApps[0].job;
    const jobSkills: SkillRequirement[] = firstJob?.skills || [];

    const candidates: ComparedCandidate[] = orderedApps.map((app) => {
      const candidateProfile = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
      const candidateName = candidateProfile?.full_name || 'Anonymous Candidate';

      const rawAssessment = Array.isArray(app.assessment) ? app.assessment[0] : app.assessment;
      let assessment: Assessment | null = null;
      if (rawAssessment) {
        const details = (rawAssessment.details as Partial<Assessment>) || {};
        assessment = {
          total_score: Number(rawAssessment.total_score ?? 0),
          breakdown: rawAssessment.breakdown,
          matched_skills: details.matched_skills || rawAssessment.matched_skills || [],
          gaps: details.gaps || rawAssessment.gaps || [],
          summary: details.summary || rawAssessment.summary || '',
          learning_suggestions: details.learning_suggestions || rawAssessment.learning_suggestions || [],
          unsupported_claims: details.unsupported_claims || rawAssessment.unsupported_claims || [],
        };
      }

      const rawResume = Array.isArray(app.resume) ? app.resume[0] : app.resume;
      const parsedResume: ParsedResume | null = rawResume?.parsed ? (rawResume.parsed as ParsedResume) : null;

      // Identify missing information:
      // Required job skills that have neither a matched skill nor a gap note in the assessment
      const missingInfo: string[] = [];
      const matchedNames = new Set(
        (assessment?.matched_skills || []).map((m) => m.skill.toLowerCase().trim())
      );
      const gapNames = new Set(
        (assessment?.gaps || []).map((g) => g.skill.toLowerCase().trim())
      );

      for (const skill of jobSkills) {
        const lowerName = skill.name.toLowerCase().trim();
        if (!matchedNames.has(lowerName) && !gapNames.has(lowerName)) {
          missingInfo.push(`Required: ${skill.name} (no evaluation data)`);
        }
      }

      const unverifiedSkills: string[] = [];
      for (const skill of parsedResume?.skills || []) {
        if (skill.verified === false) {
          unverifiedSkills.push(skill.name);
          missingInfo.push(`Unverified claim: ${skill.name}`);
        }
      }

      return {
        application_id: app.id,
        candidate_name: candidateName,
        status: app.status as ApplicationStatus,
        assessment,
        missing_information: missingInfo,
        unverified_skills: unverifiedSkills,
      };
    });

    return {
      ok: true,
      data: {
        job: firstJob
          ? {
              id: firstJob.id,
              title: firstJob.title,
              skills: jobSkills,
            }
          : null,
        candidates,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to compare candidates';
    return { ok: false, error: message };
  }
}

export async function findDuplicates(
  jobId: string
): Promise<ActionResult<DuplicatePair[]>> {
  try {
    await requireRole('recruiter');

    if (!jobId) {
      return { ok: false, error: 'Job ID is required' };
    }

    const supabase = await createClient();

    // Fetch applications for this job with candidate name, resume id, and parsed resume
    const { data: apps, error } = await supabase
      .from('applications')
      .select(`
        id,
        candidate:profiles!candidate_id (
          full_name
        ),
        resume:resumes (
          id,
          parsed
        )
      `)
      .eq('job_id', jobId);

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!apps || apps.length < 2) {
      return { ok: true, data: [] };
    }

    const resumeIds = apps
      .map((a) => {
        const res = Array.isArray(a.resume) ? a.resume[0] : a.resume;
        return res?.id;
      })
      .filter(Boolean) as string[];

    // Fetch summary embeddings from resume_chunks via admin client
    let summaryChunksMap = new Map<string, number[]>();
    if (resumeIds.length > 0) {
      try {
        const { data: chunks } = await adminClient
          .from('resume_chunks')
          .select('resume_id, embedding')
          .in('resume_id', resumeIds)
          .eq('kind', 'summary');

        if (chunks) {
          for (const c of chunks) {
            const vec = parseEmbedding(c.embedding);
            if (vec && vec.length > 0) {
              summaryChunksMap.set(c.resume_id, vec);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read summary embeddings for duplicates check:', err);
      }
    }

    const formattedApps = apps.map((app) => {
      const candidateProfile = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
      const candidateName = candidateProfile?.full_name || 'Anonymous Candidate';

      const res = Array.isArray(app.resume) ? app.resume[0] : app.resume;
      const parsed = res?.parsed as ParsedResume | null;

      const normEmail = normalizeEmail(parsed?.email);
      const normPhone = normalizePhone(parsed?.phone);
      const summaryEmbedding = res?.id ? summaryChunksMap.get(res.id) : null;

      return {
        id: app.id,
        candidateName,
        rawEmail: parsed?.email || null,
        rawPhone: parsed?.phone || null,
        normEmail,
        normPhone,
        summaryEmbedding,
      };
    });

    const duplicates: DuplicatePair[] = [];

    // Pairwise comparison
    for (let i = 0; i < formattedApps.length; i++) {
      for (let j = i + 1; j < formattedApps.length; j++) {
        const a = formattedApps[i];
        const b = formattedApps[j];
        const reasons: string[] = [];

        // Check (a): normalized email
        if (a.normEmail && b.normEmail && a.normEmail === b.normEmail) {
          reasons.push(`Matching email address (${a.rawEmail || a.normEmail})`);
        }

        // Check (a): normalized phone
        if (a.normPhone && b.normPhone && a.normPhone === b.normPhone) {
          reasons.push(`Matching phone number (${a.rawPhone || a.normPhone})`);
        }

        // Check (b): cosine similarity on summary chunk > 0.95
        if (a.summaryEmbedding && b.summaryEmbedding) {
          const sim = cosineSimilarity(a.summaryEmbedding, b.summaryEmbedding);
          if (sim > 0.95) {
            reasons.push(`High semantic similarity in resume summary (${Math.round(sim * 100)}%)`);
          }
        }

        if (reasons.length > 0) {
          duplicates.push({
            application_id: a.id,
            other_application_id: b.id,
            candidate_name: a.candidateName,
            other_candidate_name: b.candidateName,
            reasons,
          });
        }
      }
    }

    return { ok: true, data: duplicates };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to scan for duplicate applications';
    return { ok: false, error: message };
  }
}

export async function confirmDuplicate(
  applicationId: string,
  otherApplicationId: string
): Promise<ActionResult<{ success: true }>> {
  try {
    const user = await requireRole('recruiter');

    if (!applicationId || !otherApplicationId) {
      return { ok: false, error: 'Both application IDs are required' };
    }

    const supabase = await createClient();

    // Fetch names of both candidates
    const { data: apps } = await supabase
      .from('applications')
      .select('id, candidate:profiles!candidate_id(full_name)')
      .in('id', [applicationId, otherApplicationId]);

    let nameA = 'Candidate A';
    let nameB = 'Candidate B';

    if (apps) {
      for (const a of apps) {
        const prof = Array.isArray(a.candidate) ? a.candidate[0] : a.candidate;
        if (a.id === applicationId && prof?.full_name) nameA = prof.full_name;
        if (a.id === otherApplicationId && prof?.full_name) nameB = prof.full_name;
      }
    }

    // Insert private recruiter notes (NO auto-reject, NO merge, NO delete)
    await supabase.from('recruiter_notes').insert([
      {
        application_id: applicationId,
        recruiter_id: user.id,
        note: `Confirmed duplicate of ${nameB}. Human verified flag.`,
      },
      {
        application_id: otherApplicationId,
        recruiter_id: user.id,
        note: `Confirmed duplicate of ${nameA}. Human verified flag.`,
      },
    ]);

    return { ok: true, data: { success: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to confirm duplicate';
    return { ok: false, error: message };
  }
}

export async function dismissDuplicate(
  applicationId: string,
  otherApplicationId: string
): Promise<ActionResult<{ success: true }>> {
  try {
    const user = await requireRole('recruiter');

    if (!applicationId || !otherApplicationId) {
      return { ok: false, error: 'Both application IDs are required' };
    }

    const supabase = await createClient();

    await supabase.from('recruiter_notes').insert([
      {
        application_id: applicationId,
        recruiter_id: user.id,
        note: `Duplicate flag dismissed for comparison with application ${otherApplicationId}.`,
      },
      {
        application_id: otherApplicationId,
        recruiter_id: user.id,
        note: `Duplicate flag dismissed for comparison with application ${applicationId}.`,
      },
    ]);

    return { ok: true, data: { success: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to dismiss duplicate';
    return { ok: false, error: message };
  }
}
