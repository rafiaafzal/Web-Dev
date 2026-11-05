import { adminClient } from './supabase/admin';
import type { ActionResult, ApplicationStatus } from '@/types/core';

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['parsed', 'assessed'],
  parsed: ['assessed'],
  assessed: ['review', 'shortlisted', 'rejected', 'assessed'],
  review: ['shortlisted', 'rejected', 'interview'],
  shortlisted: ['interview', 'rejected', 'review'],
  interview: ['selected', 'rejected', 'shortlisted'],
  rejected: ['review', 'shortlisted'],
  selected: ['review', 'interview'],
};

export async function transition(
  applicationId: string,
  toStatus: ApplicationStatus,
  userId: string,
  note?: string
): Promise<ActionResult<{ fromStatus: ApplicationStatus; toStatus: ApplicationStatus }>> {
  try {
    const { data: app, error: fetchError } = await adminClient
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (fetchError || !app) {
      return { ok: false, error: fetchError?.message || 'Application not found' };
    }

    const currentStatus = app.status as ApplicationStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(toStatus) && currentStatus !== toStatus) {
      return {
        ok: false,
        error: `Cannot transition application from '${currentStatus}' to '${toStatus}'`,
      };
    }

    const { error: updateError } = await adminClient
      .from('applications')
      .update({
        status: toStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    const { error: eventError } = await adminClient
      .from('application_events')
      .insert({
        application_id: applicationId,
        from_status: currentStatus,
        to_status: toStatus,
        changed_by: userId,
        note: note || null,
      });

    if (eventError) {
      console.error('Failed to log application event:', eventError);
    }

    return {
      ok: true,
      data: {
        fromStatus: currentStatus,
        toStatus,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown transition error';
    return { ok: false, error: message };
  }
}
