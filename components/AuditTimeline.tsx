import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, History, User } from 'lucide-react';
import type { ApplicationEventItem, ApplicationStatus } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface AuditTimelineProps {
  events: ApplicationEventItem[];
}

function getStatusBadgeClass(status: string | null) {
  switch (status as ApplicationStatus) {
    case 'shortlisted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'interview':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'selected':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'review':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300';
    case 'assessed':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300';
  }
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-zinc-800">
        <History className="h-5 w-5 mx-auto mb-1.5 opacity-50" />
        No audit history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
      {events.map((event) => {
        return (
          <div key={event.id} className="relative flex items-start group">
            {/* Dot marker */}
            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow dark:border-zinc-950 group-hover:scale-110 transition-transform" />

            <div className="flex-1 space-y-1.5 ml-2">
              {/* Transition flow */}
              <div className="flex flex-wrap items-center gap-2">
                {event.from_status ? (
                  <>
                    <Badge
                      variant="outline"
                      className={cn('text-[11px] capitalize font-medium', getStatusBadgeClass(event.from_status))}
                    >
                      {event.from_status}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </>
                ) : null}

                <Badge
                  variant="outline"
                  className={cn('text-[11px] capitalize font-semibold', getStatusBadgeClass(event.to_status))}
                >
                  {event.to_status}
                </Badge>

                <span className="text-[11px] text-slate-400 ml-auto">
                  {new Date(event.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Actor */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="h-3 w-3 text-slate-400" />
                <span>Changed by: <strong className="text-slate-700 dark:text-slate-300 font-medium">{event.changed_by_name || 'System / Recruiter'}</strong></span>
              </div>

              {/* Event Note */}
              {event.note && (
                <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 dark:bg-zinc-800/60 dark:text-slate-300 dark:border-zinc-800">
                  <span className="font-semibold text-slate-500 block mb-0.5">Note:</span>
                  {event.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
