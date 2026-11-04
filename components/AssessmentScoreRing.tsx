import React from 'react';
import type { Assessment } from '@/types/core';
import { cn } from '@/lib/utils';

interface AssessmentScoreRingProps {
  assessment: Assessment;
}

export function AssessmentScoreRing({ assessment }: AssessmentScoreRingProps) {
  const total = Math.min(100, Math.max(0, Math.round(assessment.total_score)));
  const { skills, experience, projects, qualifications } = assessment.breakdown;

  // SVG ring parameters
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (total / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 75) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 50) return 'text-indigo-600 stroke-indigo-600';
    return 'text-amber-500 stroke-amber-500';
  };

  const getBarColor = (val: number) => {
    if (val >= 75) return 'bg-emerald-500';
    if (val >= 50) return 'bg-indigo-600';
    return 'bg-amber-500';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        AI Match Score & Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg
              className="w-36 h-36 transform -rotate-90"
              viewBox="0 0 130 130"
            >
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-100 dark:stroke-zinc-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground progress circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className={cn('transition-all duration-700 ease-out', getScoreColor(total))}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {total}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 -mt-0.5">
                / 100
              </span>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Overall Candidate Match
            </span>
          </div>
        </div>

        {/* 4 Weighted Bars */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Skills (50%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Skills Match <span className="text-slate-400 font-normal">(50% weight)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.round(skills)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getBarColor(skills))}
                style={{ width: `${Math.min(100, Math.max(0, skills))}%` }}
              />
            </div>
          </div>

          {/* Experience (25%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Experience Duration <span className="text-slate-400 font-normal">(25% weight)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.round(experience)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getBarColor(experience))}
                style={{ width: `${Math.min(100, Math.max(0, experience))}%` }}
              />
            </div>
          </div>

          {/* Projects (15%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Project Relevance <span className="text-slate-400 font-normal">(15% weight)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.round(projects)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getBarColor(projects))}
                style={{ width: `${Math.min(100, Math.max(0, projects))}%` }}
              />
            </div>
          </div>

          {/* Qualifications (10%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Qualifications & Education <span className="text-slate-400 font-normal">(10% weight)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.round(qualifications)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-zinc-800">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getBarColor(qualifications))}
                style={{ width: `${Math.min(100, Math.max(0, qualifications))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
