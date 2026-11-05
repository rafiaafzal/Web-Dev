'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, PieChart as PieIcon, AlertTriangle } from 'lucide-react';
import type { Analytics } from '@/types/recruiter';

interface AnalyticsChartsProps {
  analytics: Analytics;
}

const STAGE_COLORS: Record<string, string> = {
  submitted: '#94a3b8',
  parsed: '#64748b',
  assessed: '#f59e0b',
  review: '#6366f1',
  shortlisted: '#10b981',
  interview: '#3b82f6',
  selected: '#8b5cf6',
  rejected: '#ef4444',
};

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const { by_job, by_stage, common_gaps, totals } = analytics;

  const hasApplicationData = totals.applications > 0;
  const hasJobData = by_job.some((j) => j.applications > 0);
  const hasStageData = by_stage.some((s) => s.count > 0);
  const hasGapData = common_gaps.length > 0;

  // Format stage data for donut/pie
  const stageChartData = by_stage
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
      stage: s.stage,
      count: s.count,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Applications by Job */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>Applications by Job Posting</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Volume of applicant submissions across active and closed roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasJobData ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl dark:border-zinc-800">
              <BarChart3 className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
              <span>No data yet</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={by_job}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="job_title"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Applicants"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Applications by Pipeline Stage */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-indigo-600" />
            <span>Candidate Funnel by Stage</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Current distribution of candidates across hiring pipeline stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasStageData ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl dark:border-zinc-800">
              <PieIcon className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
              <span>No data yet</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {stageChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAGE_COLORS[entry.stage] || '#6366f1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 3: Common Skill Gaps (Horizontal Bar) */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Top Missing Skill Gaps</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Most frequent skill deficiencies flagged across applicant resumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasGapData ? (
            <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl dark:border-zinc-800">
              <AlertTriangle className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
              <span>No data yet</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={common_gaps}
                  margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    name="Missing Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
