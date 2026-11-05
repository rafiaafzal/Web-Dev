'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatActionError } from '@/utils/with-retry';
import type { ActionResult } from '@/types/core';

export interface NotificationItem {
  id: string;
  user_id: string;
  application_id: string | null;
  type: 'shortlisted' | 'rejected' | 'interview_scheduled' | 'selected' | 'info';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationListResult {
  items: NotificationItem[];
  unreadCount: number;
}

const idSchema = z.string().uuid('Invalid notification ID');
const limitSchema = z.number().int().min(1).max(100).default(20);

function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  const code = String(error.code || '');
  return code === '42P01' || msg.includes('relation') || msg.includes('does not exist');
}

/**
 * Lists the authenticated user's notifications, ordered by creation date descending,
 * and retrieves the exact database head count of unread notifications.
 */
export async function listMyNotifications(
  limit: number = 20
): Promise<ActionResult<NotificationListResult>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: 'Unauthorized: please sign in to view notifications' };
    }

    const limitVal = limitSchema.safeParse(limit);
    const validLimit = limitVal.success ? limitVal.data : 20;

    const supabase = await createClient();

    // 1. Database head count query for exact unread count (does not load rows)
    const { count: unreadCount, error: countErr } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (countErr) {
      if (isMissingTableError(countErr)) {
        return {
          ok: false,
          error: 'Notifications table is not configured in the database. Please apply supabase/notifications.sql.',
        };
      }
      return { ok: false, error: formatActionError(countErr.message) };
    }

    // 2. Fetch recent notifications limited by validLimit
    const { data: rows, error: itemsErr } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(validLimit);

    if (itemsErr) {
      if (isMissingTableError(itemsErr)) {
        return {
          ok: false,
          error: 'Notifications table is not configured in the database. Please apply supabase/notifications.sql.',
        };
      }
      return { ok: false, error: formatActionError(itemsErr.message) };
    }

    const items: NotificationItem[] = (rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      application_id: r.application_id,
      type: r.type,
      title: r.title,
      message: r.message,
      data: (r.data as Record<string, any>) || {},
      read: Boolean(r.read),
      created_at: r.created_at,
    }));

    return {
      ok: true,
      data: {
        items,
        unreadCount: unreadCount ?? 0,
      },
    };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationRead(id: string): Promise<ActionResult<null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: 'Unauthorized' };
    }

    const parsed = idSchema.safeParse(id);
    if (!parsed.success) {
      return { ok: false, error: 'Invalid notification ID' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', parsed.data);

    if (error) {
      if (isMissingTableError(error)) {
        return { ok: false, error: 'Notifications table not configured' };
      }
      return { ok: false, error: formatActionError(error.message) };
    }

    return { ok: true, data: null };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}

/**
 * Marks all unread notifications for the authenticated user as read.
 */
export async function markAllNotificationsRead(): Promise<ActionResult<null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      if (isMissingTableError(error)) {
        return { ok: false, error: 'Notifications table not configured' };
      }
      return { ok: false, error: formatActionError(error.message) };
    }

    return { ok: true, data: null };
  } catch (err: unknown) {
    return { ok: false, error: formatActionError(err) };
  }
}
