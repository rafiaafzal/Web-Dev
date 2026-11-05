"use client";

import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Command,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Users,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { MOCK_CANDIDATES } from "../mockData";

interface TalentSearchScreenProps {
  onSelectCandidate: (id: string) => void;
}

export function TalentSearchScreen({ onSelectCandidate }: TalentSearchScreenProps) {
  const [query, setQuery] = useState("Python developers with PostgreSQL partitioning and Docker containerization");
  const [activePreset, setActivePreset] = useState<string | null>("backend");

  const presets = [
    { id: "backend", label: "Python & PostgreSQL Distributed Systems", q: "Python developers with PostgreSQL partitioning and Docker containerization" },
    { id: "ai", label: "PyTorch & pgvector RAG Specialists", q: "Machine learning engineers with PyTorch, pgvector embeddings and FastAPI" },
    { id: "fullstack", label: "Next.js App Router & TypeScript", q: "Fullstack Next.js React developers with TypeScript and Tailwind" },
    { id: "devops", label: "Kubernetes & Cloud Infrastructure", q: "Infrastructure engineers with Kubernetes, Docker, and Redis caching" },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setActivePreset(p.id);
    setQuery(p.q);
  };

  // Filter candidates based on matching terms in their skills or experience
  const searchResults = MOCK_CANDIDATES.map((cand) => {
    const qLower = query.toLowerCase();
    let matchScore = 65;

    if (qLower.includes("python") && cand.skills.some((s) => s.name.toLowerCase() === "python")) matchScore += 15;
    if (qLower.includes("postgres") && cand.skills.some((s) => s.name.toLowerCase() === "postgresql")) matchScore += 10;
    if (qLower.includes("docker") && cand.skills.some((s) => s.name.toLowerCase() === "docker")) matchScore += 8;
    if (qLower.includes("pytorch") && cand.skills.some((s) => s.name.toLowerCase() === "pytorch")) matchScore += 20;
    if (qLower.includes("next") && cand.skills.some((s) => s.name.toLowerCase().includes("next"))) matchScore += 20;

    return {
      ...cand,
      semanticRelevance: Math.min(98, matchScore),
    };
  }).sort((a, b) => b.semanticRelevance - a.semanticRelevance);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300 mb-2">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>pgvector 768-dim Semantic Search Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Natural Language Talent Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Query across verified candidate resume chunks using natural language semantics without keyword friction.
          </p>
        </div>
      </div>

      {/* Search Input Bar (Cmd+K) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/70 p-5 backdrop-blur-md shadow-lg shadow-indigo-950/20 space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Type a natural query e.g. 'Find Python engineers with 3+ years experience and Docker containerization'..."
            className="w-full h-13 pl-12 pr-28 rounded-xl border border-slate-700 bg-[#0F172A]/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-medium"
          />
          <div className="absolute right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>

        {/* Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3 text-indigo-400" />
            <span>Presets:</span>
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activePreset === preset.id
                  ? "bg-indigo-600 text-white shadow-sm border border-indigo-400/40"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found {searchResults.length} semantically relevant candidates for this query:</span>
          <span className="text-cyan-400 font-mono">Similarity Threshold &gt; 65%</span>
        </div>

        <div className="space-y-3.5">
          {searchResults.map((cand) => (
            <div
              key={cand.id}
              className="rounded-2xl border border-slate-800 bg-[#1E293B]/60 p-5 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {cand.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3
                        onClick={() => onSelectCandidate(cand.id)}
                        className="text-base font-bold text-white hover:text-cyan-300 cursor-pointer transition-colors"
                      >
                        {cand.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {cand.semanticRelevance}% Semantic Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {cand.currentRole} at <strong className="text-slate-300">{cand.company}</strong> • {cand.location}
                    </p>
                  </div>
                </div>

                {/* Matching Evidence Excerpt */}
                <div className="p-3 rounded-xl border border-slate-800 bg-[#0F172A]/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Best Matching Resume Chunk Evidence:</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">Verified in PDF</span>
                  </div>
                  <p className="text-xs italic text-slate-200 font-mono leading-relaxed">
                    &ldquo;{cand.skills[0]?.excerpt || cand.experience[0]?.excerpt}&rdquo;
                  </p>
                </div>

                {/* Verified Skill Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cand.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/20"
                    >
                      {s.name} ✓
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-end justify-between gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">{cand.totalScore}%</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase">Overall Fit</span>
                </div>

                <button
                  onClick={() => onSelectCandidate(cand.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Inspect Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
