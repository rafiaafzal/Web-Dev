'use server';

import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatActionError } from '@/utils/with-retry';
import type { ActionResult, ApplicationStatus, Assessment } from '@/types/core';
import type { Analytics } from '@/types/recruiter';

const ALL_STAGES: ApplicationStatus[] = [
  'submitted',
  'parsed',
  'assessed',
  'review',
  'shortlisted',
  'interview',
  'selected',
  'rejected',
];

export async function getAnalytics(): Promise<ActionResult<Analytics>> {
  try {
    const user = await requireRole('recruiter');
    const supabase = await createClient();

    // 1. Fetch jobs created by the current recruiter
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, status')
      .eq('recruiter_id', user.id);

    if (jobsError) {
      return { ok: false, error: formatActionError(jobsError.message) };
    }

    const jobList = jobs || [];
    const active_jobs = jobList.filter((j) => j.status === 'open').length;

    if (jobList.length === 0) {
      return {
        ok: true,
        data: {
          totals: {
            active_jobs: 0,
            applications: 0,
            shortlisted: 0,
            pending_reviews: 0,
            interviews: 0,
          },
          by_job: [],
          by_stage: ALL_STAGES.map((stage) => ({ stage, count: 0 })),
          shortlist_rate: 0,
          avg_processing_hours: 0,
          common_gaps: [],
        },
      };
    }

    const jobIds = jobList.map((j) => j.id);

    // 2. Fetch applications for these jobs
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, job_id, status, created_at')
      .in('job_id', jobIds);

    if (appsError) {
      return { ok: false, error: formatActionError(appsError.message) };
    }

    const appList = applications || [];
    const appIds = appList.map((a) => a.id);

    if (appList.length === 0) {
      return {
        ok: true,
        data: {
          totals: {
            active_jobs,
            applications: 0,
            shortlisted: 0,
            pending_reviews: 0,
            interviews: 0,
          },
          by_job: jobList.map((j) => ({ job_title: j.title, applications: 0 })),
          by_stage: ALL_STAGES.map((stage) => ({ stage, count: 0 })),
          shortlist_rate: 0,
          avg_processing_hours: 0,
          common_gaps: [],
        },
      };
    }

    // 3. Applications by Job
    const appCountByJob: Record<string, number> = {};
    for (const app of appList) {
      appCountByJob[app.job_id] = (appCountByJob[app.job_id] || 0) + 1;
    }
    const by_job = jobList.map((j) => ({
      job_title: j.title,
      applications: appCountByJob[j.id] || 0,
    }));

    // 4. Applications by Stage
    const stageCounts: Record<string, number> = {};
    for (const app of appList) {
      stageCounts[app.status] = (stageCounts[app.status] || 0) + 1;
    }
    const by_stage = ALL_STAGES.map((stage) => ({
      stage,
      count: stageCounts[stage] || 0,
    }));

    // Pending reviews: applications in 'assessed' or 'review'
    const pending_reviews = (stageCounts['assessed'] || 0) + (stageCounts['review'] || 0);

    // 5. Fetch application_events for these application IDs
    const { data: events } = await supabase
      .from('application_events')
      .select('application_id, to_status, created_at')
      .in('application_id', appIds)
      .order('created_at', { ascending: true });

    // Shortlisted: applications that ever reached 'shortlisted'
    const shortlistedSet = new Set<string>();
    // Map of first decision event per application (for avg processing hours)
    const firstDecisionEventMap = new Map<string, Date>();

    for (const event of events || []) {
      if (event.to_status === 'shortlisted') {
        shortlistedSet.add(event.application_id);
      }
      if (event.to_status === 'shortlisted' || event.to_status === 'rejected') {
        if (!firstDecisionEventMap.has(event.application_id)) {
          firstDecisionEventMap.set(event.application_id, new Date(event.created_at));
        }
      }
    }

    // Also include any app currently in shortlisted/interview/selected if event was missing
    for (const app of appList) {
      if (['shortlisted', 'interview', 'selected'].includes(app.status)) {
        shortlistedSet.add(app.id);
      }
    }

    const shortlisted = shortlistedSet.size;
    const shortlist_rate = appList.length > 0 ? shortlisted / appList.length : 0;

    // Calculate avg_processing_hours: application created_at to first decision event
    let totalProcessingHours = 0;
    let processedCount = 0;
    for (const app of appList) {
      const decisionTime = firstDecisionEventMap.get(app.id);
      if (decisionTime) {
        const appCreated = new Date(app.created_at);
        const hours = Math.max(0, (decisionTime.getTime() - appCreated.getTime()) / (1000 * 60 * 60));
        totalProcessingHours += hours;
        processedCount += 1;
      }
    }
    const avg_processing_hours = processedCount > 0 ? totalProcessingHours / processedCount : 0;

    // 6. Fetch interviews for these application IDs
    const { data: interviewRows } = await supabase
      .from('interviews')
      .select('id')
      .in('application_id', appIds);

    const interviews = interviewRows?.length || 0;

    // 7. Fetch assessments for common_gaps
    const { data: assessmentRows } = await supabase
      .from('assessments')
      .select('application_id, details')
      .in('application_id', appIds);

    const gapCounts: Record<string, number> = {};
    for (const row of assessmentRows || []) {
      const details = (row.details as Partial<Assessment>) || {};
      const gaps = details.gaps || [];
      for (const gap of gaps) {
        if (gap.skill) {
          const name = gap.skill.trim();
          gapCounts[name] = (gapCounts[name] || 0) + 1;
        }
      }
    }

    const common_gaps = Object.entries(gapCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      ok: true,
      data: {
        totals: {
          active_jobs,
          applications: appList.length,
          shortlisted,
          pending_reviews,
          interviews,
        },
        by_job,
        by_stage,
        shortlist_rate,
        avg_processing_hours,
        common_gaps,
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}
