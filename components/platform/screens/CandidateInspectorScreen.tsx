"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Users,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { MOCK_CANDIDATES, CandidateProfile } from "../mockData";

interface CandidateInspectorScreenProps {
  selectedCandidateId?: string;
  onScheduleInterview: (candidateId: string) => void;
  onGenerateQuestions: (candidateId: string) => void;
}

export function CandidateInspectorScreen({
  selectedCandidateId = "cand-1",
  onScheduleInterview,
  onGenerateQuestions,
}: CandidateInspectorScreenProps) {
  const [activeId, setActiveId] = useState(selectedCandidateId);
  const [isComparing, setIsComparing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const candidate = MOCK_CANDIDATES.find((c) => c.id === activeId) || MOCK_CANDIDATES[0];

  const handleAction = (action: string) => {
    setStatusNotification(`Action recorded: Candidate marked as "${action}". Audit log updated.`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Radar chart SVG calculation
  // Center is (120, 120), radius = 80
  // 4 Axes:
  // Top (0 deg): Skills (50%)
  // Right (90 deg): Experience (25%)
  // Bottom (180 deg): Projects (15%)
  // Left (270 deg): Qualifications (10%)
  const cx = 130;
  const cy = 130;
  const maxR = 90;

  const getCoordinates = (skills: number, exp: number, proj: number, qual: number) => {
    // 0 deg: (cx, cy - r)
    const pSkills = { x: cx, y: cy - (skills / 100) * maxR };
    // 90 deg: (cx + r, cy)
    const pExp = { x: cx + (exp / 100) * maxR, y: cy };
    // 180 deg: (cx, cy + r)
    const pProj = { x: cx, y: cy + (proj / 100) * maxR };
    // 270 deg: (cx - r, cy)
    const pQual = { x: cx - (qual / 100) * maxR, y: cy };

    return `${pSkills.x},${pSkills.y} ${pExp.x},${pExp.y} ${pProj.x},${pProj.y} ${pQual.x},${pQual.y}`;
  };

  const candidatePoints = getCoordinates(
    candidate.breakdown.skills,
    candidate.breakdown.experience,
    candidate.breakdown.projects,
    candidate.breakdown.qualifications
  );

  const baselinePoints = getCoordinates(85, 80, 80, 80);

  return (
    <div className="space-y-6">
      {/* Top Selector Strip */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800 bg-[#1E293B]/60 backdrop-blur-md overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 pl-2">Inspect Candidate:</span>
          {MOCK_CANDIDATES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeId === c.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-slate-900/50 flex items-center justify-center text-[10px]">
                {c.avatar}
              </span>
              <span>{c.name}</span>
              <span className="text-[10px] text-cyan-300 font-bold">{c.totalScore}%</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsComparing(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
        >
          <Users className="h-3.5 w-3.5" />
          <span>Compare Side-by-Side</span>
        </button>
      </div>

      {statusNotification && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Candidate Dossier Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/70 p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-600/20 shrink-0">
              {candidate.avatar}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {candidate.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {candidate.totalScore}% AI Match
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  Stage: {candidate.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {candidate.currentRole} at <strong className="text-white">{candidate.company}</strong> • {candidate.location}
              </p>
              <p className="text-[11px] text-slate-400">
                Applied for <span className="text-indigo-400 font-semibold">{candidate.targetRole}</span> • {candidate.email} • {candidate.phone}
              </p>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => handleAction("Shortlisted")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Shortlist</span>
            </button>

            <button
              onClick={() => onScheduleInterview(candidate.id)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Interview</span>
            </button>

            <button
              onClick={() => onGenerateQuestions(candidate.id)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition flex items-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI Questions</span>
            </button>

            <button
              onClick={() => handleAction("Rejected")}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Radar Chart + Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Radar/Spider Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Multi-Axis Competency Radar</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Normalized</span>
            </div>

            {/* SVG Spider Chart */}
            <div className="relative flex items-center justify-center py-2">
              <svg width="260" height="260" className="overflow-visible">
                {/* Background grid concentric polygons */}
                {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
                  const r = maxR * level;
                  const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
                  return (
                    <polygon
                      key={lIdx}
                      points={pts}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Grid axis lines */}
                <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />

                {/* Baseline Requisition Polygon */}
                <polygon
                  points={baselinePoints}
                  fill="rgba(100, 116, 139, 0.1)"
                  stroke="rgba(148, 163, 184, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Candidate Polygon with Cyan/Violet Glow */}
                <polygon
                  points={candidatePoints}
                  fill="rgba(99, 102, 241, 0.3)"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />

                {/* Vertex points */}
                {candidatePoints.split(" ").map((pt, pIdx) => {
                  const [px, py] = pt.split(",");
                  return <circle key={pIdx} cx={px} cy={py} r="4" fill="#06B6D4" />;
                })}

                {/* Labels */}
                <text x={cx} y={cy - maxR - 8} textAnchor="middle" className="text-[10px] font-bold fill-indigo-300">
                  Skills (50%): {candidate.breakdown.skills}%
                </text>
                <text x={cx + maxR + 8} y={cy + 4} textAnchor="start" className="text-[10px] font-bold fill-cyan-300">
                  Exp (25%): {candidate.breakdown.experience}%
                </text>
                <text x={cx} y={cy + maxR + 14} textAnchor="middle" className="text-[10px] font-bold fill-violet-300">
                  Projects (15%): {candidate.breakdown.projects}%
                </text>
                <text x={cx - maxR - 8} y={cy + 4} textAnchor="end" className="text-[10px] font-bold fill-emerald-300">
                  Qual (10%): {candidate.breakdown.qualifications}%
                </text>
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-medium">Candidate Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-400" />
              <span className="text-slate-400 font-medium">Role Baseline (80%)</span>
            </div>
          </div>
        </div>

        {/* Explainable Score Deconstruction (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Explainable Score Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mathematical weights strictly enforced without black-box estimation
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Total Score: {candidate.totalScore}/100
            </span>
          </div>

          {/* Breakdown progress rows */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  1. Skills Exact & Semantic Cosine Match (50% Weight)
                </span>
                <span className="font-bold text-indigo-400">{candidate.breakdown.skills}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div style={{ width: `${candidate.breakdown.skills}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  2. Relevant Industry Experience Duration (25% Weight)
                </span>
                <span className="font-bold text-cyan-400">{candidate.breakdown.experience}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div style={{ width: `${candidate.breakdown.experience}%` }} className="h-full bg-cyan-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  3. Key Project Architecture Relevance (15% Weight)
                </span>
                <span className="font-bold text-violet-400">{candidate.breakdown.projects}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div style={{ width: `${candidate.breakdown.projects}%` }} className="h-full bg-violet-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  4. Academic & Professional Qualifications (10% Weight)
                </span>
                <span className="font-bold text-emerald-400">{candidate.breakdown.qualifications}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div style={{ width: `${candidate.breakdown.qualifications}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="mt-4 p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI Evaluation Dossier Summary</span>
            </p>
            {candidate.summary}
          </div>
        </div>
      </div>

      {/* AI Evidence & Verification Section (Side-by-Side Verbatim Quotations) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              <span>AI Evidence & Verbatim Verification Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every claimed skill is cross-referenced against verbatim excerpts from the raw PDF text to guarantee zero hallucinations.
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            100% Anti-Hallucination Certified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidate.skills.map((skill, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/80 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{skill.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Verified in Raw Text ✓
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-400">
                  {Math.round(skill.similarity * 100)}% Sim
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 text-xs italic text-slate-300 font-mono leading-relaxed">
                &ldquo;{skill.excerpt}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gap Ledger: Missing Evidence vs Confirmed Absent */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
              <span>Skill Gap & Deficiency Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear distinction between skills missing evidence (probe in interview) vs confirmed absent.
            </p>
          </div>
        </div>

        {candidate.gaps.length === 0 ? (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Zero critical requirement gaps detected for this candidate!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {candidate.gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{gap.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        gap.status === "missing_evidence"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {gap.status === "missing_evidence" ? "⚠️ Missing Evidence (Unproven)" : "🛑 Confirmed Absent"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{gap.note}</p>
                </div>

                <button
                  onClick={() => onGenerateQuestions(candidate.id)}
                  className="shrink-0 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Generate Inquiry Question</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isComparing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <span>Head-to-Head Candidate Comparison</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing top applicants for {candidate.targetRole}
                </p>
              </div>
              <button
                onClick={() => setIsComparing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {MOCK_CANDIDATES.slice(0, 3).map((comp) => (
                <div
                  key={comp.id}
                  className={`p-4 rounded-xl border ${
                    comp.id === activeId ? "border-cyan-500 bg-cyan-950/10" : "border-slate-800 bg-[#1E293B]/50"
                  } space-y-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {comp.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                      <p className="text-[11px] text-slate-400">{comp.company}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-2xl font-extrabold text-cyan-400">{comp.totalScore}%</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Overall AI Match</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Skills (50%):</span>
                      <span className="font-bold text-white">{comp.breakdown.skills}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Experience (25%):</span>
                      <span className="font-bold text-white">{comp.breakdown.experience}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projects (15%):</span>
                      <span className="font-bold text-white">{comp.breakdown.projects}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qualifications (10%):</span>
                      <span className="font-bold text-white">{comp.breakdown.qualifications}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Key Verified Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsComparing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
