"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";

interface JobPostingScreenProps {
  onJobCreated?: (newJobTitle: string) => void;
}

export function JobPostingScreen({ onJobCreated }: JobPostingScreenProps) {
  const [title, setTitle] = useState("Staff Cloud Reliability & Distributed Systems Architect");
  const [department, setDepartment] = useState("Core Platform Infrastructure");
  const [location, setLocation] = useState("San Francisco, CA (Hybrid)");
  const [type, setType] = useState<"full-time" | "contract" | "part-time">("full-time");
  const [salary, setSalary] = useState("$180,000 - $220,000");
  const [minExperience, setMinExperience] = useState(5);
  const [description, setDescription] = useState(
    `We are seeking a Staff Cloud Reliability Architect to lead the high-availability foundation of our global SaaS mesh.
You will architect fault-tolerant distributed systems using Python and Go, manage large-scale PostgreSQL sharded clusters, and orchestrate containerized microservices across multi-region Kubernetes clusters.
Experience with Docker containerization, Redis caching layers, Prometheus telemetry, and zero-downtime database migrations is strictly essential.
Candidates must hold a Bachelor's degree in Computer Science or demonstrable equivalent industry experience.`
  );

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Parsed state
  const [parsedSkills, setParsedSkills] = useState([
    { name: "Python", importance: 5, required: true, normalized: "Python 3.12+" },
    { name: "Kubernetes", importance: 5, required: true, normalized: "Kubernetes (K8s)" },
    { name: "PostgreSQL", importance: 5, required: true, normalized: "PostgreSQL (RDBMS)" },
    { name: "Docker", importance: 4, required: true, normalized: "Docker OCI" },
    { name: "Redis", importance: 4, required: false, normalized: "Redis In-Memory" },
    { name: "Prometheus", importance: 3, required: false, normalized: "Prometheus Monitoring" },
  ]);

  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setParsedSkills([
        { name: "Python", importance: 5, required: true, normalized: "Python 3.12+" },
        { name: "Kubernetes", importance: 5, required: true, normalized: "Kubernetes (K8s)" },
        { name: "PostgreSQL", importance: 5, required: true, normalized: "PostgreSQL High-Availability" },
        { name: "Docker", importance: 4, required: true, normalized: "Docker Containerization" },
        { name: "Go / Golang", importance: 4, required: false, normalized: "Go Systems Programming" },
        { name: "Redis", importance: 4, required: false, normalized: "Redis Cache & Pub/Sub" },
        { name: "Prometheus", importance: 3, required: false, normalized: "Prometheus & Grafana" },
      ]);
    }, 900);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onJobCreated) onJobCreated(title);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span>AI Semantic Requisition Architect</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Job Posting & Requirement Parser
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author roles with live real-time requirement extraction, skill normalization, and 50/25/15/10 weighting calibration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateExtraction}
            disabled={isExtracting}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Extracting with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Re-parse with Gemini AI</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-violet-500 transition shadow-md shadow-indigo-600/30"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Requisition Published!</span>
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4" />
                <span>Publish Requisition</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split View: Left (Form) vs Right (Live AI Parser Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            <span>Requisition Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-300">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/70 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/70 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/70 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/70 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="full-time">Full-time Regular</option>
                <option value="contract">Contract (1099 / C2C)</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Salary Band</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/70 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Minimum Experience Threshold: <strong className="text-indigo-400">{minExperience} Years</strong>
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={minExperience}
                onChange={(e) => setMinExperience(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Free-text Job Description (AI Ingestion Stream)
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">Live Sync Active</span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-700 bg-[#0F172A]/80 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>
        </div>

        {/* Right Column: Live AI Parser Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Live AI Requirement Extraction</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically structured via Gemini schema & verified
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Normalized
            </span>
          </div>

          {/* Scoring Weighting Model Calibration */}
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-[#0F172A]/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Scoring Weight Distribution</span>
              <span className="text-[11px] text-indigo-400 font-mono">Sum: 100%</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold">
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                <div>Skills Match</div>
                <div className="text-sm font-bold text-white mt-0.5">50%</div>
              </div>
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                <div>Experience</div>
                <div className="text-sm font-bold text-white mt-0.5">25%</div>
              </div>
              <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-300">
                <div>Projects</div>
                <div className="text-sm font-bold text-white mt-0.5">15%</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                <div>Qualifications</div>
                <div className="text-sm font-bold text-white mt-0.5">10%</div>
              </div>
            </div>
          </div>

          {/* Extracted & Normalized Skills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Extracted Skill Criteria ({parsedSkills.length})</span>
              <span className="text-[11px] text-slate-400">Importance Scale (1-5)</span>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {parsedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-800 bg-[#0F172A]/70 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{skill.name}</span>
                      {skill.required ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          Preferred
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-cyan-400 font-mono">
                      Normalized: {skill.normalized}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${
                          star <= skill.importance ? "text-amber-400 font-bold" : "text-slate-700"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              Hallucination Guard: All candidate submissions will be cross-checked against verbatim PDF quotes before matching these criteria.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
