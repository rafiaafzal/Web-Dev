'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { ApplicantRow, ApplicationStatus } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface RankedApplicantsTableProps {
  initialApplicants: ApplicantRow[];
  jobId: string;
}

export function RankedApplicantsTable({
  initialApplicants,
}: RankedApplicantsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<string>('');
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');

  const filteredApplicants = useMemo(() => {
    return initialApplicants
      .filter((app) => {
        // Status filter
        if (statusFilter !== 'all' && app.status !== statusFilter) {
          return false;
        }

        // Min score filter
        if (minScore.trim() !== '') {
          const min = Number(minScore);
          if (!isNaN(min) && (app.total_score == null || app.total_score < min)) {
            return false;
          }
        }

        // Skill or name search
        if (skillSearch.trim() !== '') {
          const q = skillSearch.toLowerCase().trim();
          const matchesName = app.candidate_name.toLowerCase().includes(q);
          const matchesMatched = app.top_matched.some((s) =>
            s.toLowerCase().includes(q)
          );
          const matchesGaps = app.top_gaps.some((g) =>
            g.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesMatched && !matchesGaps) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          if (a.total_score == null && b.total_score == null) return 0;
          if (a.total_score == null) return 1;
          if (b.total_score == null) return -1;
          return b.total_score - a.total_score;
        } else {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [initialApplicants, statusFilter, minScore, skillSearch, sortBy]);

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
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
  };

  if (initialApplicants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
          <Users className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No applicants yet
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
          When candidates apply to this position, their parsed resumes and AI assessments will appear ranked here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client-side Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Skill / Name Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search candidate or skill..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Status select */}
          <div className="w-[150px]">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val ?? 'all')}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="parsed">Parsed</SelectItem>
                <SelectItem value="assessed">Assessed</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min score input */}
          <div className="w-[120px]">
            <Input
              type="number"
              placeholder="Min Score"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Sort By select */}
          <div className="w-[140px]">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val === 'score' || val === 'date') {
                  setSortBy(val);
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Sort by Score</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== 'all' || minScore !== '' || skillSearch !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setMinScore('');
                setSkillSearch('');
              }}
              className="h-9 text-xs text-slate-500 hover:text-slate-900"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {filteredApplicants.length} of {initialApplicants.length} applicants
        </span>
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No applicants match your current filters.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setMinScore('');
              setSkillSearch('');
            }}
            className="text-xs text-indigo-600 mt-1"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredApplicants.map((app, index) => {
              const rank = sortBy === 'score' ? index + 1 : undefined;
              return (
                <div
                  key={app.application_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {rank && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          #{rank}
                        </span>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {app.candidate_name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('capitalize text-xs font-semibold', getStatusBadgeVariant(app.status))}
                    >
                      {app.status}
                    </Badge>
                  </div>

                  {/* Score overview */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Overall Match
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {app.total_score != null ? `${Math.round(app.total_score)}%` : 'Pending'}
                      </span>
                    </div>

                    {app.total_score != null && (
                      <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            app.total_score >= 75
                              ? 'bg-emerald-500'
                              : app.total_score >= 50
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, app.total_score))}%` }}
                        />
                      </div>
                    )}

                    {/* 4 small breakdown indicators */}
                    {app.breakdown && (
                      <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] text-slate-500">
                        <div>
                          <div className="truncate">Skills (50%)</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {Math.round(app.breakdown.skills)}%
                          </div>
                        </div>
                        <div>
                          <div className="truncate">Exp (25%)</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {Math.round(app.breakdown.experience)}%
                          </div>
                        </div>
                        <div>
                          <div className="truncate">Proj (15%)</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {Math.round(app.breakdown.projects)}%
                          </div>
                        </div>
                        <div>
                          <div className="truncate">Qual (10%)</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {Math.round(app.breakdown.qualifications)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Chips */}
                  {(app.top_matched.length > 0 || app.top_gaps.length > 0) && (
                    <div className="space-y-1.5 pt-1">
                      {app.top_matched.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          {app.top_matched.map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {app.top_gaps.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                          {app.top_gaps.map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Button */}
                  <div className="pt-1">
                    <Link
                      href={`/recruiter/applications/${app.application_id}`}
                      className={cn(
                        buttonVariants({ size: 'sm' }),
                        'w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs inline-flex items-center justify-center gap-1.5'
                      )}
                    >
                      <span>Review Application</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-zinc-950/50">
                <TableRow>
                  <TableHead className="w-[60px] text-center font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Candidate</TableHead>
                  <TableHead className="w-[180px] font-semibold">Match Score</TableHead>
                  <TableHead className="w-[200px] font-semibold">Breakdown</TableHead>
                  <TableHead className="font-semibold">Evidence Highlights</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((app, index) => {
                  const rank = sortBy === 'score' ? index + 1 : undefined;
                  return (
                    <TableRow
                      key={app.application_id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <TableCell className="text-center font-bold text-slate-500">
                        {rank ? `#${rank}` : '-'}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {app.candidate_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        {app.total_score != null ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-100">
                                {Math.round(app.total_score)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  app.total_score >= 75
                                    ? 'bg-emerald-500'
                                    : app.total_score >= 50
                                    ? 'bg-indigo-500'
                                    : 'bg-amber-500'
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(0, app.total_score))}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Assessment pending</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {app.breakdown ? (
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Skills (50%)</span>
                              <span className="font-semibold">{Math.round(app.breakdown.skills)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, app.breakdown.skills))}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-0.5">
                              <span>Exp (25%) / Proj (15%)</span>
                              <span className="font-semibold">
                                {Math.round(app.breakdown.experience)}% / {Math.round(app.breakdown.projects)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 max-w-[240px]">
                          {app.top_matched.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              {app.top_matched.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-medium"
                                >
                                  +{s}
                                </span>
                              ))}
                            </div>
                          )}
                          {app.top_gaps.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              {app.top_gaps.map((g) => (
                                <span
                                  key={g}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 font-medium"
                                >
                                  -{g}
                                </span>
                              ))}
                            </div>
                          )}
                          {app.top_matched.length === 0 && app.top_gaps.length === 0 && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize text-xs font-semibold', getStatusBadgeVariant(app.status))}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Link
                          href={`/recruiter/applications/${app.application_id}`}
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'h-8 px-3 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1 font-medium'
                          )}
                        >
                          <span>Review</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
