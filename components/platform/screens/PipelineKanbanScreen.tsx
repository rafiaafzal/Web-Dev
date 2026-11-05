"use client";

import React, { useState } from "react";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { MOCK_CANDIDATES, CandidateProfile } from "../mockData";

interface PipelineKanbanScreenProps {
  onSelectCandidate: (id: string) => void;
  onScheduleInterview: (candidateId: string) => void;
}

type StageKey = "submitted" | "parsed" | "assessed" | "review" | "shortlisted" | "interview" | "selected";

const STAGES: { key: StageKey; label: string; countLabel: string; color: string }[] = [
  { key: "submitted", label: "Submitted", countLabel: "Ingested", color: "border-slate-700 bg-slate-800/40 text-slate-300" },
  { key: "parsed", label: "AI Parsed", countLabel: "Normalized", color: "border-indigo-500/30 bg-indigo-950/30 text-indigo-300" },
  { key: "assessed", label: "AI Assessed", countLabel: "Scored", color: "border-violet-500/30 bg-violet-950/30 text-violet-300" },
  { key: "review", label: "Recruiter Review", countLabel: "Action Required", color: "border-cyan-500/30 bg-cyan-950/30 text-cyan-300" },
  { key: "shortlisted", label: "Shortlisted", countLabel: "Qualified", color: "border-emerald-500/30 bg-emerald-950/30 text-emerald-300" },
  { key: "interview", label: "Interview", countLabel: "Scheduled", color: "border-purple-500/30 bg-purple-950/30 text-purple-300" },
  { key: "selected", label: "Selected / Offer", countLabel: "Final Stage", color: "border-emerald-400/40 bg-emerald-950/40 text-emerald-300" },
];

export function PipelineKanbanScreen({ onSelectCandidate, onScheduleInterview }: PipelineKanbanScreenProps) {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(MOCK_CANDIDATES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  const moveCandidate = (id: string, direction: "next" | "prev" | "reject") => {
    const stageKeys: StageKey[] = ["submitted", "parsed", "assessed", "review", "shortlisted", "interview", "selected"];

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (direction === "reject") {
          return { ...c, status: "rejected" as any };
        }

        const currIdx = stageKeys.indexOf(c.status as StageKey);
        if (direction === "next" && currIdx < stageKeys.length - 1) {
          return { ...c, status: stageKeys[currIdx + 1] };
        } else if (direction === "prev" && currIdx > 0) {
          return { ...c, status: stageKeys[currIdx - 1] };
        }
        return c;
      })
    );
  };

  const filteredCandidates = candidates.filter((c) => {
    if (selectedRoleFilter !== "all" && c.targetJobId !== selectedRoleFilter) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(q);
      const roleMatch = c.targetRole.toLowerCase().includes(q);
      const skillMatch = c.skills.some((s) => s.name.toLowerCase().includes(q));
      return nameMatch || roleMatch || skillMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Candidate Pipeline Kanban</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                {filteredCandidates.length} Active Candidates
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive recruitment stages with explainable score telemetry
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, role, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-700 bg-[#0F172A]/80 text-white focus:outline-none focus:border-indigo-500 transition w-56 sm:w-64"
            />
          </div>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-slate-700 bg-[#0F172A]/80 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Requisitions</option>
            <option value="job-1">Senior Backend Engineer</option>
            <option value="job-2">Lead AI / ML Systems Engineer</option>
            <option value="job-3">Full-Stack Next.js Architect</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[620px] select-none">
        {STAGES.map((stage) => {
          const stageCandidates = filteredCandidates.filter((c) => c.status === stage.key);

          return (
            <div
              key={stage.key}
              className="w-80 shrink-0 flex flex-col rounded-2xl border border-slate-800/80 bg-[#1E293B]/40 backdrop-blur-md overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 bg-[#0F172A]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.key === "shortlisted" || stage.key === "selected" ? "bg-emerald-400" : stage.key === "interview" ? "bg-purple-400" : "bg-cyan-400"}`} />
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    {stage.label}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Column Content Area */}
              <div className="p-2.5 flex-1 space-y-3 overflow-y-auto max-h-[580px]">
                {stageCandidates.length === 0 ? (
                  <div className="h-36 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-500 font-medium">No candidates in this stage</p>
                    <p className="text-[10px] text-slate-600 mt-1">Advance from preceding stage</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => {
                    const score = candidate.totalScore;
                    const isHigh = score >= 80;
                    const isMed = score >= 60 && score < 80;
                    const gaugeColor = isHigh
                      ? "stroke-emerald-400 text-emerald-400"
                      : isMed
                      ? "stroke-amber-400 text-amber-400"
                      : "stroke-rose-400 text-rose-400";

                    return (
                      <div
                        key={candidate.id}
                        className="group rounded-xl border border-slate-800 bg-[#0F172A]/85 p-3.5 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.18)] transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Top: Avatar, Name, Radial Score */}
                          <div className="flex items-start justify-between gap-2.5 mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                {candidate.avatar}
                              </div>
                              <div>
                                <h4
                                  onClick={() => onSelectCandidate(candidate.id)}
                                  className="text-xs font-bold text-white hover:text-cyan-300 cursor-pointer transition-colors"
                                >
                                  {candidate.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                  {candidate.company}
                                </p>
                              </div>
                            </div>

                            {/* Radial Percentage Gauge */}
                            <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="16"
                                  className="stroke-slate-800"
                                  strokeWidth="3"
                                  fill="transparent"
                                />
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="16"
                                  className={`${gaugeColor.split(" ")[0]} transition-all duration-500`}
                                  strokeWidth="3"
                                  strokeDasharray={100}
                                  strokeDashoffset={100 - (100 * score) / 100}
                                  strokeLinecap="round"
                                  fill="transparent"
                                />
                              </svg>
                              <span className={`absolute text-[10px] font-extrabold ${gaugeColor.split(" ")[1]}`}>
                                {score}%
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-300 font-medium mb-2 truncate">
                            Role: <span className="text-indigo-300">{candidate.targetRole}</span>
                          </div>

                          {/* Skill Chips */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {candidate.skills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer: Action Controls */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => onSelectCandidate(candidate.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Dossier</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {stage.key === "shortlisted" && (
                              <button
                                onClick={() => onScheduleInterview(candidate.id)}
                                title="Schedule Interview"
                                className="p-1 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => moveCandidate(candidate.id, "prev")}
                              disabled={stage.key === "submitted"}
                              title="Move to previous stage"
                              className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => moveCandidate(candidate.id, "next")}
                              disabled={stage.key === "selected"}
                              title="Advance to next stage"
                              className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
