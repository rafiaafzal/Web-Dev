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
import { TalentSearchWidget } from '@/components/TalentSearchWidget';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
            <p className="text-[11px] text-slate-500 mt-1">Sessions scheduled or held</p>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Talent Search Widget */}
      <TalentSearchWidget />

      {/* Pipeline Analytics & Breakdown Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recruitment Pipeline Intelligence
            </h3>
            <p className="text-xs text-slate-500">
              Interactive visual analytics of candidate distribution, skill gap frequency, and funnel efficiency.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              Shortlist Rate: {shortlist_rate}%
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              Avg Processing: {avg_processing_hours}h
            </span>
          </div>
        </div>

        <AnalyticsCharts analytics={analytics} />
      </div>

      {/* Grid: Job Openings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Active Roles */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Recent Job Postings
              </CardTitle>
              <CardDescription className="text-xs">
                Active opportunities currently accepting candidate submissions
              </CardDescription>
            </div>
            <Link
              href="/recruiter/jobs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View all ({jobs.length}) →
            </Link>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No job postings yet
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Get started by publishing your first job with AI requirement extraction.
                </p>
                <Link
                  href="/recruiter/jobs/new"
                  className={cn(buttonVariants({ size: 'sm' }), 'mt-4 bg-indigo-600 hover:bg-indigo-700 text-white')}
                >
                  Create Job Posting
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/recruiter/jobs/${job.id}`}
                          className="font-semibold text-sm text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider',
                            job.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                          )}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.department || 'General'} • {job.location || 'Remote'} • {job.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right sm:text-left">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                          {job.applicant_count ?? 0}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">candidates</span>
                      </div>
                      <Link
                        href={`/recruiter/jobs/${job.id}`}
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'h-8 text-xs border-slate-200'
                        )}
                      >
                        Applicants
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 1 Col: Quick Workflow Actions */}
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Operations
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
              href="/recruiter/compare"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-zinc-800 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">Candidate Comparison</h5>
                  <p className="text-[11px] text-slate-500">Side-by-side assessment matrix & duplicate detection</p>
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

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/platform"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5'
              )}
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>Enterprise AI Command Center</span>
            </Link>
            <Link
              href="/recruiter/jobs/new"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 inline-flex items-center gap-1.5'
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
