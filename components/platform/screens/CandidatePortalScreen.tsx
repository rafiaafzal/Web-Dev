"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
  Edit2,
  Save,
  Check,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { MOCK_CANDIDATES, MOCK_JOBS } from "../mockData";

export function CandidatePortalScreen() {
  const candidate = MOCK_CANDIDATES[0]; // Elena Rostova
  const [activeTab, setActiveTab] = useState<"dashboard" | "resume">("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState(candidate.skills);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [simulatedScannedError, setSimulatedScannedError] = useState(false);

  const handleSimulateUpload = () => {
    setUploadSuccess(true);
    setSimulatedScannedError(false);
    setTimeout(() => setUploadSuccess(false), 3500);
  };

  const handleSimulateScannedPdf = () => {
    setSimulatedScannedError(true);
    setUploadSuccess(false);
  };

  const stages = [
    { key: "submitted", label: "1. Submitted", date: "Nov 3, 2026", done: true },
    { key: "parsed", label: "2. AI Parsed", date: "Nov 3, 2026", done: true },
    { key: "assessed", label: "3. Assessed (94%)", date: "Nov 3, 2026", done: true },
    { key: "review", label: "4. Under Review", date: "Nov 4, 2026", done: true },
    { key: "shortlisted", label: "5. Shortlisted", date: "Nov 5, 2026", done: true },
    { key: "interview", label: "6. Technical Interview", date: "Nov 6, 2026", done: false, active: true },
  ];

  return (
    <div className="space-y-6">
      {/* Candidate Profile Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#1E1B4B]/80 via-[#1E293B]/70 to-[#0F172A]/90 p-6 backdrop-blur-md shadow-lg shadow-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
              {candidate.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {candidate.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Verified Candidate Profile
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {candidate.currentRole} at {candidate.company} • {candidate.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "resume" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Resume & Verified Evidence
            </button>
          </div>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Active Application Tracker Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-400" />
                  <span>Active Application: Senior Backend Engineer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core Infrastructure Requisition • Apex Cloud Solutions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  94% Skill Fit Verified
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                {stages.map((st, idx) => (
                  <div key={st.key} className="flex flex-col items-center">
                    <div
                      className={`h-2 w-full rounded-full mb-2 ${
                        st.active ? "bg-purple-500 animate-pulse" : st.done ? "bg-emerald-400" : "bg-slate-800"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold truncate w-full ${
                        st.active ? "text-purple-300" : st.done ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{st.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Card Notification */}
            <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Technical Interview Scheduled</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Tomorrow, Nov 6 at 10:00 AM - 10:45 AM PST with Alex Morgan (Engineering Director).
                  </p>
                </div>
              </div>

              <button className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shrink-0">
                Join Virtual Room
              </button>
            </div>
          </div>

          {/* Job Recommendations: "Why You Match" */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>AI Recommended Positions ("Why You Match")</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Semantic alignment calculated against your verified resume chunks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_JOBS.slice(0, 2).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{job.title}</h4>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {job.id === "job-1" ? "94% Match" : "89% Match"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">{job.department} • {job.location}</p>

                    <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-1 mb-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Why You Match:
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        Your verified mastery in Python (0.98), PostgreSQL (0.97), and Docker (0.92) satisfies all mandatory requirements for this role.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-mono text-emerald-400">{job.salary}</span>
                    <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      <span>View Role Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "resume" && (
        <div className="space-y-6">
          {/* Resume Upload Drag & Drop Area */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="h-4 w-4 text-cyan-400" />
                  <span>Resume Ingestion & Real-Time Parser</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload PDF resumes up to 4MB. System extracts verified text and normalizes skills via Gemini.
                </p>
              </div>

              {/* Error demo toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateScannedPdf}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-amber-300 border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40"
                >
                  Demo Scanned PDF Fallback
                </button>
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Resume parsed successfully! 14 verified skills extracted and embedded with 768-dim vectors.</span>
              </div>
            )}

            {simulatedScannedError && (
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-xs text-amber-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Scanned PDF Detected (Low Extracted Characters &lt; 50)</span>
                  </div>
                  <button onClick={() => setSimulatedScannedError(false)} className="text-amber-400 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="leading-relaxed">
                  The uploaded file appears to be an image-only scanned document without selectable digital text. Please enter your skills and projects manually below or re-upload an export-as-PDF version.
                </p>
              </div>
            )}

            {/* Dropzone Box */}
            <div
              onClick={handleSimulateUpload}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-[#0F172A]/60 p-8 text-center transition-all duration-300 flex flex-col items-center justify-center space-y-3"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Click to upload or drag & drop candidate PDF
                </p>
                <p className="text-xs text-slate-400">
                  PDF format (max. 4MB) • Verbatim extraction & vector chunking
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-500 transition"
              >
                Select Resume PDF
              </button>
            </div>
          </div>

          {/* Candidate Self-Correction & Verification Panel */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Candidate Skills & Evidence Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm or correct extracted skills to ensure accurate job matching
                </p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>{isEditing ? "Done Editing" : "Edit Skills"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {candidateSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{skill.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Verified in Raw Text ✓
                    </span>
                  </div>

                  <div className="p-2 rounded border border-slate-800 bg-slate-900 text-xs italic text-slate-300 font-mono">
                    &ldquo;{skill.excerpt}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
