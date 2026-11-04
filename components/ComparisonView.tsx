'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  ExternalLink,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import type { ComparisonData, ComparedCandidate, ApplicationStatus } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface ComparisonViewProps {
  data: ComparisonData;
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

export function ComparisonView({ data }: ComparisonViewProps) {
  const { candidates, job } = data;

  if (!candidates || candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No candidates selected for comparison
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Please select 2 to 4 applicants from a job page to view their side-by-side evaluation.
        </p>
      </div>
    );
  }

  // Find max values for numeric rows
  const maxTotalScore = Math.max(
    ...candidates.map((c) => c.assessment?.total_score ?? -1)
  );
  const maxSkills = Math.max(
    ...candidates.map((c) => c.assessment?.breakdown.skills ?? -1)
  );
  const maxExperience = Math.max(
    ...candidates.map((c) => c.assessment?.breakdown.experience ?? -1)
  );
  const maxProjects = Math.max(
    ...candidates.map((c) => c.assessment?.breakdown.projects ?? -1)
  );
  const maxQualifications = Math.max(
    ...candidates.map((c) => c.assessment?.breakdown.qualifications ?? -1)
  );

  return (
    <div className="space-y-6">
      {/* Table Container - Horizontally scrollable */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            {/* Candidate Header Row */}
            <tr className="border-b border-slate-200 bg-slate-50/75 dark:border-zinc-800 dark:bg-zinc-950/50">
              <th className="w-48 min-w-[190px] p-4 font-semibold text-slate-700 dark:text-slate-300 align-top">
                <span className="text-sm font-bold block text-slate-900 dark:text-white">
                  Evaluation Criteria
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Comparing {candidates.length} candidates
                </span>
              </th>
              {candidates.map((candidate) => (
                <th
                  key={candidate.application_id}
                  className="min-w-[260px] p-4 align-top border-l border-slate-200 dark:border-zinc-800"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {candidate.candidate_name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-semibold capitalize', getStatusBadgeStyle(candidate.status))}
                      >
                        {candidate.status}
                      </Badge>
                    </div>
                    <Link
                      href={`/recruiter/applications/${candidate.application_id}`}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'h-7 px-2.5 text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50 inline-flex items-center gap-1'
                      )}
                    >
                      <span>Review Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {/* Row 1: Overall Match Score */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span>Total Match Score</span>
                </div>
              </td>
              {candidates.map((c) => {
                const score = c.assessment?.total_score != null ? Math.round(c.assessment.total_score) : null;
                const isHighest = score != null && score === maxTotalScore && maxTotalScore > 0;

                return (
                  <td
                    key={c.application_id}
                    className={cn(
                      'p-4 border-l border-slate-200 dark:border-zinc-800',
                      isHighest && 'bg-emerald-50/40 dark:bg-emerald-950/20'
                    )}
                  >
                    {score != null ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xl font-extrabold',
                              isHighest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                            )}
                          >
                            {score}%
                          </span>
                          {isHighest && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border-emerald-300"
                            >
                              Highest Match
                            </Badge>
                          )}
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                            )}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pending</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Skills Match (50%) */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                <span>Skills Match (50%)</span>
              </td>
              {candidates.map((c) => {
                const val = c.assessment?.breakdown.skills != null ? Math.round(c.assessment.breakdown.skills) : null;
                const isHighest = val != null && val === maxSkills && maxSkills > 0;
                return (
                  <td
                    key={c.application_id}
                    className={cn(
                      'p-4 border-l border-slate-200 dark:border-zinc-800',
                      isHighest && 'bg-emerald-50/30 dark:bg-emerald-950/10'
                    )}
                  >
                    {val != null ? (
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={cn(isHighest && 'text-emerald-700 font-bold')}>{val}%</span>
                          {isHighest && <span className="text-[10px] text-emerald-600 font-bold">Top</span>}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Experience Duration (25%) */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                <span>Experience Duration (25%)</span>
              </td>
              {candidates.map((c) => {
                const val = c.assessment?.breakdown.experience != null ? Math.round(c.assessment.breakdown.experience) : null;
                const isHighest = val != null && val === maxExperience && maxExperience > 0;
                return (
                  <td
                    key={c.application_id}
                    className={cn(
                      'p-4 border-l border-slate-200 dark:border-zinc-800',
                      isHighest && 'bg-emerald-50/30 dark:bg-emerald-950/10'
                    )}
                  >
                    {val != null ? (
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={cn(isHighest && 'text-emerald-700 font-bold')}>{val}%</span>
                          {isHighest && <span className="text-[10px] text-emerald-600 font-bold">Top</span>}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Project Relevance (15%) */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                <span>Project Relevance (15%)</span>
              </td>
              {candidates.map((c) => {
                const val = c.assessment?.breakdown.projects != null ? Math.round(c.assessment.breakdown.projects) : null;
                const isHighest = val != null && val === maxProjects && maxProjects > 0;
                return (
                  <td
                    key={c.application_id}
                    className={cn(
                      'p-4 border-l border-slate-200 dark:border-zinc-800',
                      isHighest && 'bg-emerald-50/30 dark:bg-emerald-950/10'
                    )}
                  >
                    {val != null ? (
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={cn(isHighest && 'text-emerald-700 font-bold')}>{val}%</span>
                          {isHighest && <span className="text-[10px] text-emerald-600 font-bold">Top</span>}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 5: Qualifications (10%) */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                <span>Qualifications (10%)</span>
              </td>
              {candidates.map((c) => {
                const val = c.assessment?.breakdown.qualifications != null ? Math.round(c.assessment.breakdown.qualifications) : null;
                const isHighest = val != null && val === maxQualifications && maxQualifications > 0;
                return (
                  <td
                    key={c.application_id}
                    className={cn(
                      'p-4 border-l border-slate-200 dark:border-zinc-800',
                      isHighest && 'bg-emerald-50/30 dark:bg-emerald-950/10'
                    )}
                  >
                    {val != null ? (
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={cn(isHighest && 'text-emerald-700 font-bold')}>{val}%</span>
                          {isHighest && <span className="text-[10px] text-emerald-600 font-bold">Top</span>}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 6: Matched Skills with Excerpt Quotes */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-top">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Matched Skills & Evidence</span>
                </div>
              </td>
              {candidates.map((c) => {
                const matched = c.assessment?.matched_skills || [];
                return (
                  <td
                    key={c.application_id}
                    className="p-4 align-top border-l border-slate-200 dark:border-zinc-800"
                  >
                    {matched.length === 0 ? (
                      <span className="text-slate-400 italic">No matches</span>
                    ) : (
                      <div className="space-y-2">
                        {matched.map((m, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-emerald-50/40 p-2 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                                {m.skill}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-medium">
                                {Math.round(m.similarity * 100)}%
                              </span>
                            </div>
                            {m.excerpt && (
                              <blockquote className="border-l border-emerald-300 pl-1.5 text-[10px] text-slate-500 italic">
                                &ldquo;{m.excerpt}&rdquo;
                              </blockquote>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 7: Skill Gaps */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-top">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Skill Gaps</span>
                </div>
              </td>
              {candidates.map((c) => {
                const gaps = c.assessment?.gaps || [];
                return (
                  <td
                    key={c.application_id}
                    className="p-4 align-top border-l border-slate-200 dark:border-zinc-800"
                  >
                    {gaps.length === 0 ? (
                      <span className="text-emerald-600 font-medium">No gaps detected</span>
                    ) : (
                      <div className="space-y-1.5">
                        {gaps.map((g, idx) => {
                          const isConfirmed = g.status === 'confirmed_absent';
                          return (
                            <div
                              key={idx}
                              className={cn(
                                'rounded-lg p-2 border space-y-0.5',
                                isConfirmed
                                  ? 'bg-red-50/40 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/40'
                                  : 'bg-amber-50/40 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs">{g.skill}</span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[9px] px-1 py-0',
                                    isConfirmed
                                      ? 'bg-red-100 text-red-800 border-red-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  )}
                                >
                                  {isConfirmed ? 'Confirmed absent' : 'Missing evidence'}
                                </Badge>
                              </div>
                              {g.note && (
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  {g.note}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 8: Missing Information & Unverified Claims */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-top">
                <div className="flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-slate-500" />
                  <span>Missing Information</span>
                </div>
              </td>
              {candidates.map((c) => (
                <td
                  key={c.application_id}
                  className="p-4 align-top border-l border-slate-200 dark:border-zinc-800"
                >
                  {c.missing_information.length === 0 ? (
                    <span className="text-emerald-600 font-medium">None</span>
                  ) : (
                    <ul className="space-y-1 list-disc pl-3 text-[11px] text-slate-600 dark:text-slate-400">
                      {c.missing_information.map((info, idx) => (
                        <li key={idx}>{info}</li>
                      ))}
                    </ul>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 9: AI Summary */}
            <tr className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/30">
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 align-top">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>AI Assessment Summary</span>
                </div>
              </td>
              {candidates.map((c) => (
                <td
                  key={c.application_id}
                  className="p-4 align-top border-l border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  {c.assessment?.summary || <span className="text-slate-400 italic">No summary available</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
