'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { browseJobs, applyToJob, getMyApplications } from '@/app/actions/applications';
import { recommendJobs } from '@/app/actions/search';
import { Search, Sparkles, Briefcase, MapPin, CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: { name: string; importance: number; required: boolean }[];
  min_experience_years: number;
  qualifications: string;
  status: string;
  created_at: string;
  matchRate?: number;
};

export default function CandidateBrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedType]);

  async function loadData() {
    setIsLoading(true);
    const [jobsRes, appsRes, recRes] = await Promise.all([
      browseJobs({ type: selectedType }),
      getMyApplications(),
      recommendJobs(),
    ]);

    if (jobsRes.ok) {
      setJobs(jobsRes.data);
    }
    if (appsRes.ok) {
      setAppliedJobIds(new Set(appsRes.data.map((a) => a.job_id)));
    }
    if (recRes.ok) {
      setRecommendedJobs(recRes.data);
    }
    setIsLoading(false);
  }

  async function handleApply(jobId: string, jobTitle: string) {
    if (appliedJobIds.has(jobId)) return;

    setActionMessage(null);
    startTransition(async () => {
      const res = await applyToJob(jobId);
      if (res.ok) {
        setAppliedJobIds((prev) => new Set([...prev, jobId]));
        setActionMessage({
          type: 'success',
          text: `Applied to ${jobTitle}! AI assessment completed with evidence verification.`,
        });
      } else {
        setActionMessage({
          type: 'error',
          text: res.error,
        });
      }
    });
  }

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(q);
    const deptMatch = (job.department || '').toLowerCase().includes(q);
    const skillMatch = job.skills.some((s) => s.name.toLowerCase().includes(q));
    return titleMatch || deptMatch || skillMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Open Positions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply with your uploaded resume to receive instant, transparent AI scoring with verified evidence.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by job title, department, or skill (e.g. Python, Docker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm bg-slate-50/50 border-slate-200 dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>

          <div className="sm:w-52">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white dark:bg-zinc-950 dark:border-zinc-800 text-slate-900 dark:text-zinc-100"
            >
              <option value="all">All Employment Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {actionMessage && (
          <div
            className={cn(
              "mt-4 p-3.5 rounded-lg text-xs border flex items-center justify-between",
              actionMessage.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300"
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-semibold underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* AI Recommendations Section */}
      {recommendedJobs.length > 0 && !searchQuery && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[10px] font-semibold border-indigo-200 bg-indigo-50/70 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
              AI Recommended
            </Badge>
            <span className="text-xs text-slate-500">
              Matched against your verified resume skills
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recommendedJobs.slice(0, 2).map((rec) => {
              const hasApplied = appliedJobIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  className="bg-slate-50/50 p-4 rounded-lg border border-slate-200/60 flex flex-col justify-between dark:bg-zinc-950/50 dark:border-zinc-800"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rec.title}
                      </h2>
                      {rec.matchRate !== undefined && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                          {rec.matchRate}% Fit
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {rec.department || "General"} • {rec.location || "Remote"}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      {rec.type}
                    </span>
                    {hasApplied ? (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        Applied ✓
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApply(rec.id, rec.title)}
                        disabled={isPending}
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                      >
                        {isPending ? 'Applying...' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Jobs Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Available Positions ({filteredJobs.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading available jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
            <Briefcase className="h-9 w-9 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No matching jobs found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or employment type filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 capitalize">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>{job.department || 'General'}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                      {job.salary && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{job.salary}</span>
                        </>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          >
                            {s.name}
                            {s.required && <span className="text-indigo-600 ml-1 font-bold">*</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={isPending}
                        className="h-9 px-4 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                      >
                        {isPending ? 'Analyzing...' : '1-Click Apply'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
