import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { compareApplications } from '@/app/actions/compare';
import { ComparisonView } from '@/components/ComparisonView';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  await requireRole('recruiter');
  const { ids } = await searchParams;

  const idList = (ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (idList.length < 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to jobs</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Select 2 to 4 candidates to compare
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Candidate comparison requires between 2 and 4 candidate applications. Go to any job applicants page and select candidate checkboxes to compare.
          </p>
          <div className="mt-6">
            <Link
              href="/recruiter/jobs"
              className={cn(buttonVariants({ size: 'sm' }), 'bg-indigo-600 hover:bg-indigo-700 text-white')}
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const result = await compareApplications(idList);

  if (!result.ok) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to jobs</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
            Comparison Error
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1 max-w-md mx-auto">
            {result.error || 'Failed to compare candidates.'}
          </p>
        </div>
      </div>
    );
  }

  const { job } = result.data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation */}
      <div>
        <Link
          href={job?.id ? `/recruiter/jobs/${job.id}` : '/recruiter/jobs'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {job?.title ? `${job.title} applicants` : 'job applicants'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Side-by-Side Candidate Comparison
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {job?.title ? (
                <>Comparing applicants for <strong className="text-slate-700 dark:text-slate-300">{job.title}</strong></>
              ) : (
                'Comparing selected candidates'
              )}
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-700 font-medium self-start md:self-auto">
            {result.data.candidates.length} Candidates Selected
          </span>
        </div>
      </div>

      {/* Comparison View */}
      <ComparisonView data={result.data} />
    </div>
  );
}
