import { getMyApplications } from '@/app/actions/applications';
import { getMyResume } from '@/app/actions/resumes';
import Link from 'next/link';
import { Briefcase, FileText, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function CandidateDashboardPage() {
  const [appsRes, resumeRes] = await Promise.all([
    getMyApplications(),
    getMyResume(),
  ]);

  const applications = appsRes.ok ? appsRes.data : [];
  const resume = resumeRes.ok ? resumeRes.data : null;

  const totalApps = applications.length;
  const inPipeline = applications.filter((a) =>
    ['assessed', 'review', 'shortlisted', 'interview'].includes(a.status)
  ).length;
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'interview', 'selected'].includes(a.status)
  ).length;

  const statusStyles: Record<string, string> = {
    submitted: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300',
    parsed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
    assessed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    review: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300',
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    interview: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
    selected: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
  };

  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    parsed: 'Parsed',
    assessed: 'Assessed',
    review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview: 'Interview Scheduled',
    selected: 'Offer Extended',
    rejected: 'Not Selected',
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Candidate Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your job applications, verified resume profile, and interview status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/candidate/resume"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            <FileText className="h-4 w-4 mr-1.5 text-slate-500" />
            {resume ? 'Manage Resume' : 'Upload Resume'}
          </Link>
          <Link
            href="/candidate/jobs"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
            )}
          >
            <Briefcase className="h-4 w-4 mr-1.5" />
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applications
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center dark:bg-zinc-800 dark:text-zinc-300">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
            {totalApps}
          </div>
          <div className="text-xs text-slate-500 mt-1">Jobs applied to</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active In Pipeline
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-3">
            {inPipeline}
          </div>
          <div className="text-xs text-slate-500 mt-1">Under consideration</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Shortlisted / Interview
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            {shortlistedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Advanced to next stage</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resume Profile
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {resume?.status === 'parsed' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                Verified & Ready
              </span>
            ) : resume?.status === 'empty' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Empty / Scanned
              </span>
            ) : resume?.status === 'failed' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                Failed
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Not Uploaded
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2 truncate">
            {resume ? resume.file_name : 'Upload your PDF resume'}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              My Applications & Pipeline Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates as recruiters review, shortlist, and schedule interviews
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {applications.length} submitted
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No applications yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Make sure your resume is uploaded, then explore open positions to apply with 1-click verified matching.
            </p>
            <div className="mt-5">
              <Link
                href="/candidate/jobs"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600"
                )}
              >
                Browse Open Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {applications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {app.job?.title || 'Unknown Position'}
                      </h3>
                      <span
                        className={cn(
                          'text-xs font-medium px-2.5 py-0.5 rounded-full border',
                          statusStyles[app.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                        )}
                      >
                        {statusLabels[app.status] || app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                      <span>{app.job?.department || 'General'}</span>
                      <span>•</span>
                      <span>{app.job?.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{app.job?.type || 'Full-time'}</span>
                      <span>•</span>
                      <span>
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {app.interview && (
                    <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 p-3 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-semibold">
                          Interview Scheduled with {app.interview.interviewer_name}
                        </div>
                        <div className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                          {new Date(app.interview.scheduled_at).toLocaleString()} ({app.interview.duration_min} min)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pipeline visual stepper */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                    {[
                      { key: 'submitted', label: '1. Submitted' },
                      { key: 'assessed', label: '2. AI Assessed' },
                      { key: 'review', label: '3. Under Review' },
                      { key: 'shortlisted', label: '4. Shortlisted' },
                      { key: 'interview', label: '5. Interview' },
                    ].map((step, idx) => {
                      const stages = ['submitted', 'assessed', 'review', 'shortlisted', 'interview', 'selected'];
                      const currentIdx = stages.indexOf(app.status);
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = app.status === step.key;

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={cn(
                              'h-1.5 w-full rounded-full transition-all mb-1.5',
                              isCurrent
                                ? 'bg-indigo-600 dark:bg-indigo-400'
                                : isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-slate-200 dark:bg-zinc-800'
                            )}
                          />
                          <span
                            className={cn(
                              'truncate w-full font-medium',
                              isCurrent
                                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                                : isCompleted
                                ? 'text-slate-800 dark:text-zinc-200'
                                : 'text-slate-400'
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
