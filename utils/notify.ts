import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type NotificationType =
  | 'shortlisted'
  | 'rejected'
  | 'interview_scheduled'
  | 'selected'
  | 'info';

export interface NotifyCandidateParams {
  applicationId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Sends a notification to the candidate who submitted the specified application.
 * Uses the recruiter's authenticated Supabase client (satisfies is_recruiter() RLS policy).
 * Never throws: logs errors and returns boolean success status.
 */
export async function notifyCandidate({
  applicationId,
  type,
  title,
  message,
  data = {},
}: NotifyCandidateParams): Promise<boolean> {
  try {
    if (!applicationId) {
      console.error('notifyCandidate called without applicationId');
      return false;
    }

    const supabase = await createClient();

    // 1. Look up candidate_id from applications table
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('candidate_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError) {
      console.error('Failed to lookup candidate for notification:', appError.message);
      return false;
    }

    if (!appData?.candidate_id) {
      console.error('No candidate found for application ID:', applicationId);
      return false;
    }

    // 2. Insert notification row for the candidate
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: appData.candidate_id,
      application_id: applicationId,
      type,
      title,
      message,
      data: data ?? {},
    });

    if (notifError) {
      console.error('Failed to insert notification:', notifError.message);
      return false;
    }

    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Unexpected error in notifyCandidate:', errorMsg);
    return false;
  }
}
