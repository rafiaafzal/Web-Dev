'use client';

import { useState } from 'react';
import {
  Inbox,
  Check,
  CheckCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from '@/app/actions/notifications';
import {
  formatRelativeTime,
  formatInterviewDateTime,
  getNotificationIcon,
  getNotificationIconStyle,
} from '@/components/notification-utils';
import { cn } from '@/lib/utils';

export function CandidateNotificationsList({
  initialItems,
  initialUnreadCount,
}: {
  initialItems: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkItem = async (notif: NotificationItem) => {
    if (notif.read) return;

    // Optimistic
    setItems((prev) =>
      prev.map((i) => (i.id === notif.id ? { ...i, read: true } : i))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await markNotificationRead(notif.id);
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnreadCount(0);

    try {
      const res = await markAllNotificationsRead();
      if (res.ok) {
        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch {
      toast.error('Could not mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <Badge className="bg-indigo-600 text-white font-semibold text-xs px-2.5 py-0.5">
                {unreadCount} unread
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 font-normal text-xs">
                All caught up
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding your applications, interview invitations, and status changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="self-start sm:self-auto text-xs font-medium border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 inline-flex items-center gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>{markingAll ? 'Marking read...' : 'Mark all as read'}</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {items.length === 0 ? (
        <Card className="border-slate-200/80 shadow-xs dark:border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 mb-3">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No notifications yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When recruiters shortlist your profile, schedule interviews, or update your application status, you will see notifications here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            const style = getNotificationIconStyle(notif.type);
            const interviewDate =
              notif.type === 'interview_scheduled' && notif.data?.scheduled_at
                ? formatInterviewDateTime(notif.data.scheduled_at)
                : null;

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkItem(notif)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4',
                  notif.read
                    ? 'border-slate-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-900'
                    : 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/60 dark:bg-indigo-950/20 shadow-xs'
                )}
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                    style.bg,
                    style.color,
                    style.border
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          'text-sm leading-tight',
                          notif.read
                            ? 'font-semibold text-slate-800 dark:text-zinc-200'
                            : 'font-bold text-slate-900 dark:text-white'
                        )}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Interview details pill */}
                  {interviewDate && (
                    <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/80 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        {interviewDate}
                      </span>
                      {notif.data?.interviewer_name && (
                        <span className="text-blue-600/90 dark:text-blue-400 font-medium">
                          • Interviewer: {notif.data.interviewer_name}
                        </span>
                      )}
                      {notif.data?.duration_min && (
                        <span className="text-blue-500/80 dark:text-blue-400 text-[11px]">
                          ({notif.data.duration_min} min)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!notif.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkItem(notif);
                    }}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-800 transition"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
