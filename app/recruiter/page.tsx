import { Suspense } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSearch,
} from 'lucide-react';
import { listMyJobs } from '@/app/actions/jobs';
import { getAnalytics } from '@/app/actions/analytics';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { cn } from '@/lib/utils';

async function DashboardOverview() {
  const [analyticsResult, jobsResult] = await Promise.all([
    getAnalytics(),
    listMyJobs(),
  ]);

  const analytics = analyticsResult.ok
    ? analyticsResult.data
    : {
        totals: {
          active_jobs: 0,
          applications: 0,
          shortlisted: 0,
          pending_reviews: 0,
          interviews: 0,
        },
        by_job: [],
        by_stage: [],
        shortlist_rate: 0,
        avg_processing_hours: 0,
        common_gaps: [],
      };

  const jobs = jobsResult.ok ? jobsResult.data : [];
  const { totals, shortlist_rate, avg_processing_hours } = analytics;

  return (
    <div className="space-y-8">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Jobs */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totals.active_jobs}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {jobs.length} total postings managed
            </p>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totals.applications}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across all published roles</p>
          </CardContent>
        </Card>

        {/* Shortlisted */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totals.shortlisted}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Advanced to review stages</p>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Reviews
            </CardTitle>
            <FileSearch className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totals.pending_reviews}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting recruiter evaluation</p>
          </CardContent>
        </Card>

        {/* Interviews */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interviews
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totals.interviews}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Scheduled candidate slots</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion & Velocity Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shortlist Rate */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800 bg-linear-to-br from-white to-indigo-50/20 dark:from-zinc-900 dark:to-zinc-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Shortlist Conversion Rate</CardTitle>
              <CardDescription className="text-xs">
                Percentage of candidate pool passing qualification thresholds
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totals.applications > 0 ? `${Math.round(shortlist_rate * 100)}%` : '0%'}
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(shortlist_rate * 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Average Processing Time */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800 bg-linear-to-br from-white to-blue-50/20 dark:from-zinc-900 dark:to-zinc-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Average Processing Velocity</CardTitle>
              <CardDescription className="text-xs">
                Hours elapsed from submission to first shortlist or rejection decision
              </CardDescription>
            </div>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {avg_processing_hours > 0 ? `${avg_processing_hours.toFixed(1)} hrs` : '0.0 hrs'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {avg_processing_hours > 0
                ? 'Calculated from audit trail timestamp differentials'
                : 'No candidate lifecycle decisions completed yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <AnalyticsCharts analytics={analytics} />

      {/* Quick Access & Job Postings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recent Job Postings</span>
              <Link
                href="/recruiter/jobs"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-xs inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700'
                )}
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              Status and candidate counts for your latest roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No jobs created yet. Click &quot;Post New Job&quot; above to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.department || 'General'} • {job.applicant_count || 0} applicants</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/recruiter/jobs/${job.id}`}
                        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-7 text-xs')}
                      >
                        Applicants
                      </Link>
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7 text-xs')}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recruiter Quick Actions</span>
              <Link
                href="/recruiter/interviews"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'text-xs inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700'
                )}
              >
                <span>All Interviews</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">
              Streamlined talent operations and management shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/recruiter/jobs/new"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-zinc-800 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">Create New Role</h5>
                  <p className="text-[11px] text-slate-500">Auto-extract requirements with Gemini AI</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/recruiter/interviews"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-zinc-800 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">View Interview Schedule</h5>
                  <p className="text-[11px] text-slate-500">Track scheduled sessions and evaluation feedback</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/recruiter/jobs"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-zinc-800 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">Review Ranked Applicants</h5>
                  <p className="text-[11px] text-slate-500">Examine transparent evidence scores and gap analyses</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/80 via-white to-slate-50 p-6 sm:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Talent Intelligence Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Recruiter Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Real-time pipeline analytics, candidate scoring breakdowns, and interview operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/jobs/new"
              className={cn(
                buttonVariants(),
                'bg-indigo-600 hover:bg-indigo-700 text-white font-medium inline-flex items-center gap-2'
              )}
            >
              <Briefcase className="h-4 w-4" />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-900" />}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
