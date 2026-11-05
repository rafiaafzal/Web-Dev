'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { browseJobs, applyToJob, getMyApplications } from '@/app/actions/applications';
import { recommendJobs } from '@/app/actions/search';
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

  function handleApply(jobId: string, jobTitle: string) {
    setActionMessage(null);
    startTransition(async () => {
      const res = await applyToJob(jobId);
      if (res.ok) {
        setAppliedJobIds((prev) => new Set([...prev, jobId]));
        setActionMessage({
          type: 'success',
          text: `Applied to "${jobTitle}"! AI scoring and evidence matching complete (Status: Assessed).`,
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
    return (
      job.title.toLowerCase().includes(q) ||
      job.department?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      (Array.isArray(job.skills) &&
        job.skills.some((s) => s.name?.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Explore Open Roles
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Apply with your uploaded resume to receive instant, evidence-based AI assessment.
        </p>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by job title, department, or skill (e.g. Python, PostgreSQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className={`mt-4 p-4 rounded-lg text-sm border flex items-center justify-between ${
              actionMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-semibold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* AI Recommendations Section */}
      {recommendedJobs.length > 0 && !searchQuery && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">
              ✦ Recommended For You
            </span>
            <span className="text-xs text-blue-700">
              Matched against your verified resume skills
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.slice(0, 2).map((rec) => {
              const hasApplied = appliedJobIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  className="bg-white p-4 rounded-lg border border-blue-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">
                        {rec.title}
                      </h2>
                      {rec.matchRate !== undefined && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {rec.matchRate}% Skill Fit
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {rec.department} • {rec.location}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      {rec.type}
                    </span>
                    {hasApplied ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Applied ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(rec.id, rec.title)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        {isPending ? 'Applying...' : 'Apply Now'}
                      </button>
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
          <h2 className="text-lg font-bold text-slate-900">
            All Positions ({filteredJobs.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-3">Loading available jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              No matching jobs found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search terms or employment type filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-slate-900">
                        {job.title}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {job.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Department: {job.department || 'Engineering'}</span>
                      <span>•</span>
                      <span>Location: {job.location || 'Remote'}</span>
                      {job.salary && (
                        <>
                          <span>•</span>
                          <span>Salary: {job.salary}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Min Experience: {job.min_experience_years || 0} yrs</span>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                      {job.description}
                    </p>

                    {/* Skill Badges */}
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              s.required
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {s.name} {s.required ? '*' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Area */}
                  <div className="flex flex-col items-end justify-center min-w-[140px]">
                    {hasApplied ? (
                      <div className="text-center space-y-1">
                        <span className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Applied ✓
                        </span>
                        <div className="text-[11px] text-slate-500">
                          <Link
                            href="/candidate"
                            className="text-blue-600 hover:underline"
                          >
                            View in tracker
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={isPending}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition disabled:opacity-50 text-sm"
                      >
                        {isPending ? 'Submitting...' : 'Apply with Resume'}
                      </button>
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
