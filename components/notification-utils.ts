import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  Info,
  LucideIcon,
} from 'lucide-react';

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats ISO date-time string in the user's local timezone.
 */
export function formatInterviewDateTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export function getNotificationIcon(type: string): LucideIcon {
  switch (type) {
    case 'shortlisted':
      return CheckCircle2;
    case 'selected':
      return Award;
    case 'interview_scheduled':
      return Calendar;
    case 'rejected':
      return XCircle;
    default:
      return Info;
  }
}

export function getNotificationIconStyle(type: string): {
  bg: string;
  color: string;
  border: string;
} {
  switch (type) {
    case 'shortlisted':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        color: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-900',
      };
    case 'selected':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/60',
        color: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-900',
      };
    case 'interview_scheduled':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        color: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-900',
      };
    case 'rejected':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        color: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-900',
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-zinc-800',
        color: 'text-slate-600 dark:text-zinc-300',
        border: 'border-slate-200 dark:border-zinc-700',
      };
  }
}
