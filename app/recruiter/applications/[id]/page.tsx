import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getApplicationDetail } from '@/app/actions/recruiter';
import { AssessmentScoreRing } from '@/components/AssessmentScoreRing';
import { InterviewQuestions } from '@/components/InterviewQuestions';
import { InterviewPanel } from '@/components/InterviewPanel';
import { PipelineActionBar } from '@/components/PipelineActionBar';
import { RecruiterNotesPanel } from '@/components/RecruiterNotesPanel';
import { AuditTimeline } from '@/components/AuditTimeline';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type { ApplicationStatus } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusBadgeStyle(status: ApplicationStatus) {
  switch (status) {
    case 'shortlisted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'interview':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'selected':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'review':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300';
    case 'assessed':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300';
  }
}

export default async function ApplicationReviewPage({ params }: PageProps) {
  await requireRole('recruiter');
  const { id } = await params;

  const result = await getApplicationDetail(id);

  if (!result.ok || !result.data) {
    notFound();
  }

  const {
    application,
    job,
    candidate,
    resume,
    assessment,
    events,
    notes,
  } = result.data;

  const candidateName = candidate?.full_name || 'Anonymous Candidate';
  const unverifiedSkills = (resume?.skills || []).filter((s) => s.verified === false);
  const hasVerificationIssues =
    (assessment?.unsupported_claims && assessment.unsupported_claims.length > 0) ||
    unverifiedSkills.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href={job?.id ? `/recruiter/jobs/${job.id}` : '/recruiter/jobs'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {job?.title || 'Job Applicants'}</span>
        </Link>
      </div>

      {/* Header section: name, job, status badge, date */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-lg dark:bg-indigo-950 dark:text-indigo-400">
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {candidateName}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('text-xs font-semibold capitalize', getStatusBadgeStyle(application.status))}
                >
                  {application.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {candidate?.email && <span>{candidate.email}</span>}
                {job?.title && (
                  <span className="flex items-center gap-1">
                    • <Briefcase className="h-3 w-3 inline text-slate-400" />
                    Applied for <strong>{job.title}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  • <Calendar className="h-3 w-3 inline text-slate-400" />
                  Submitted on {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (AI Assessment & Resume), Right Column (Notes & Audit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Assessment Section */}
          {!assessment ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
              <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                Assessment Pending
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-md mx-auto">
                This candidate&apos;s resume is currently queued for automated skill verification and semantic matching.
              </p>
            </div>
          ) : (
            <>
              {/* Score Ring with 4 Weighted Bars */}
              <AssessmentScoreRing assessment={assessment} />

              {/* AI Summary and Learning Suggestions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Candidate Evaluation Summary
                  </h3>
                </div>

                {assessment.summary ? (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 dark:bg-zinc-800/50 dark:border-zinc-800">
                    {assessment.summary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No summary generated.</p>
                )}

                {assessment.learning_suggestions && assessment.learning_suggestions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Upskilling & Onboarding Suggestions:
                    </span>
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-600 dark:text-slate-400">
                      {assessment.learning_suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Matched Skills with Similarity and Resume Excerpt */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Verified Matching Skills ({assessment.matched_skills.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">With resume evidence</span>
                </div>

                {assessment.matched_skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No matching skills identified.</p>
                ) : (
                  <div className="space-y-3">
                    {assessment.matched_skills.map((item, idx) => {
                      const simPercent = Math.round(item.similarity * 100);
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 text-xs dark:border-emerald-950 dark:bg-emerald-950/20 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                              {item.skill}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold bg-emerald-100/60 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300"
                            >
                              {simPercent}% Match
                            </Badge>
                          </div>
                          {item.excerpt && (
                            <blockquote className="border-l-2 border-emerald-400 pl-2.5 text-xs text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-zinc-900/60 p-2 rounded-r">
                              &ldquo;{item.excerpt}&rdquo;
                            </blockquote>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Gaps: Missing Evidence vs Confirmed Absent */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Skill Gaps & Discrepancies ({assessment.gaps.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400" title="Missing evidence: Not mentioned or verifiable in resume. Confirmed absent: Explicitly stated as absent or confirmed by recruiter.">
                    <Info className="h-3 w-3" />
                    <span>Evidence-based gap detection</span>
                  </div>
                </div>

                {/* Explanatory banner */}
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100 dark:bg-zinc-800/50 dark:text-slate-400 dark:border-zinc-800">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Missing Evidence</strong>: Skill not found in resume text (candidate may still possess it).{' '}
                    <strong>Confirmed Absent</strong>: Candidate explicitly stated no experience or recruiter verified absence.
                  </span>
                </div>

                {assessment.gaps.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">
                    No critical skill gaps found for this job!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assessment.gaps.map((gap, idx) => {
                      const isConfirmed = gap.status === 'confirmed_absent';
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'rounded-xl border p-3.5 text-xs space-y-1.5',
                            isConfirmed
                              ? 'border-red-200 bg-red-50/30 dark:border-red-950 dark:bg-red-950/20'
                              : 'border-amber-200 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                'font-semibold text-sm',
                                isConfirmed
                                  ? 'text-red-900 dark:text-red-200'
                                  : 'text-amber-900 dark:text-amber-200'
                              )}
                            >
                              {gap.skill}
                            </span>
                            <Badge
                              variant="outline"
                              title={
                                isConfirmed
                                  ? 'Confirmed absent: Explicitly stated as absent in resume or confirmed absent by recruiter.'
                                  : 'Missing evidence: Not mentioned or verifiable in resume. Candidate may still have this skill.'
                              }
                              className={cn(
                                'text-[10px] font-semibold cursor-help',
                                isConfirmed
                                  ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-300'
                              )}
                            >
                              {isConfirmed ? 'Confirmed absent' : 'Missing evidence'}
                            </Badge>
                          </div>
                          {gap.note && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {gap.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Needs Manual Verification Card */}
              {hasVerificationIssues && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-6 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Needs Manual Verification
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    The following claims or skills could not be verified directly against the candidate&apos;s raw resume text and were excluded from scoring to prevent hallucination:
                  </p>

                  {assessment.unsupported_claims && assessment.unsupported_claims.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                        Unsupported Claims:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900 dark:text-amber-300">
                        {assessment.unsupported_claims.map((claim, idx) => (
                          <li key={idx}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {unverifiedSkills.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 block mb-1">
                        Unverified Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {unverifiedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-300 font-medium dark:bg-zinc-900 dark:text-amber-300 dark:border-amber-800"
                          >
                            {s.name}
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-800">
                              unverified
                            </Badge>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Parsed Resume Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Parsed Resume Data
              </h3>
            </div>

            {!resume ? (
              <p className="text-xs text-slate-400 italic">No parsed resume available.</p>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Extracted Skills */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Extracted Skills ({resume.skills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(resume.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border',
                          skill.verified === false
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        )}
                        title={skill.excerpt ? `Excerpt: ${skill.excerpt}` : undefined}
                      >
                        <span>{skill.name}</span>
                        {skill.verified === false && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 bg-amber-100 text-amber-800 border-amber-300">
                            unverified
                          </Badge>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      Work Experience
                    </h4>
                    {resume.total_experience_years != null && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Total: {resume.total_experience_years} years
                      </span>
                    )}
                  </div>

                  {(resume.experience || []).length === 0 ? (
                    <p className="text-slate-400 italic">No experience listed.</p>
                  ) : (
                    <div className="space-y-3">
                      {resume.experience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {exp.title}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {exp.years} {exp.years === 1 ? 'year' : 'years'}
                            </span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 font-medium">
                            {exp.company}
                          </div>
                          {exp.summary && (
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {exp.summary}
                            </p>
                          )}
                          {exp.excerpt && (
                            <blockquote className="border-l-2 border-indigo-300 pl-2 text-[11px] text-slate-500 italic mt-1">
                              &ldquo;{exp.excerpt}&rdquo;
                            </blockquote>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Projects
                  </h4>
                  {(resume.projects || []).length === 0 ? (
                    <p className="text-slate-400 italic">No projects listed.</p>
                  ) : (
                    <div className="space-y-3">
                      {resume.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800 space-y-1.5"
                        >
                          <span className="font-bold text-slate-900 dark:text-white">
                            {proj.name}
                          </span>
                          {proj.description && (
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                          {proj.tech && proj.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.tech.map((t, tIdx) => (
                                <Badge
                                  key={tIdx}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {proj.excerpt && (
                            <blockquote className="border-l-2 border-indigo-300 pl-2 text-[11px] text-slate-500 italic mt-1">
                              &ldquo;{proj.excerpt}&rdquo;
                            </blockquote>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      Education
                    </h4>
                  </div>
                  {(resume.education || []).length === 0 ? (
                    <p className="text-slate-400 italic">No education listed.</p>
                  ) : (
                    <div className="space-y-2">
                      {resume.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {edu.degree}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {edu.institution}
                            </span>
                          </div>
                          {edu.year && (
                            <span className="text-slate-400 text-[11px]">{edu.year}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interview Questions Section */}
          <InterviewQuestions applicationId={application.id} />

          {/* Interview Panel Section */}
          <InterviewPanel applicationId={application.id} status={application.status} />
        </div>

        {/* Right Column (4 cols) - Notes & Audit History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recruiter Notes Panel */}
          <RecruiterNotesPanel
            applicationId={application.id}
            initialNotes={notes}
          />

          {/* Audit Trail Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Audit Trail
            </h3>
            <AuditTimeline events={events} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Pipeline Action Bar */}
      <PipelineActionBar
        applicationId={application.id}
        currentStatus={application.status}
        candidateName={candidateName}
      />
    </div>
  );
}
