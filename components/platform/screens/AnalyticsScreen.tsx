"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export function AnalyticsScreen() {
  const stageStats = [
    { stage: "Submitted", count: 148, pct: "100%", color: "bg-slate-600" },
    { stage: "AI Parsed", count: 142, pct: "96%", color: "bg-indigo-600" },
    { stage: "AI Assessed", count: 138, pct: "93%", color: "bg-violet-600" },
    { stage: "Under Review", count: 54, pct: "36%", color: "bg-cyan-600" },
    { stage: "Shortlisted", count: 36, pct: "24%", color: "bg-emerald-600" },
    { stage: "Interview", count: 18, pct: "12%", color: "bg-purple-600" },
    { stage: "Selected", count: 6, pct: "4%", color: "bg-emerald-400" },
  ];

  const jobVolumes = [
    { title: "Senior Backend Engineer", apps: 42, shortlisted: 14, hires: 2 },
    { title: "Lead AI / ML Systems Engineer", apps: 28, shortlisted: 8, hires: 1 },
    { title: "Full-Stack Next.js Architect", apps: 35, shortlisted: 9, hires: 2 },
    { title: "DevOps & Cloud Platform Lead", apps: 25, shortlisted: 4, hires: 1 },
    { title: "Distributed Database Specialist", apps: 18, shortlisted: 1, hires: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <BarChart3 className="h-3 w-3 text-cyan-400" />
            <span>Telemetry & Talent Intelligence Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Enterprise Pipeline Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time conversion velocity, talent supply-demand gaps, and recruiter audit throughput.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#1E293B]/70 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Processing Time</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">18.4h</span>
            <span className="text-xs font-bold text-emerald-400">-3.2h MoM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From resume submission to recruiter action</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#1E293B]/70 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shortlist Rate</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">24.8%</span>
            <span className="text-xs font-bold text-emerald-400">+4.1% MoM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Assessed candidates meeting bar</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#1E293B]/70 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Interviews Conducted</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">46</span>
            <span className="text-xs font-bold text-cyan-400">8 this week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Technical and managerial rounds</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#1E293B]/70 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Verification Accuracy</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">99.4%</span>
            <span className="text-xs font-bold text-emerald-400">Zero Hallucinations</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-referenced against raw PDF text</p>
        </div>
      </div>

      {/* Main Breakdown: Funnel by Stage + Requisition Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Funnel (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>Pipeline Stage Attrition</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across the 7 pipeline stages</p>
          </div>

          <div className="space-y-3">
            {stageStats.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{st.stage}</span>
                  <span className="font-bold text-white">{st.count} ({st.pct})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div style={{ width: st.pct }} className={`h-full ${st.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume by Requisition (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <span>Volume by Active Requisition</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ingested vs Shortlisted vs Hired counts</p>
          </div>

          <div className="space-y-2.5">
            {jobVolumes.map((job, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{job.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{job.apps} Total Applications</p>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {job.shortlisted} Shortlisted
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {job.hires} Hired
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
