import { getMyApplications } from '@/app/actions/applications';
import { getMyResume } from '@/app/actions/resumes';
import Link from 'next/link';

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

  const statusColors: Record<string, string> = {
    submitted: 'bg-slate-100 text-slate-800 border-slate-300',
    parsed: 'bg-blue-100 text-blue-800 border-blue-300',
    assessed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    review: 'bg-amber-100 text-amber-800 border-amber-300',
    shortlisted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    interview: 'bg-purple-100 text-purple-800 border-purple-300',
    selected: 'bg-green-100 text-green-900 border-green-400 font-semibold',
    rejected: 'bg-rose-100 text-rose-800 border-rose-300',
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Candidate Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track your applications, resume status, and match assessments.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/candidate/resume"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            {resume ? 'Manage Resume' : 'Upload Resume'}
          </Link>
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Applications
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {totalApps}
          </div>
          <div className="text-xs text-slate-500 mt-1">Jobs applied to</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            In Active Pipeline
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {inPipeline}
          </div>
          <div className="text-xs text-slate-500 mt-1">Under consideration</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Shortlisted / Interview
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {shortlistedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Next stage reached</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resume Status
          </div>
          <div className="mt-2 flex items-center">
            {resume?.status === 'parsed' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                Parsed & Verified
              </span>
            ) : resume?.status === 'empty' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Scanned / Empty Text
              </span>
            ) : resume?.status === 'failed' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                Parse Failed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Not Uploaded
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2 truncate">
            {resume ? resume.file_name : 'No file on record'}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            My Applications & Status Tracker
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {applications.length} total
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-slate-400">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No applications yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Upload your resume first, then browse open positions to submit an application.
            </p>
            <Link
              href="/candidate/jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Explore Open Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {applications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-slate-50/50 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {app.job?.title || 'Open Position'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{app.job?.department || 'Engineering'}</span>
                      <span>•</span>
                      <span>{app.job?.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{app.job?.type || 'Full-time'}</span>
                      <span>•</span>
                      <span>
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        statusColors[app.status] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>
                </div>

                {/* Interview Notification Banner */}
                {app.interview && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span>
                        <strong>Interview Scheduled:</strong> with {app.interview.interviewer_name} ({app.interview.type} round, {app.interview.duration_min} mins)
                      </span>
                    </div>
                    <span className="font-semibold text-purple-700 bg-white px-2.5 py-1 rounded border border-purple-100 w-fit">
                      {new Date(app.interview.scheduled_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Pipeline visual steps */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span
                      className={
                        ['submitted', 'parsed', 'assessed', 'review', 'shortlisted', 'interview', 'selected'].includes(
                          app.status
                        )
                          ? 'text-blue-600 font-bold'
                          : ''
                      }
                    >
                      1. Submitted
                    </span>
                    <span>→</span>
                    <span
                      className={
                        ['parsed', 'assessed', 'review', 'shortlisted', 'interview', 'selected'].includes(
                          app.status
                        )
                          ? 'text-blue-600 font-bold'
                          : ''
                      }
                    >
                      2. Parsed & Verified
                    </span>
                    <span>→</span>
                    <span
                      className={
                        ['assessed', 'review', 'shortlisted', 'interview', 'selected'].includes(
                          app.status
                        )
                          ? 'text-blue-600 font-bold'
                          : ''
                      }
                    >
                      3. AI Assessed
                    </span>
                    <span>→</span>
                    <span
                      className={
                        ['review', 'shortlisted', 'interview', 'selected'].includes(
                          app.status
                        )
                          ? 'text-amber-600 font-bold'
                          : ''
                      }
                    >
                      4. Recruiter Review
                    </span>
                    <span>→</span>
                    <span
                      className={
                        ['shortlisted', 'interview', 'selected'].includes(app.status)
                          ? 'text-emerald-600 font-bold'
                          : app.status === 'rejected'
                          ? 'text-rose-600 font-bold'
                          : ''
                      }
                    >
                      {app.status === 'rejected' ? 'Rejected' : '5. Shortlisted'}
                    </span>
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
