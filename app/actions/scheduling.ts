'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { transition } from '@/lib/pipeline';
import { formatActionError } from '@/utils/with-retry';
import { notifyCandidate } from '@/utils/notify';
import type { ActionResult, ApplicationStatus } from '@/types/core';
import type { Interview, InterviewFeedback } from '@/types/recruiter';

export type ScheduledInterviewItem = Interview & {
  candidate_name: string;
  job_title: string;
  job_id: string;
  application_status: ApplicationStatus;
};

export type ScheduleResult =
  | { saved: false; conflict: string }
  | { saved: true; message: string; interview: Interview };

const scheduleInputSchema = z.object({
  application_id: z.string().uuid('Invalid application ID'),
  interviewer_name: z.string().trim().min(2, 'Interviewer name must be at least 2 characters'),
  scheduled_at: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid scheduled date/time'),
  duration_min: z.coerce.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 4 hours').default(45),
  type: z.enum(['technical', 'hr', 'managerial']),
  force: z.boolean().optional(),
});

const feedbackInputSchema = z.object({
  technical: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  problem_solving: z.coerce.number().min(1).max(5),
  recommendation: z.enum(['hire', 'hold', 'no_hire']),
  comments: z.string().trim().min(1, 'Comments are required'),
});

const decisionSchema = z.enum(['selected', 'rejected']);

function hasTimeOverlap(
  startA: Date,
  durationA: number,
  startB: Date,
  durationB: number
): boolean {
  const endA = new Date(startA.getTime() + durationA * 60000);
  const endB = new Date(startB.getTime() + durationB * 60000);
  return startA < endB && startB < endA;
}

export async function checkConflict(params: {
  applicationId: string;
  interviewer_name: string;
  scheduled_at: string;
  duration_min: number;
  excludeInterviewId?: string;
}): Promise<string | null> {
  const supabase = await createClient();

  const newStart = new Date(params.scheduled_at);
  const newDuration = params.duration_min;
  const targetInterviewer = params.interviewer_name.trim().toLowerCase();

  // 1. Get candidate_id for the current application
  const { data: currentApp } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('id', params.applicationId)
    .single();

  const currentCandidateId = currentApp?.candidate_id;

  // 2. Fetch all interviews with application candidate_id
  const { data: allInterviews } = await supabase
    .from('interviews')
    .select(`
      id,
      application_id,
      interviewer_name,
      scheduled_at,
      duration_min,
      application:applications!application_id (
        candidate_id,
        candidate:profiles!candidate_id (
          full_name
        )
      )
    `);

  if (!allInterviews || allInterviews.length === 0) {
    return null;
  }

  for (const interview of allInterviews) {
    if (params.excludeInterviewId && interview.id === params.excludeInterviewId) {
      continue;
    }

    const existStart = new Date(interview.scheduled_at);
    const existDuration = interview.duration_min || 45;

    if (hasTimeOverlap(newStart, newDuration, existStart, existDuration)) {
      const existInterviewer = (interview.interviewer_name || '').trim().toLowerCase();
      const appData = Array.isArray(interview.application)
        ? interview.application[0]
        : interview.application;
      const existCandidateId = appData?.candidate_id;
      const candidateProfile = Array.isArray(appData?.candidate)
        ? appData.candidate[0]
        : appData?.candidate;
      const existCandidateName = candidateProfile?.full_name || 'The candidate';

      // Conflict condition 1: Same interviewer (case-insensitive)
      if (existInterviewer && existInterviewer === targetInterviewer) {
        return `Scheduling conflict: ${params.interviewer_name} already has an interview scheduled on ${existStart.toLocaleDateString()} at ${existStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${existDuration} min).`;
      }

      // Conflict condition 2: Same candidate
      if (currentCandidateId && existCandidateId && currentCandidateId === existCandidateId) {
        return `Scheduling conflict: ${existCandidateName} already has an interview scheduled on ${existStart.toLocaleDateString()} at ${existStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${existDuration} min).`;
      }
    }
  }

  return null;
}

export async function getInterviewForApplication(
  applicationId: string
): Promise<ActionResult<Interview | null>> {
  try {
    await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', applicationId)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { ok: false, error: formatActionError(error.message) };
    }

    if (!data) {
      return { ok: true, data: null };
    }

    const interview: Interview = {
      id: data.id,
      application_id: data.application_id,
      interviewer_name: data.interviewer_name,
      scheduled_at: data.scheduled_at,
      duration_min: data.duration_min,
      type: data.type as 'technical' | 'hr' | 'managerial',
      feedback: (data.feedback as InterviewFeedback) || null,
      decision: data.decision as 'selected' | 'rejected' | null,
    };

    return { ok: true, data: interview };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function listInterviews(): Promise<ActionResult<ScheduledInterviewItem[]>> {
  try {
    await requireRole('recruiter');

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('interviews')
      .select(`
        id,
        application_id,
        interviewer_name,
        scheduled_at,
        duration_min,
        type,
        feedback,
        decision,
        created_at,
        application:applications!application_id (
          id,
          status,
          candidate:profiles!candidate_id (
            full_name
          ),
          job:jobs!job_id (
            id,
            title
          )
        )
      `)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return { ok: false, error: formatActionError(error.message) };
    }

    const items: ScheduledInterviewItem[] = (data || []).map((row) => {
      const app = Array.isArray(row.application) ? row.application[0] : row.application;
      const candidate = Array.isArray(app?.candidate) ? app.candidate[0] : app?.candidate;
      const job = Array.isArray(app?.job) ? app.job[0] : app?.job;

      return {
        id: row.id,
        application_id: row.application_id,
        interviewer_name: row.interviewer_name,
        scheduled_at: row.scheduled_at,
        duration_min: row.duration_min,
        type: row.type as 'technical' | 'hr' | 'managerial',
        feedback: (row.feedback as InterviewFeedback) || null,
        decision: row.decision as 'selected' | 'rejected' | null,
        candidate_name: candidate?.full_name || 'Anonymous Candidate',
        job_title: job?.title || 'Job Posting',
        job_id: job?.id || '',
        application_status: (app?.status as ApplicationStatus) || 'interview',
      };
    });

    return { ok: true, data: items };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function scheduleInterview(
  input: {
    application_id: string;
    interviewer_name: string;
    scheduled_at: string;
    duration_min: number;
    type: 'technical' | 'hr' | 'managerial';
    force?: boolean;
  }
): Promise<ActionResult<ScheduleResult>> {
  try {
    const user = await requireRole('recruiter');

    const validation = scheduleInputSchema.safeParse(input);
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message || 'Invalid scheduling input' };
    }

    const { application_id, interviewer_name, scheduled_at, duration_min, type, force } = validation.data;

    // Reject past dates
    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate.getTime() < Date.now() - 60000) {
      return { ok: false, error: 'Cannot schedule an interview in the past' };
    }

    // Check conflict
    const conflictMessage = await checkConflict({
      applicationId: application_id,
      interviewer_name,
      scheduled_at,
      duration_min,
    });

    if (conflictMessage && !force) {
      return {
        ok: true,
        data: {
          saved: false,
          conflict: conflictMessage,
        },
      };
    }

    const supabase = await createClient();

    // Insert interview record
    const { data: inserted, error: insertError } = await supabase
      .from('interviews')
      .insert({
        application_id,
        interviewer_name,
        scheduled_at: scheduledDate.toISOString(),
        duration_min,
        type,
      })
      .select('*')
      .single();

    if (insertError || !inserted) {
      return { ok: false, error: insertError?.message || 'Failed to schedule interview' };
    }

    // Check application status: if shortlisted, transition to 'interview'
    const { data: appData } = await supabase
      .from('applications')
      .select('status')
      .eq('id', application_id)
      .single();

    let transErrorNote: string | undefined;
    if (appData?.status === 'shortlisted') {
      const transResult = await transition(
        application_id,
        'interview',
        user.id,
        `Interview scheduled with ${interviewer_name}`
      );
      if (!transResult.ok) {
        console.warn('Could not auto-transition application to interview stage:', transResult.error);
        transErrorNote = formatActionError(transResult.error);
      }
    }

    const interviewObj: Interview = {
      id: inserted.id,
      application_id: inserted.application_id,
      interviewer_name: inserted.interviewer_name,
      scheduled_at: inserted.scheduled_at,
      duration_min: inserted.duration_min,
      type: inserted.type as 'technical' | 'hr' | 'managerial',
      feedback: (inserted.feedback as InterviewFeedback) || null,
      decision: inserted.decision as 'selected' | 'rejected' | null,
    };

    // Load job title for candidate notification
    let jobTitle = 'the role';
    try {
      const { data: appRow } = await supabase
        .from('applications')
        .select('job:jobs!job_id(title)')
        .eq('id', application_id)
        .maybeSingle();

      const j = Array.isArray(appRow?.job) ? appRow?.job[0] : appRow?.job;
      if (j?.title) {
        jobTitle = j.title;
      }
    } catch {
      // Non-critical fallback
    }

    const notified = await notifyCandidate({
      applicationId: application_id,
      type: 'interview_scheduled',
      title: 'Interview scheduled',
      message: `Your ${type} interview for ${jobTitle} has been scheduled with ${interviewer_name}.`,
      data: {
        scheduled_at: scheduledDate.toISOString(),
        duration_min,
        interview_type: type,
        interviewer_name,
        job_title: jobTitle,
      },
    });

    const notifMsg = notified
      ? 'Interview scheduled. Candidate notified.'
      : 'Interview scheduled, but the notification could not be sent.';

    const message = transErrorNote
      ? `${notifMsg} Note: Pipeline transition warning: ${transErrorNote}`
      : notifMsg;

    return {
      ok: true,
      data: {
        saved: true,
        message,
        interview: interviewObj,
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function saveFeedback(
  interviewId: string,
  feedback: {
    technical: number;
    communication: number;
    problem_solving: number;
    recommendation: 'hire' | 'hold' | 'no_hire';
    comments: string;
  }
): Promise<ActionResult<Interview>> {
  try {
    await requireRole('recruiter');

    if (!interviewId) {
      return { ok: false, error: 'Interview ID is required' };
    }

    const validation = feedbackInputSchema.safeParse(feedback);
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message || 'Invalid feedback data' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('interviews')
      .update({
        feedback: validation.data,
      })
      .eq('id', interviewId)
      .select('*')
      .single();

    if (error || !data) {
      return { ok: false, error: formatActionError(error?.message || 'Failed to save feedback') };
    }

    const updated: Interview = {
      id: data.id,
      application_id: data.application_id,
      interviewer_name: data.interviewer_name,
      scheduled_at: data.scheduled_at,
      duration_min: data.duration_min,
      type: data.type as 'technical' | 'hr' | 'managerial',
      feedback: (data.feedback as InterviewFeedback) || null,
      decision: data.decision as 'selected' | 'rejected' | null,
    };

    return { ok: true, data: updated };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function recordDecision(
  applicationId: string,
  decision: 'selected' | 'rejected',
  note?: string
): Promise<ActionResult<{ decision: 'selected' | 'rejected'; message: string }>> {
  try {
    const user = await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const decisionVal = decisionSchema.safeParse(decision);
    if (!decisionVal.success) {
      return { ok: false, error: 'Decision must be selected or rejected' };
    }

    const supabase = await createClient();

    // Check application status: must be 'interview'
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (appError || !appData) {
      return { ok: false, error: formatActionError(appError?.message || 'Application not found') };
    }

    if (appData.status !== 'interview') {
      return {
        ok: false,
        error: `Decision can only be recorded when application is in 'interview' stage (current: '${appData.status}')`,
      };
    }

    // 1. Transition application status
    const transitionRes = await transition(
      applicationId,
      decision,
      user.id,
      note || `Final candidate evaluation: ${decision}`
    );

    if (!transitionRes.ok) {
      return { ok: false, error: formatActionError(transitionRes.error) };
    }

    // 2. Set decision on the latest interview row
    const { data: latestInterview } = await supabase
      .from('interviews')
      .select('id')
      .eq('application_id', applicationId)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestInterview) {
      await supabase
        .from('interviews')
        .update({ decision })
        .eq('id', latestInterview.id);
    }

    // Load job title for candidate notification
    let jobTitle = 'this position';
    try {
      const { data: appRow } = await supabase
        .from('applications')
        .select('job:jobs!job_id(title)')
        .eq('id', applicationId)
        .maybeSingle();

      const j = Array.isArray(appRow?.job) ? appRow?.job[0] : appRow?.job;
      if (j?.title) {
        jobTitle = j.title;
      }
    } catch {
      // Non-critical fallback
    }

    let notified = false;
    if (decision === 'selected') {
      notified = await notifyCandidate({
        applicationId,
        type: 'selected',
        title: 'Congratulations!',
        message: `You have been selected for ${jobTitle}. The recruiter will contact you shortly.`,
      });
    } else {
      notified = await notifyCandidate({
        applicationId,
        type: 'rejected',
        title: 'Update on your application',
        message: `Thank you for applying to ${jobTitle}. Unfortunately you were not selected to move forward.`,
      });
    }

    const notificationMessage = notified
      ? 'Status updated. Candidate notified.'
      : 'Status updated, but the notification could not be sent.';

    return {
      ok: true,
      data: {
        decision,
        message: notificationMessage,
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}
