import { Suspense } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, CheckCircle2, Calendar, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listMyJobs } from "@/app/actions/jobs";
import { TalentSearchWidget } from "@/components/TalentSearchWidget";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RecruiterDashboardPage() {
  const profile = await requireRole("recruiter");
  const jobsRes = await listMyJobs();
  const jobs = jobsRes.ok ? jobsRes.data : [];

  const supabase = await createClient();

  // Fetch recent applications for this recruiter's jobs
  const jobIds = jobs.map((j) => j.id);
  let recentApplications: any[] = [];
  let totalCandidatesCount = 0;
  let shortlistedCount = 0;
  let interviewCount = 0;

  if (jobIds.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        status,
        created_at,
        job:jobs!job_id ( title, department ),
        candidate:profiles!candidate_id ( full_name, email ),
        assessment:assessments ( total_score, breakdown, details )
      `)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false })
      .limit(10);

    if (apps) {
      recentApplications = apps;
    }

    // Aggregate counts
    const { data: allApps } = await supabase
      .from("applications")
      .select("status")
      .in("job_id", jobIds);

    if (allApps) {
      totalCandidatesCount = allApps.length;
      shortlistedCount = allApps.filter((a) => a.status === "shortlisted").length;
      interviewCount = allApps.filter((a) => a.status === "interview" || a.status === "selected").length;
    }
  }

  const activeJobsCount = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Talent Intelligence Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {profile.full_name || "Recruiter"}. Monitor pipelines, verified AI evidence, and applicant match scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/recruiter/jobs"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            )}
          >
            <Briefcase className="h-4 w-4 mr-1.5 text-slate-500" />
            <span>Manage Jobs</span>
          </Link>
          <Link
            href="/recruiter/jobs/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-xs"
            )}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Roles</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{activeJobsCount}</span>
            <span className="text-xs text-slate-500">of {jobs.length} total</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalCandidatesCount}</span>
            <span className="text-xs text-slate-500">applied candidates</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{shortlistedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">pipeline leads</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-950 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{interviewCount}</span>
            <span className="text-xs text-slate-500">scheduled or selected</span>
          </div>
        </div>
      </div>

      {/* Semantic Talent Search Widget */}
      <TalentSearchWidget />

      {/* Main Grid: Active Job Postings & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Active Roles List */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Your Job Openings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any job to view ranked candidates</p>
            </div>
            <Link
              href="/recruiter/jobs/new"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              + Add
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No jobs posted yet.</p>
              <Link
                href="/recruiter/jobs/new"
                className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:underline"
              >
                Create your first job post
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {jobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/recruiter/jobs/${job.id}`}
                  className="block p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 transition-all dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[180px]">
                      {job.title}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                        job.status === "open"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{job.department || "General"}</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {job.applicant_count || 0} applicants
                    </span>
                  </div>
                </Link>
              ))}

              {jobs.length > 5 && (
                <Link
                  href="/recruiter/jobs"
                  className="block text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 pt-2 font-medium"
                >
                  View all {jobs.length} jobs →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Column (2/3): Recent Applications & Assessment Scores */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Recent Candidate Applications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI Match Scores & explainable evidence breakdowns
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Showing latest {recentApplications.length}
            </span>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-9 w-9 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No candidate applications received yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When candidates submit their PDF resumes, they will appear here with explainable scoring.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {recentApplications.map((app) => {
                const candidate = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
                const job = Array.isArray(app.job) ? app.job[0] : app.job;
                const assessment = Array.isArray(app.assessment) ? app.assessment[0] : app.assessment;
                const score = assessment?.total_score != null ? Math.round(Number(assessment.total_score)) : null;

                const statusStyles: Record<string, string> = {
                  submitted: "bg-slate-100 text-slate-700 border-slate-200",
                  parsed: "bg-blue-50 text-blue-700 border-blue-200",
                  assessed: "bg-amber-50 text-amber-700 border-amber-200",
                  review: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  interview: "bg-purple-50 text-purple-700 border-purple-200",
                  selected: "bg-green-50 text-green-800 border-green-300 font-semibold",
                  rejected: "bg-rose-50 text-rose-700 border-rose-200",
                };

                return (
                  <div
                    key={app.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                        {(candidate?.full_name || "C").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                            {candidate?.full_name || "Candidate"}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize",
                              statusStyles[app.status] || "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Applied for <span className="font-medium text-slate-700 dark:text-zinc-300">{job?.title || "Role"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      {score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block -mt-0.5">Match</span>
                          </div>
                          <div className="w-12 bg-slate-100 rounded-full h-2 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className={cn(
                                "h-2 rounded-full",
                                score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Processing</span>
                      )}

                      <Link
                        href={`/recruiter/applications/${app.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-8 px-2.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        )}
                      >
                        <span>Review</span>
                        <ChevronRightIcon className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
