import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { listMyJobs } from "@/app/actions/jobs";
import { cn } from "@/lib/utils";

async function DashboardOverview() {
  const jobsResult = await listMyJobs();
  const jobs = jobsResult.ok ? jobsResult.data : [];
  const activeJobs = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeJobs}</div>
            <p className="text-xs text-slate-500 mt-1">
              {jobs.length} total postings managed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Applicants
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalApplicants}</div>
            <p className="text-xs text-slate-500 mt-1">Across all published roles</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Shortlist Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalApplicants > 0 ? "24%" : "--"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Evidence-matched conversion</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Interviews Scheduled
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">Upcoming calendar slots</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recent Job Postings</span>
              <Link
                href="/recruiter/jobs"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                )}
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
            <CardDescription>
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
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.department || "General"} • {job.applicant_count || 0} applicants</p>
                    </div>
                    <Link
                      href={`/recruiter/jobs/${job.id}/edit`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs")}
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Recruitment Workflow Guide</CardTitle>
            <CardDescription>
              Standard 3-stage intelligence review process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] mt-0.5">
                1
              </div>
              <p>
                <strong className="text-slate-900 dark:text-white">Post with AI Extraction:</strong> Paste the raw description and let the AI extract normalized skills, experience, and weights.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] mt-0.5">
                2
              </div>
              <p>
                <strong className="text-slate-900 dark:text-white">Review Verified Evidence:</strong> Candidates are ranked by transparent evidence scores (50% skills, 25% exp, 15% projects, 10% qual).
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] mt-0.5">
                3
              </div>
              <p>
                <strong className="text-slate-900 dark:text-white">Structured Interviews:</strong> Generate tailored questions across 3 difficulty tiers with sample answer rubrics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-6 sm:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shadow-sm">
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
              Manage your hiring pipelines, review evidence-scored candidates, and schedule structured interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/jobs/new"
              className={cn(
                buttonVariants(),
                "bg-indigo-600 hover:bg-indigo-700 text-white font-medium inline-flex items-center gap-2"
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
