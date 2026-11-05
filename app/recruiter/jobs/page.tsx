import { Suspense } from "react";
import Link from "next/link";
import { Plus, Briefcase, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { JobsTable } from "@/components/JobsTable";
import { listMyJobs } from "@/app/actions/jobs";
import { cn } from "@/lib/utils";

async function JobsListContent() {
  const result = await listMyJobs();

  if (!result.ok) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
        <h3 className="font-semibold text-red-900 dark:text-red-200">Unable to load jobs</h3>
        <p className="mt-1 text-xs text-red-700 dark:text-red-300">{result.error}</p>
      </div>
    );
  }

  return <JobsTable initialJobs={result.data} />;
}

export default function RecruiterJobsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-indigo-600" />
            <span>Job Postings</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your open and closed roles, track applicant volume, and edit criteria.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className={cn(
            buttonVariants(),
            "bg-indigo-600 hover:bg-indigo-700 text-white font-medium inline-flex items-center gap-2"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-900" />}>
        <JobsListContent />
      </Suspense>
    </div>
  );
}
