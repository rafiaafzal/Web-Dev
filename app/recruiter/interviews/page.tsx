import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { listInterviews } from '@/app/actions/scheduling';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  ExternalLink,
  Award,
  XCircle,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function RecruiterInterviewsPage() {
  await requireRole('recruiter');

  const res = await listInterviews();
  const interviews = res.ok ? res.data : [];

  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.scheduled_at) >= now);
  const past = interviews.filter((i) => new Date(i.scheduled_at) < now);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Interview Schedule & Evaluations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track upcoming candidate interview slots, assigned interviewers, and final hiring outcomes
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-700 font-medium self-start sm:self-auto">
            {interviews.length} Total Sessions
          </span>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3 dark:text-zinc-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No interviews scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            When you shortlist candidates for a role, you can schedule structured interview slots from their application review page.
          </p>
          <Link
            href="/recruiter/jobs"
            className={cn(buttonVariants({ size: 'sm' }), 'bg-indigo-600 hover:bg-indigo-700 text-white')}
          >
            Browse Jobs & Applicants
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Upcoming Sessions ({upcoming.length})
              </h2>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                No upcoming sessions scheduled.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.candidate_name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Briefcase className="h-3 w-3 text-slate-400 inline" />
                          <span>{item.job_title}</span>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        {item.type}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(item.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(item.scheduled_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({item.duration_min} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Interviewer: <strong>{item.interviewer_name}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {item.decision ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-bold',
                            item.decision === 'selected'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          )}
                        >
                          {item.decision}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">Scheduled</span>
                      )}

                      <Link
                        href={`/recruiter/applications/${item.application_id}`}
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'h-7 px-2.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 inline-flex items-center gap-1'
                        )}
                      >
                        <span>Review</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Section */}
          {past.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Completed & Past Sessions ({past.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3 opacity-90"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.candidate_name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Briefcase className="h-3 w-3 text-slate-400 inline" />
                          <span>{item.job_title}</span>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px] font-semibold bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {item.type}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg">
                      <div>
                        {new Date(item.scheduled_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {item.interviewer_name}
                      </div>
                      {item.feedback?.recommendation && (
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Recommendation: <span className="uppercase">{item.feedback.recommendation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {item.decision ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-bold',
                            item.decision === 'selected'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          )}
                        >
                          {item.decision}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Completed
                        </Badge>
                      )}

                      <Link
                        href={`/recruiter/applications/${item.application_id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'h-7 px-2 text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1'
                        )}
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
