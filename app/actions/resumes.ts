'use server';

import { z } from 'zod';
import { extractText } from 'unpdf';
import { requireRole } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, embed } from '@/lib/ai/gemini';
import { normalizeSkill } from '@/lib/ai/normalize';
import { verifyParsedResume } from '@/lib/ai/verify';
import type { ActionResult, ParsedResume, Resume } from '@/types/core';

const parsedResumeSchema = z.object({
  name: z.string().default('Candidate'),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  skills: z
    .array(
      z.object({
        name: z.string(),
        excerpt: z.string().default(''),
        verified: z.boolean().default(false),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(''),
        institution: z.string().default(''),
        year: z.string().nullable().default(null),
        excerpt: z.string().default(''),
      })
    )
    .default([]),
  experience: z
    .array(
      z.object({
        title: z.string().default(''),
        company: z.string().default(''),
        years: z.number().default(0),
        summary: z.string().default(''),
        excerpt: z.string().default(''),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(''),
        description: z.string().default(''),
        tech: z.array(z.string()).default([]),
        excerpt: z.string().default(''),
      })
    )
    .default([]),
  total_experience_years: z.number().default(0),
});

export async function uploadResume(
  formData: FormData
): Promise<ActionResult<Resume>> {
  try {
    const user = await requireRole('candidate');
    const file = formData.get('file') as File | null;

    if (!file) {
      return { ok: false, error: 'No resume file provided' };
    }

    if (file.size > 4 * 1024 * 1024) {
      return { ok: false, error: 'File size exceeds 4 MB limit' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x25 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x44 ||
      buffer[3] !== 0x46
    ) {
      return {
        ok: false,
        error: 'Invalid file format. Please upload a valid PDF document.',
      };
    }

    // Upload to private storage bucket 'resumes' under <candidate_id>/<filename>
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${user.id}/${safeName}`;

    const { error: uploadError } = await adminClient.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage bucket upload warning:', uploadError.message);
    }

    // 2. Extract text using unpdf
    let rawText = '';
    try {
      const extracted = await extractText(new Uint8Array(buffer));
      rawText = Array.isArray(extracted.text)
        ? extracted.text.join('\n')
        : String(extracted.text || '');
    } catch (extractErr: unknown) {
      const msg =
        extractErr instanceof Error ? extractErr.message : 'PDF extraction error';

      const { data: failedRow } = await adminClient
        .from('resumes')
        .insert({
          candidate_id: user.id,
          file_name: file.name,
          file_path: filePath,
          raw_text: '',
          status: 'failed',
          error: `Corrupt or unreadable PDF: ${msg}`,
        })
        .select()
        .single();

      return {
        ok: false,
        error:
          'Failed to read the PDF. The file might be corrupted or password-protected.',
      };
    }

    // If under ~50 characters -> scanned or empty
    if (rawText.trim().length < 50) {
      const { data: emptyRow } = await adminClient
        .from('resumes')
        .insert({
          candidate_id: user.id,
          file_name: file.name,
          file_path: filePath,
          raw_text: rawText,
          status: 'empty',
          error:
            'Resume text is empty or image-only scanned document. Please upload a text-based PDF or fill details manually.',
        })
        .select()
        .single();

      return {
        ok: true,
        data: emptyRow as Resume,
      };
    }

    // 3. Gemini JSON extraction
    const prompt = `You are an expert recruitment AI resume parser.
Extract structured information from the following resume text.
Rules:
1. Extract all technical skills and soft skills. For each skill, include the EXACT sentence or phrase excerpt from the resume text where it appears.
2. Extract work experience history with exact excerpt quotes.
3. Extract projects, tech stack used, and exact excerpt quotes.
4. Extract degrees, institutions, and graduation years with excerpts.
5. Compute total years of professional experience accurately.
6. Crucial: All 'excerpt' fields MUST be exact verbatim quotes from the text.

Resume Text:
---
${rawText}
---`;

    const rawParsed = await generateJSON<ParsedResume>(
      prompt,
      parsedResumeSchema
    );

    // 4. Normalize skills via alias map and deduplicate
    const normalizedSkills = rawParsed.skills.map((s) => ({
      ...s,
      name: normalizeSkill(s.name),
    }));

    // Dedupe normalized skills
    const seenSkill = new Set<string>();
    const dedupedSkills: typeof normalizedSkills = [];
    for (const s of normalizedSkills) {
      const key = s.name.toLowerCase();
      if (!seenSkill.has(key)) {
        seenSkill.add(key);
        dedupedSkills.push(s);
      }
    }

    // 5. Hallucination check
    const intermediateParsed: ParsedResume = {
      ...rawParsed,
      skills: dedupedSkills,
    };
    const { verifiedResume } = verifyParsedResume(rawText, intermediateParsed);

    // Insert resume record
    const { data: resumeRow, error: insertError } = await adminClient
      .from('resumes')
      .insert({
        candidate_id: user.id,
        file_name: file.name,
        file_path: filePath,
        raw_text: rawText,
        parsed: verifiedResume,
        status: 'parsed',
        error: null,
      })
      .select()
      .single();

    if (insertError || !resumeRow) {
      return {
        ok: false,
        error: insertError?.message || 'Failed to save resume record',
      };
    }

    // 6. Chunk and embed in ONE batched call
    type ChunkItem = {
      kind: 'skill' | 'experience' | 'project' | 'education' | 'summary';
      content: string;
    };

    const chunkItems: ChunkItem[] = [];

    // Summary chunk
    chunkItems.push({
      kind: 'summary',
      content: `Candidate: ${verifiedResume.name}. Total Experience: ${verifiedResume.total_experience_years} years. Skills: ${verifiedResume.skills.map((s) => s.name).join(', ')}.`,
    });

    // Skill chunks
    for (const s of verifiedResume.skills) {
      chunkItems.push({
        kind: 'skill',
        content: `Skill: ${s.name}. Excerpt: ${s.excerpt}`,
      });
    }

    // Experience chunks
    for (const exp of verifiedResume.experience) {
      chunkItems.push({
        kind: 'experience',
        content: `Experience: ${exp.title} at ${exp.company} (${exp.years} years). ${exp.summary}. Excerpt: ${exp.excerpt}`,
      });
    }

    // Project chunks
    for (const proj of verifiedResume.projects) {
      chunkItems.push({
        kind: 'project',
        content: `Project: ${proj.name}. Technologies: ${proj.tech.join(', ')}. ${proj.description}. Excerpt: ${proj.excerpt}`,
      });
    }

    // Education chunks
    for (const edu of verifiedResume.education) {
      chunkItems.push({
        kind: 'education',
        content: `Education: ${edu.degree} at ${edu.institution} (${edu.year || 'N/A'}). Excerpt: ${edu.excerpt}`,
      });
    }

    // Batched embedding call
    try {
      const textsToEmbed = chunkItems.map((c) => c.content);
      const embeddings = await embed(textsToEmbed);

      const chunkRows = chunkItems.map((item, idx) => ({
        resume_id: resumeRow.id,
        kind: item.kind,
        content: item.content,
        embedding: embeddings[idx] || null,
      }));

      // Delete old chunks for this resume if any, then insert new
      await adminClient
        .from('resume_chunks')
        .delete()
        .eq('resume_id', resumeRow.id);

      await adminClient.from('resume_chunks').insert(chunkRows);
    } catch (embedErr) {
      console.error('Error generating chunks/embeddings:', embedErr);
    }

    return {
      ok: true,
      data: resumeRow as Resume,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown resume upload error';
    return { ok: false, error: message };
  }
}

export async function getMyResume(): Promise<ActionResult<Resume | null>> {
  try {
    const user = await requireRole('candidate');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Resume | null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch resume';
    return { ok: false, error: message };
  }
}

export async function updateParsedResume(
  updatedParsed: ParsedResume
): Promise<ActionResult<Resume>> {
  try {
    const user = await requireRole('candidate');
    const supabase = await createClient();

    // Find latest resume
    const { data: existing, error: fetchErr } = await supabase
      .from('resumes')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchErr || !existing) {
      return { ok: false, error: 'No resume found to update' };
    }

    // Validate schema
    const parsedValid = parsedResumeSchema.safeParse(updatedParsed);
    if (!parsedValid.success) {
      return {
        ok: false,
        error: parsedValid.error.issues.map((i) => i.message).join(', '),
      };
    }

    // Re-verify against raw text
    const { verifiedResume } = verifyParsedResume(
      existing.raw_text || '',
      parsedValid.data
    );

    const { data: updated, error: updateErr } = await adminClient
      .from('resumes')
      .update({
        parsed: verifiedResume,
        status: 'parsed',
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      return { ok: false, error: updateErr.message };
    }

    return { ok: true, data: updated as Resume };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update resume fields';
    return { ok: false, error: message };
  }
}

export async function getResumeForApplication(
  applicationId: string
): Promise<ActionResult<{ resume: Resume | null; rawText: string | null }>> {
  try {
    // Both recruiter and candidate can read their application's resume
    const { data: app, error: appErr } = await adminClient
      .from('applications')
      .select('resume_id')
      .eq('id', applicationId)
      .single();

    if (appErr || !app?.resume_id) {
      return { ok: false, error: 'Application or resume not found' };
    }

    const { data: resume, error: resErr } = await adminClient
      .from('resumes')
      .select('*')
      .eq('id', app.resume_id)
      .single();

    if (resErr || !resume) {
      return { ok: false, error: 'Resume not found' };
    }

    return {
      ok: true,
      data: {
        resume: resume as Resume,
        rawText: resume.raw_text || null,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch application resume';
    return { ok: false, error: message };
  }
}
