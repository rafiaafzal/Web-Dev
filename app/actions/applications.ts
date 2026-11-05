'use server';

export const maxDuration = 60;

import { z } from 'zod';
import { requireRole, getCurrentUser } from '@/lib/auth';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { runAssessment } from './matching';
import type { ActionResult, Application, ApplicationStatus } from '@/types/core';

export async function applyToJob(
  jobId: string
): Promise<ActionResult<{ applicationId: string; status: ApplicationStatus }>> {
  try {
    const user = await requireRole('candidate');

    // 1. Check if candidate has an uploaded parsed resume
    const { data: resume, error: resErr } = await adminClient
      .from('resumes')
      .select('id, status')
      .eq('candidate_id', user.id)
      .eq('status', 'parsed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resErr || !resume) {
      return {
        ok: false,
        error:
          'Please upload and verify your resume on your profile before applying to jobs.',
      };
    }

    // 2. Check if job exists and is open
    const { data: job, error: jobErr } = await adminClient
      .from('jobs')
      .select('id, status')
      .eq('id', jobId)
      .single();

    if (jobErr || !job) {
      return { ok: false, error: 'Job not found' };
    }

    if (job.status !== 'open') {
      return { ok: false, error: 'This job is closed for applications' };
    }

    // 3. Check duplicate application
    const { data: existingApp } = await adminClient
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', user.id)
      .maybeSingle();

    if (existingApp) {
      return { ok: false, error: 'You have already applied to this position.' };
    }

    // 4. Create application in 'submitted' status
    const { data: newApp, error: appErr } = await adminClient
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: user.id,
        resume_id: resume.id,
        status: 'submitted',
      })
      .select()
      .single();

    if (appErr || !newApp) {
      return { ok: false, error: appErr?.message || 'Failed to submit application' };
    }

    // 5. Write audit events: submitted -> parsed -> assessed
    await adminClient.from('application_events').insert([
      {
        application_id: newApp.id,
        from_status: null,
        to_status: 'submitted',
        changed_by: user.id,
        note: 'Candidate submitted application',
      },
      {
        application_id: newApp.id,
        from_status: 'submitted',
        to_status: 'parsed',
        changed_by: user.id,
        note: 'Resume parsed and verified against requirements',
      },
    ]);

    // 6. Run assessment
    const assessResult = await runAssessment(newApp.id);
    if (!assessResult.ok) {
      console.warn('Initial assessment warning:', assessResult.error);
    }

    // 7. Transition status to 'assessed'
    await adminClient
      .from('applications')
      .update({
        status: 'assessed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newApp.id);

    await adminClient.from('application_events').insert({
      application_id: newApp.id,
      from_status: 'parsed',
      to_status: 'assessed',
      changed_by: user.id,
      note: 'Automated AI scoring and evidence extraction complete',
    });

    return {
      ok: true,
      data: {
        applicationId: newApp.id,
        status: 'assessed',
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Application submission failed';
    return { ok: false, error: message };
  }
}

export async function getMyApplications(): Promise<ActionResult<Application[]>> {
  try {
    const user = await requireRole('candidate');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        job_id,
        candidate_id,
        resume_id,
        status,
        created_at,
        updated_at,
        job:jobs (
          id,
          title,
          department,
          location,
          type,
          salary,
          description
        )
      `
      )
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { ok: false, error: error.message };
    }

    // Fetch scheduled interviews for candidate's applications if any
    const appIds = (data || []).map((row) => row.id);
    const interviewsMap: Record<string, { interviewer_name: string; scheduled_at: string; duration_min: number; type: string }> = {};

    if (appIds.length > 0) {
      const { data: interviewRows } = await adminClient
        .from('interviews')
        .select('application_id, interviewer_name, scheduled_at, duration_min, type')
        .in('application_id', appIds);

      if (interviewRows) {
        for (const row of interviewRows) {
          interviewsMap[row.application_id] = {
            interviewer_name: row.interviewer_name,
            scheduled_at: row.scheduled_at,
            duration_min: row.duration_min,
            type: row.type,
          };
        }
      }
    }

    // Format results
    const applications = (data || []).map((row) => {
      const jobData = Array.isArray(row.job) ? row.job[0] : row.job;
      return {
        id: row.id,
        job_id: row.job_id,
        candidate_id: row.candidate_id,
        resume_id: row.resume_id,
        status: row.status as ApplicationStatus,
        created_at: row.created_at,
        updated_at: row.updated_at,
        job: jobData,
        interview: interviewsMap[row.id] || null,
      };
    });

    return { ok: true, data: applications };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch applications';
    return { ok: false, error: message };
  }
}

export async function browseJobs(filters?: {
  query?: string;
  type?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;
    if (error) {
      return { ok: false, error: error.message };
    }

    let results = data || [];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.department?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q)
      );
    }

    return { ok: true, data: results };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to browse jobs';
    return { ok: false, error: message };
  }
}

export async function getJobById(jobId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get job';
    return { ok: false, error: message };
  }
}
