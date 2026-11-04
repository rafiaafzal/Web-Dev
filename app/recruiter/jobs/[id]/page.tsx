import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getJob } from '@/app/actions/jobs';
import { listApplicants } from '@/app/actions/recruiter';
import { RankedApplicantsTable } from '@/components/RankedApplicantsTable';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Edit,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobApplicantsPage({ params }: PageProps) {
  await requireRole('recruiter');
  const { id } = await params;

  const [jobResult, applicantsResult] = await Promise.all([
    getJob(id),
    listApplicants(id),
  ]);

  if (!jobResult.ok || !jobResult.data) {
    notFound();
  }

  const job = jobResult.data;
  const applicants = applicantsResult.ok ? applicantsResult.data : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation */}
      <div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to all jobs</span>
        </Link>
      </div>

      {/* Job Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {job.department && <span>{job.department}</span>}
                  {job.location && (
                    <span className="flex items-center gap-0.5">
                      • <MapPin className="h-3 w-3 inline" /> {job.location}
                    </span>
                  )}
                  <span className="capitalize">• {job.type}</span>
                  {job.salary && <span>• {job.salary}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-3">
            <Badge
              variant={job.status === 'open' ? 'default' : 'secondary'}
              className={
                job.status === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                  : 'bg-slate-100 text-slate-600 font-semibold'
              }
            >
              {job.status === 'open' ? 'Active' : 'Closed'}
            </Badge>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              <Users className="h-3.5 w-3.5" />
              {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
            </span>

            <Link
              href={`/recruiter/jobs/${job.id}/edit`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'h-8 text-xs inline-flex items-center gap-1.5'
              )}
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Job</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Ranked Applicants Table */}
      <RankedApplicantsTable initialApplicants={applicants} jobId={job.id} />
    </div>
  );
}
