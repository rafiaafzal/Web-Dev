'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { transition } from '@/lib/pipeline';
import { formatActionError } from '@/utils/with-retry';
import { notifyCandidate } from '@/utils/notify';
import type {
  ActionResult,
  ApplicationStatus,
  Assessment,
  ParsedResume,
} from '@/types/core';
import type {
  ApplicantRow,
  ApplicationDetail,
  RecruiterNote,
  ApplicationEventItem,
  Job,
} from '@/types/recruiter';

const noteSchema = z.string().trim().min(1, 'Note cannot be empty').max(2000, 'Note must be at most 2000 characters');

export async function listApplicants(
  jobId: string
): Promise<ActionResult<ApplicantRow[]>> {
  try {
    await requireRole('recruiter');

    if (!jobId) {
      return { ok: false, error: 'Job ID is required' };
    }

    const supabase = await createClient();

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        candidate:profiles!candidate_id (
          full_name
        ),
        assessment:assessments (
          total_score,
          breakdown,
          details
        )
      `)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error fetching applicants:', error);
      return { ok: false, error: formatActionError(error.message) };
    }

    if (!applications) {
      return { ok: true, data: [] };
    }

    const rows: ApplicantRow[] = applications.map((app) => {
      // Candidate profile might be single object or array
      const candidateProfile = Array.isArray(app.candidate)
        ? app.candidate[0]
        : app.candidate;
      const candidateName = candidateProfile?.full_name || 'Anonymous Candidate';

      // Assessment can be single object or array
      const rawAssessment = Array.isArray(app.assessment)
        ? app.assessment[0]
        : app.assessment;

      const total_score =
        rawAssessment?.total_score != null
          ? Number(rawAssessment.total_score)
          : null;

      const breakdown = (rawAssessment?.breakdown as {
        skills: number;
        experience: number;
        projects: number;
        qualifications: number;
      }) ?? null;

      // Extract details strictly following Assessment shape
      const details = (rawAssessment?.details as {
        matched_skills?: { skill: string }[];
        gaps?: { skill: string }[];
      }) || {};

      const matchedSkills = details.matched_skills || [];
      const gaps = details.gaps || [];

      const top_matched = matchedSkills
        .slice(0, 3)
        .map((m) => m.skill);

      const top_gaps = gaps
        .slice(0, 3)
        .map((g) => g.skill);

      return {
        application_id: app.id,
        candidate_name: candidateName,
        status: app.status as ApplicationStatus,
        total_score,
        breakdown,
        top_matched,
        top_gaps,
        created_at: app.created_at,
      };
    });

    // Sort by total_score desc, nulls last
    rows.sort((a, b) => {
      if (a.total_score == null && b.total_score == null) return 0;
      if (a.total_score == null) return 1;
      if (b.total_score == null) return -1;
      return b.total_score - a.total_score;
    });

    return { ok: true, data: rows };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function getApplicationDetail(
  applicationId: string
): Promise<ActionResult<ApplicationDetail>> {
  try {
    await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const supabase = await createClient();

    // 1. Fetch application, candidate profile, job, resume, and assessment
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        candidate_id,
        resume_id,
        status,
        created_at,
        updated_at,
        job:jobs (*),
        candidate:profiles!candidate_id (*),
        resume:resumes (*),
        assessment:assessments (*)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !appData) {
      return { ok: false, error: formatActionError(appError?.message || 'Application not found') };
    }

    // 2. Fetch events with changed_by profile (newest first)
    const { data: eventsData, error: eventsError } = await supabase
      .from('application_events')
      .select(`
        id,
        application_id,
        from_status,
        to_status,
        changed_by,
        note,
        created_at,
        changed_by_profile:profiles!changed_by (
          full_name
        )
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.warn('Failed to load application events:', eventsError);
    }

    // 3. Fetch recruiter notes (newest first)
    const { data: notesData, error: notesError } = await supabase
      .from('recruiter_notes')
      .select(`
        id,
        application_id,
        recruiter_id,
        note,
        created_at,
        author:profiles!recruiter_id (
          full_name
        )
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.warn('Failed to load recruiter notes:', notesError);
    }

    // Format Job
    const rawJob = Array.isArray(appData.job) ? appData.job[0] : appData.job;
    const job: Job | null = rawJob ? (rawJob as Job) : null;

    // Format Candidate
    const rawCandidate = Array.isArray(appData.candidate) ? appData.candidate[0] : appData.candidate;
    const candidate = rawCandidate || null;

    // Format Resume (parsed JSON)
    const rawResume = Array.isArray(appData.resume) ? appData.resume[0] : appData.resume;
    const resume: ParsedResume | null = rawResume?.parsed ? (rawResume.parsed as ParsedResume) : null;

    // Format Assessment gracefully
    const rawAssessment = Array.isArray(appData.assessment) ? appData.assessment[0] : appData.assessment;
    let assessment: Assessment | null = null;
    if (rawAssessment) {
      const details = (rawAssessment.details as Partial<Assessment>) || {};
      assessment = {
        total_score: Number(rawAssessment.total_score ?? 0),
        breakdown: (rawAssessment.breakdown as Assessment['breakdown']) || {
          skills: 0,
          experience: 0,
          projects: 0,
          qualifications: 0,
        },
        matched_skills: details.matched_skills || [],
        gaps: details.gaps || [],
        summary: details.summary || '',
        learning_suggestions: details.learning_suggestions || [],
        unsupported_claims: details.unsupported_claims || [],
      };
    }

    // Format events
    const events: ApplicationEventItem[] = (eventsData || []).map((e) => {
      const prof = Array.isArray(e.changed_by_profile)
        ? e.changed_by_profile[0]
        : e.changed_by_profile;
      return {
        id: e.id,
        application_id: e.application_id,
        from_status: e.from_status,
        to_status: e.to_status,
        changed_by: e.changed_by,
        changed_by_name: prof?.full_name || null,
        note: e.note,
        created_at: e.created_at,
      };
    });

    // Format notes
    const notes: RecruiterNote[] = (notesData || []).map((n) => {
      const authorProf = Array.isArray(n.author) ? n.author[0] : n.author;
      return {
        id: n.id,
        application_id: n.application_id,
        recruiter_id: n.recruiter_id,
        note: n.note,
        created_at: n.created_at,
        author_name: authorProf?.full_name || null,
      };
    });

    const detail: ApplicationDetail = {
      application: {
        id: appData.id,
        job_id: appData.job_id,
        candidate_id: appData.candidate_id,
        resume_id: appData.resume_id,
        status: appData.status as ApplicationStatus,
        created_at: appData.created_at,
        updated_at: appData.updated_at,
      },
      job,
      candidate,
      resume,
      assessment,
      events,
      notes,
    };

    return { ok: true, data: detail };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function setApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  note?: string
): Promise<ActionResult<{ status: ApplicationStatus; notification?: string; notified: boolean }>> {
  try {
    const user = await requireRole('recruiter');

    if (!applicationId || !toStatus) {
      return { ok: false, error: 'Application ID and target status are required' };
    }

    const res = await transition(applicationId, toStatus, user.id, note);

    if (!res.ok) {
      return { ok: false, error: formatActionError(res.error) };
    }

    let notified = false;
    let notification: string | undefined;

    // Load job title for candidate notifications
    let jobTitle = 'this position';
    try {
      const supabase = await createClient();
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

    if (toStatus === 'shortlisted') {
      notified = await notifyCandidate({
        applicationId,
        type: 'shortlisted',
        title: 'You have been shortlisted',
        message: `Good news! You have been shortlisted for ${jobTitle}. The recruiter will contact you about the next steps.`,
      });
      notification = notified
        ? 'Status updated. Candidate notified.'
        : 'Status updated, but the notification could not be sent.';
    } else if (toStatus === 'rejected') {
      notified = await notifyCandidate({
        applicationId,
        type: 'rejected',
        title: 'Update on your application',
        message: `Thank you for applying to ${jobTitle}. Unfortunately you were not selected to move forward.`,
      });
      notification = notified
        ? 'Status updated. Candidate notified.'
        : 'Status updated, but the notification could not be sent.';
    } else if (toStatus === 'selected') {
      notified = await notifyCandidate({
        applicationId,
        type: 'selected',
        title: 'Congratulations!',
        message: `You have been selected for ${jobTitle}. The recruiter will contact you shortly.`,
      });
      notification = notified
        ? 'Status updated. Candidate notified.'
        : 'Status updated, but the notification could not be sent.';
    } else {
      notification = 'Status updated successfully.';
    }

    return {
      ok: true,
      data: {
        status: toStatus,
        notification,
        notified,
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

export async function addNote(
  applicationId: string,
  note: string
): Promise<ActionResult<RecruiterNote>> {
  try {
    const user = await requireRole('recruiter');

    if (!applicationId) {
      return { ok: false, error: 'Application ID is required' };
    }

    const validation = noteSchema.safeParse(note);
    if (!validation.success) {
      return { ok: false, error: validation.error.issues[0]?.message || 'Invalid note' };
    }

    const validNote = validation.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('recruiter_notes')
      .insert({
        application_id: applicationId,
        recruiter_id: user.id,
        note: validNote,
      })
      .select(`
        id,
        application_id,
        recruiter_id,
        note,
        created_at
      `)
      .single();

    if (error || !data) {
      return { ok: false, error: formatActionError(error?.message || 'Failed to add recruiter note') };
    }

    return {
      ok: true,
      data: {
        id: data.id,
        application_id: data.application_id,
        recruiter_id: data.recruiter_id,
        note: data.note,
        created_at: data.created_at,
        author_name: user.full_name || 'Recruiter',
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}
