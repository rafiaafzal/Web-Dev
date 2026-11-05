'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  Calendar,
  ExternalLink,
  Inbox,
  Clock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from '@/app/actions/notifications';
import {
  formatRelativeTime,
  formatInterviewDateTime,
  getNotificationIcon,
  getNotificationIconStyle,
} from './notification-utils';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const isFirstLoad = useRef(true);
  const prevUnreadCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await listMyNotifications(5);
      if (res.ok && res.data) {
        setItems(res.data.items);
        setUnreadCount(res.data.unreadCount);

        // Show toast ONLY when unread count increases after initial load
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          prevUnreadCount.current = res.data.unreadCount;
        } else {
          if (res.data.unreadCount > prevUnreadCount.current) {
            const latest = res.data.items.find((n) => !n.read) || res.data.items[0];
            if (latest) {
              toast.info(latest.title, {
                description: latest.message,
              });
            }
          }
          prevUnreadCount.current = res.data.unreadCount;
        }
      }
    } catch (err) {
      console.warn('Silent failure in notification polling:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 20000);

    const onFocus = () => {
      fetchNotifications();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchNotifications]);

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      prevUnreadCount.current = Math.max(0, prevUnreadCount.current - 1);

      try {
        await markNotificationRead(notif.id);
      } catch (err) {
        console.warn('Failed to mark notification read:', err);
      }
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    // Optimistic update
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    prevUnreadCount.current = 0;

    try {
      const res = await markAllNotificationsRead();
      if (res.ok) {
        toast.success('All notifications marked as read');
      }
    } catch {
      toast.error('Could not mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-xl z-50 overflow-hidden"
      >
        {/* Header must be inside DropdownMenuGroup for Radix UI */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between font-normal">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {/* List of 5 latest notifications */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 mb-2">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                No notifications yet
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Updates regarding your applications and interviews will appear here.
              </p>
            </div>
          ) : (
            items.map((notif) => {
              const Icon = getNotificationIcon(notif.type);
              const style = getNotificationIconStyle(notif.type);
              const interviewDate =
                notif.type === 'interview_scheduled' && notif.data?.scheduled_at
                  ? formatInterviewDateTime(notif.data.scheduled_at)
                  : null;

              return (
                <DropdownMenuItem
                  key={notif.id}
                  onSelect={() => handleItemClick(notif)}
                  className={cn(
                    'p-3.5 cursor-pointer flex items-start gap-3 transition-colors focus:bg-slate-50 dark:focus:bg-zinc-900 rounded-none',
                    !notif.read && 'bg-indigo-50/40 dark:bg-indigo-950/20'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                      style.bg,
                      style.color,
                      style.border
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'text-xs leading-snug truncate',
                          notif.read
                            ? 'font-medium text-slate-800 dark:text-zinc-200'
                            : 'font-bold text-slate-900 dark:text-white'
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Interview details pill */}
                    {interviewDate && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3" />
                          {interviewDate}
                        </span>
                        {notif.data?.interviewer_name && (
                          <span className="text-blue-600/80 dark:text-blue-400">
                            • with {notif.data.interviewer_name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0 bg-slate-100 dark:bg-zinc-800" />

        {/* Footer: View all link */}
        <div className="p-2 bg-slate-50/80 dark:bg-zinc-900/80 text-center">
          <Link
            href="/candidate/notifications"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 py-1 px-3 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors w-full"
          >
            <span>View all notifications</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
