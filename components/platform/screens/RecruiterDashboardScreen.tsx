"use client";

import React from "react";
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { MOCK_CANDIDATES, MOCK_JOBS } from "../mockData";

interface ScreenProps {
  onSelectCandidate: (id: string) => void;
  onNavigate: (screen: string) => void;
}

export function RecruiterDashboardScreen({ onSelectCandidate, onNavigate }: ScreenProps) {
  const topCandidates = [...MOCK_CANDIDATES].sort((a, b) => b.totalScore - a.totalScore);
  const activeJobs = MOCK_JOBS.filter((j) => j.status === "open");

  // Telemetry metrics
  const telemetry = [
    {
      label: "Active Requisitions",
      value: "12",
      change: "+2 this week",
      trend: "up",
      icon: Briefcase,
      accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
      sparkline: [30, 40, 35, 50, 49, 60, 70, 91],
    },
    {
      label: "Candidate Pool",
      value: "148",
      change: "+18 today",
      trend: "up",
      icon: Users,
      accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      sparkline: [40, 50, 60, 55, 70, 85, 95, 120],
    },
    {
      label: "Pending AI Reviews",
      value: "19",
      change: "4 priority",
      trend: "neutral",
      icon: AlertCircle,
      accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      sparkline: [25, 20, 22, 19, 18, 20, 19, 19],
    },
    {
      label: "Avg Time to Shortlist",
      value: "18.4h",
      change: "-3.2h vs benchmark",
      trend: "down-positive",
      icon: Clock,
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      sparkline: [80, 70, 60, 55, 40, 30, 25, 18],
    },
    {
      label: "Shortlist Conversion",
      value: "24.8%",
      change: "+4.1% MoM",
      trend: "up",
      icon: TrendingUp,
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      sparkline: [15, 18, 17, 20, 21, 23, 22, 25],
    },
  ];

  // Funnel counts
  const funnelStages = [
    { label: "Submitted", count: 148, pct: "100%", color: "bg-slate-600" },
    { label: "AI Parsed", count: 142, pct: "96%", color: "bg-indigo-600" },
    { label: "AI Assessed", count: 138, pct: "93%", color: "bg-violet-600" },
    { label: "Recruiter Review", count: 54, pct: "36%", color: "bg-cyan-600" },
    { label: "Shortlisted", count: 36, pct: "24%", color: "bg-emerald-600" },
    { label: "Interview", count: 18, pct: "12%", color: "bg-purple-600" },
    { label: "Offer / Selected", count: 6, pct: "4%", color: "bg-emerald-400" },
  ];

  // Skill gaps
  const skillGaps = [
    { skill: "Kubernetes Orchestration", frequency: "42% of applicants", severity: "High Gap", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { skill: "PostgreSQL Advanced Partitioning", frequency: "31% of applicants", severity: "Moderate Gap", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { skill: "Distributed Tracing (OpenTelemetry)", frequency: "28% of applicants", severity: "Moderate Gap", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { skill: "Redis Pub/Sub Architecture", frequency: "19% of applicants", severity: "Low Gap", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Live Requisition Header */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#1E1B4B]/80 via-[#1E293B]/70 to-[#0F172A]/90 p-6 backdrop-blur-md shadow-lg shadow-indigo-950/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span>Autonomous Talent Telemetry • Live Model: Gemini 2.5 Flash</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Recruitment Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Real-time explainable scoring, automated requirement extraction, and verbatim hallucination verification across all active hiring pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("jobs")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
            >
              <Briefcase className="h-4 w-4 text-cyan-400" />
              <span>Create Job Post</span>
            </button>
            <button
              onClick={() => onNavigate("pipeline")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-violet-500 transition shadow-md shadow-indigo-600/30"
            >
              <UserCheck className="h-4 w-4" />
              <span>Open Kanban Pipeline</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {telemetry.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-800/80 bg-[#1E293B]/70 p-4.5 backdrop-blur-md hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
                  {item.label}
                </span>
                <div className={`h-8 w-8 rounded-xl border flex items-center justify-center ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {item.change}
                </span>
              </div>

              {/* Mini Sparkline Visualization */}
              <div className="mt-3 flex items-end gap-1 h-6 pt-1">
                {item.sparkline.map((val, sIdx) => {
                  const heightPct = Math.max(15, Math.min(100, (val / 120) * 100));
                  return (
                    <div
                      key={sIdx}
                      style={{ height: `${heightPct}%` }}
                      className="flex-1 rounded-xs bg-indigo-500/30 group-hover:bg-indigo-400/60 transition-all duration-300"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Grid: Pipeline Funnel + Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Chart Card (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Application-to-Offer Funnel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time conversion efficiency across all stages
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              148 Total Ingested
            </span>
          </div>

          <div className="space-y-3">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{stage.count}</span>
                    <span className="text-slate-400 text-[11px]">({stage.pct})</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900/80 overflow-hidden border border-slate-800">
                  <div
                    style={{ width: stage.pct }}
                    className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>AI Assessment saves an estimated <strong>14.2 recruiter hours</strong> per candidate cohort.</span>
            </div>
            <button
              onClick={() => onNavigate("pipeline")}
              className="font-semibold underline hover:text-cyan-300 shrink-0 ml-2"
            >
              View Pipeline
            </button>
          </div>
        </div>

        {/* Common Skill Gaps Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Common Talent Skill Gaps
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Top missing evidence detected across incoming resumes
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {skillGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-800 bg-[#0F172A]/60 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{gap.skill}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{gap.frequency}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${gap.color}`}>
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate("search")}
              className="w-full text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5"
            >
              <span>Search specific missing skills via Semantic Talent Search</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Ranked Candidates Strip */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Highest Match Candidates (AI Verified)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked with 50/25/15/10 explainable scoring model
            </p>
          </div>

          <button
            onClick={() => onNavigate("pipeline")}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Applicants ({MOCK_CANDIDATES.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCandidates.slice(0, 3).map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate.id)}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {candidate.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {candidate.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">
                        {candidate.company}
                      </p>
                    </div>
                  </div>

                  {/* Circular Match Gauge */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center h-11 w-11">
                      <svg className="w-11 h-11 transform -rotate-90">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          className="stroke-slate-800"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          className="stroke-emerald-400"
                          strokeWidth="3.5"
                          strokeDasharray={113}
                          strokeDashoffset={113 - (113 * candidate.totalScore) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-extrabold text-emerald-400">
                        {candidate.totalScore}%
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                      Match
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 mb-2 font-medium">
                  Applying for: <span className="text-indigo-300">{candidate.targetRole}</span>
                </div>

                {/* Verified Skills Preview */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {candidate.skills.slice(0, 3).map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/20"
                    >
                      {s.name} ✓
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{candidate.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{candidate.appliedDate}</span>
                <span className="font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Inspect Evidence</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
