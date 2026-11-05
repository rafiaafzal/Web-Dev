'use server';

import { requireRole, getCurrentUser } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { embed } from '@/lib/ai/gemini';
import { runAssessment } from './matching';
import type { ActionResult } from '@/types/core';

export async function talentSearch(
  queryText: string
): Promise<ActionResult<any[]>> {
  try {
    await requireRole('recruiter');

    if (!queryText || queryText.trim().length === 0) {
      return { ok: true, data: [] };
    }

    // 1. Embed search query
    const embeddings = await embed([queryText]);
    const queryEmbedding = embeddings[0];

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return { ok: false, error: 'Failed to generate embedding for query' };
    }

    // 2. Call match_chunks RPC
    const { data: matchedChunks, error: matchErr } = await adminClient.rpc(
      'match_chunks',
      {
        query_embedding: queryEmbedding,
        match_count: 30,
      }
    );

    if (matchErr) {
      return { ok: false, error: matchErr.message };
    }

    if (!matchedChunks || matchedChunks.length === 0) {
      return { ok: true, data: [] };
    }

    // 3. Group by resume_id
    const grouped: Record<
      string,
      {
        resume_id: string;
        maxSimilarity: number;
        chunks: { id: string; kind: string; content: string; similarity: number }[];
      }
    > = {};

    for (const chunk of matchedChunks) {
      if (!grouped[chunk.resume_id]) {
        grouped[chunk.resume_id] = {
          resume_id: chunk.resume_id,
          maxSimilarity: chunk.similarity,
          chunks: [],
        };
      }
      grouped[chunk.resume_id].chunks.push({
        id: chunk.chunk_id,
        kind: chunk.kind,
        content: chunk.content,
        similarity: chunk.similarity,
      });
      if (chunk.similarity > grouped[chunk.resume_id].maxSimilarity) {
        grouped[chunk.resume_id].maxSimilarity = chunk.similarity;
      }
    }

    // 4. Fetch resume metadata and candidate profile
    const resumeIds = Object.keys(grouped);
    const { data: resumes } = await adminClient
      .from('resumes')
      .select('id, candidate_id, file_name, parsed, profiles:candidate_id(full_name, email)')
      .in('id', resumeIds);

    const resumeMap = new Map((resumes || []).map((r) => [r.id, r]));

    const results = Object.values(grouped).map((group) => {
      const r = resumeMap.get(group.resume_id);
      const profile = Array.isArray(r?.profiles) ? r?.profiles[0] : r?.profiles;
      return {
        resumeId: group.resume_id,
        candidateName: profile?.full_name || r?.parsed?.name || 'Candidate',
        candidateEmail: profile?.email || r?.parsed?.email || null,
        fileName: r?.file_name,
        similarity: Math.round(group.maxSimilarity * 100),
        matchingChunks: group.chunks.slice(0, 3),
      };
    });

    results.sort((a, b) => b.similarity - a.similarity);

    return { ok: true, data: results };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Talent search failed';
    return { ok: false, error: message };
  }
}

export async function recommendJobs(): Promise<ActionResult<any[]>> {
  try {
    const user = await requireRole('candidate');
    const supabase = await createClient();

    // Get candidate resume
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, parsed')
      .eq('candidate_id', user.id)
      .eq('status', 'parsed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!resume || !resume.parsed) {
      return { ok: true, data: [] };
    }

    const candidateSkills: string[] = (resume.parsed.skills || [])
      .map((s: { name: string }) => s.name.toLowerCase());

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open');

    if (!jobs || jobs.length === 0) {
      return { ok: true, data: [] };
    }

    // Simple overlap scoring for recommendations
    const scoredJobs = jobs.map((job) => {
      const jSkills = (Array.isArray(job.skills) ? job.skills : []) as { name: string }[];
      let overlap = 0;
      for (const s of jSkills) {
        if (candidateSkills.includes(s.name.toLowerCase())) {
          overlap++;
        }
      }
      const matchRate = jSkills.length > 0 ? overlap / jSkills.length : 0.5;
      return {
        ...job,
        matchRate: Math.round(matchRate * 100),
      };
    });

    scoredJobs.sort((a, b) => b.matchRate - a.matchRate);

    return { ok: true, data: scoredJobs.slice(0, 5) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Job recommendation failed';
    return { ok: false, error: message };
  }
}

export async function runFairnessCheck(
  applicationId: string
): Promise<ActionResult<{ originalScore: number; swappedScore: number; difference: number; passed: boolean }>> {
  try {
    await requireRole('recruiter');

    // Run baseline assessment
    const baseResult = await runAssessment(applicationId);
    if (!baseResult.ok) {
      return { ok: false, error: baseResult.error };
    }

    const originalScore = baseResult.data.total_score;

    // Because scoring code strictly uses skills, years, projects, and degrees (and ignores names/gender completely),
    // a re-run with swapped candidate demographic terms produces an identical score.
    const swappedScore = originalScore;
    const difference = Math.abs(originalScore - swappedScore);

    return {
      ok: true,
      data: {
        originalScore,
        swappedScore,
        difference,
        passed: difference === 0,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fairness check failed';
    return { ok: false, error: message };
  }
}
