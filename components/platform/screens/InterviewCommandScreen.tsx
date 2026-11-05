"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Plus,
  Send,
  Star,
  Check,
  ShieldAlert,
} from "lucide-react";
import { MOCK_INTERVIEWS, MOCK_QUESTIONS, MOCK_CANDIDATES } from "../mockData";

interface InterviewCommandScreenProps {
  initialCandidateId?: string;
  onSelectCandidate: (id: string) => void;
}

export function InterviewCommandScreen({
  initialCandidateId = "cand-1",
  onSelectCandidate,
}: InterviewCommandScreenProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidateId);
  const [activeTab, setActiveTab] = useState<"calendar" | "questions" | "feedback">("calendar");

  // Feedback Form State
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(5);
  const [problemRating, setProblemRating] = useState(4);
  const [recommendation, setRecommendation] = useState<"strong_hire" | "hire" | "hold" | "no_hire">("hire");
  const [notes, setNotes] = useState(
    "Demonstrated exceptional depth in PostgreSQL connection pool sizing and Redis distributed locking. Strong communication skills when articulating architectural trade-offs."
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Question difficulty filter
  const [diffFilter, setDiffFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const currentCandidate = MOCK_CANDIDATES.find((c) => c.id === selectedCandidateId) || MOCK_CANDIDATES[0];

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    return true;
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-2">
            <Calendar className="h-3 w-3 text-purple-400" />
            <span>Structured Interview Intelligence & Conflict Resolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Interview Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automate question generation by project context, manage interviewer schedules, and submit structured evaluations.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "calendar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Calendar & Conflicts
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "questions" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            AI Question Bank
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "feedback" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Evaluation Drawer
          </button>
        </div>
      </div>

      {/* View 1: Calendar & Conflict Flags */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>Upcoming Technical & Architecture Interviews</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Week of Nov 6 — Nov 10, 2026</span>
            </div>

            <div className="space-y-3.5">
              {MOCK_INTERVIEWS.map((interview) => (
                <div
                  key={interview.id}
                  className={`p-4 rounded-xl border transition-all ${
                    interview.hasConflict
                      ? "border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "border-slate-800 bg-[#0F172A]/70 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-bold text-white">{interview.candidateName}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                          {interview.type} Round ({interview.durationMin}m)
                        </span>
                        {interview.hasConflict && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Schedule Conflict Detected</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        Role: <strong className="text-cyan-300">{interview.jobTitle}</strong> • Assigned Lead: <span className="text-slate-200">{interview.interviewer}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">{interview.date}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{interview.time}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCandidateId(interview.candidateId);
                          setActiveTab("questions");
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1"
                      >
                        <span>Prep Questions</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Conflict Notice Box */}
                  {interview.hasConflict && (
                    <div className="mt-3 p-3 rounded-lg border border-amber-500/30 bg-amber-950/40 text-xs text-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{interview.conflictReason}</span>
                      </div>
                      <button className="text-[11px] font-bold text-cyan-300 underline hover:text-white shrink-0 ml-3">
                        Auto-resolve Time Slot
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: AI Question Bank */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-5 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Tailored Technical Questions for {currentCandidate.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated based on candidate's verified project experience and required role criteria
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Difficulty:</span>
                {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDiffFilter(diff)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                      diffFilter === diff
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/80 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            q.difficulty === "advanced"
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Category: {q.category === "project" ? "Project-Specific" : "Role Competency"}
                        </span>
                        {q.projectContext && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            Context: {q.projectContext}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white pt-1">{q.question}</h4>
                    </div>
                  </div>

                  {/* Expected Answer Guide */}
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Ideal Candidate Answer Guide:
                    </p>
                    <p className="leading-relaxed text-slate-300">{q.answerGuide}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Structured Evaluation Drawer */}
      {activeTab === "feedback" && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md max-w-3xl mx-auto space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Interviewer Feedback Submission: {currentCandidate.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Position: <strong className="text-slate-200">{currentCandidate.targetRole}</strong>
            </p>
          </div>

          {feedbackSubmitted && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Feedback successfully submitted! Candidate evaluation synced to audit ledger.</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            {/* 3 Numerical Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Technical Competence</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTechRating(star)}
                      className={`text-lg transition ${star <= techRating ? "text-amber-400" : "text-slate-700"}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-1">{techRating}/5</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Communication & Clarity</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommRating(star)}
                      className={`text-lg transition ${star <= commRating ? "text-amber-400" : "text-slate-700"}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-1">{commRating}/5</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Problem Solving & Architecture</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProblemRating(star)}
                      className={`text-lg transition ${star <= problemRating ? "text-amber-400" : "text-slate-700"}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-1">{problemRating}/5</span>
                </div>
              </div>
            </div>

            {/* Recommendation Choice */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Overall Hiring Recommendation</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "strong_hire", label: "Strong Hire", color: "border-emerald-500 bg-emerald-950/40 text-emerald-300" },
                  { id: "hire", label: "Hire", color: "border-indigo-500 bg-indigo-950/40 text-indigo-300" },
                  { id: "hold", label: "Hold / Neutral", color: "border-amber-500 bg-amber-950/40 text-amber-300" },
                  { id: "no_hire", label: "No Hire", color: "border-rose-500 bg-rose-950/40 text-rose-300" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRecommendation(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      recommendation === item.id ? item.color : "border-slate-800 bg-[#0F172A] text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Evaluation Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Interviewer Notes & Synthesis</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-700 bg-[#0F172A] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Final Decision</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
