'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  HelpCircle,
  UserCheck,
  UserX,
  FileText,
  Sliders,
  Maximize2,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  ArrowRight,
  Filter,
} from 'lucide-react';

export type CandidateItem = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  stage: 'submitted' | 'parsed' | 'review' | 'shortlisted' | 'interview';
  totalScore: number;
  breakdown: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
  };
  matchedSkills: { skill: string; similarity: number; excerpt: string }[];
  gaps: { skill: string; status: 'missing_evidence' | 'confirmed_absent'; note: string }[];
  unsupportedClaims: string[];
  summary: string;
  experienceYears: number;
  education: string;
};

const DEFAULT_CANDIDATES: CandidateItem[] = [
  {
    id: 'cand-1',
    name: 'Alex Morgan',
    role: 'Senior Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stage: 'shortlisted',
    totalScore: 94,
    breakdown: {
      skills: 96,
      experience: 100,
      projects: 90,
      qualifications: 88,
    },
    matchedSkills: [
      { skill: 'Python', similarity: 1.0, excerpt: 'Architected and maintained high-throughput REST APIs using Python and Django REST Framework' },
      { skill: 'Django', similarity: 1.0, excerpt: 'Designed asynchronous order processing backend using Python, Django, and Celery' },
      { skill: 'PostgreSQL', similarity: 0.95, excerpt: 'Designed relational database schemas in PostgreSQL, implemented complex query optimizations' },
      { skill: 'Docker', similarity: 0.92, excerpt: 'Containerized microservices using Docker and Docker Compose to standardize staging environments' },
    ],
    gaps: [
      { skill: 'Kubernetes in Production', status: 'missing_evidence', note: 'Used in staging, no direct cluster scaling metrics found' },
    ],
    unsupportedClaims: [],
    summary: 'Exceptionally strong candidate with direct, verified experience matching all 4 primary backend requirements. Verified query optimization and Docker containerization.',
    experienceYears: 4,
    education: 'B.S. Computer Science, UC Boulder (2020)',
  },
  {
    id: 'cand-2',
    name: 'Jordan Lee',
    role: 'Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stage: 'review',
    totalScore: 78,
    breakdown: {
      skills: 75,
      experience: 80,
      projects: 85,
      qualifications: 75,
    },
    matchedSkills: [
      { skill: 'Python', similarity: 1.0, excerpt: 'Developed microservices in Python using FastAPI' },
      { skill: 'PostgreSQL', similarity: 0.88, excerpt: 'Managed queries on PostgreSQL database' },
      { skill: 'Docker', similarity: 0.82, excerpt: 'Created local containerized workflows using Docker' },
    ],
    gaps: [
      { skill: 'Django', status: 'missing_evidence', note: 'Primary experience in FastAPI/Flask; no Django evidence in resume' },
    ],
    unsupportedClaims: ['Claimed 5 years PostgreSQL, text indicates 2.5 years concurrent.'],
    summary: 'Solid backend foundations in Python and containers. Has strong API design skills but lacks production Django framework tenure.',
    experienceYears: 3,
    education: 'B.S. Software Engineering, UT Austin (2021)',
  },
  {
    id: 'cand-3',
    name: 'Taylor Kim',
    role: 'Junior Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stage: 'parsed',
    totalScore: 61,
    breakdown: {
      skills: 60,
      experience: 50,
      projects: 70,
      qualifications: 70,
    },
    matchedSkills: [
      { skill: 'Python', similarity: 0.85, excerpt: 'Scripted data scraping tools using Python' },
      { skill: 'PostgreSQL', similarity: 0.70, excerpt: 'Connected Node.js frontend to Postgres database' },
    ],
    gaps: [
      { skill: 'Django', status: 'confirmed_absent', note: 'Explicitly indicated: "Focused on Express.js; no Django experience"' },
      { skill: 'Docker', status: 'missing_evidence', note: 'No containerization tools listed in work history' },
    ],
    unsupportedClaims: ['Docker microservices claim not found in resume raw text.'],
    summary: 'Junior candidate with fullstack orientation. Missing core containerization and Django production experience.',
    experienceYears: 1.5,
    education: 'B.A. Information Systems (2023)',
  },
];

export function RecruiterCommandCenter() {
  const [candidates, setCandidates] = useState<CandidateItem[]>(DEFAULT_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(DEFAULT_CANDIDATES[0].id);
  const [activeStage, setActiveStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  const filteredCandidates = candidates.filter((c) => {
    const matchesStage = activeStage === 'all' || c.stage === activeStage;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.matchedSkills.some((s) => s.skill.toLowerCase().includes(q));
    return matchesStage && matchesQuery;
  });

  function handleStageChange(candId: string, newStage: CandidateItem['stage']) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: newStage } : c))
    );
    setActionNotice(`Candidate "${selectedCandidate.name}" moved to ${newStage.toUpperCase()}`);
    setTimeout(() => setActionNotice(null), 3000);
  }

  // Radar chart SVG points calculation
  const breakdown = selectedCandidate.breakdown;
  const radarCenter = 100;
  const radarRadius = 75;
  // 4 axes: Top (Skills), Right (Experience), Bottom (Projects), Left (Qualifications)
  const skillsPoint = `${radarCenter},${radarCenter - (radarRadius * (breakdown.skills / 100))}`;
  const expPoint = `${radarCenter + (radarRadius * (breakdown.experience / 100))},${radarCenter}`;
  const projPoint = `${radarCenter},${radarCenter + (radarRadius * (breakdown.projects / 100))}`;
  const qualPoint = `${radarCenter - (radarRadius * (breakdown.qualifications / 100))},${radarCenter}`;
  const candidatePolygon = `${skillsPoint} ${expPoint} ${projPoint} ${qualPoint}`;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500 selection:text-white rounded-2xl border border-indigo-950/60 shadow-2xl">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-[#1E1B4B] border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-xl shadow-lg shadow-cyan-500/10 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Top Search & Command Bar */}
      <header className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                AI Talent Intelligence Command Center
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                Enterprise HR v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-factor vector matching, verbatim hallucination checks & transparent explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E293B]/80 hover:bg-[#1E293B] border border-indigo-800/40 text-slate-200 hover:text-white transition flex items-center gap-2 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Candidate Comparison</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Human in the Loop</span>
            </div>
          </div>
        </div>

        {/* Natural Language AI Talent Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Natural Language Search: e.g. 'Find Python developers with 3+ years experience and REST API knowledge'..."
            className="w-full pl-11 pr-44 py-3 bg-[#1E1B4B]/40 hover:bg-[#1E1B4B]/60 focus:bg-[#1E1B4B]/80 border border-indigo-900/60 focus:border-cyan-500 rounded-xl text-xs text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner backdrop-blur-md"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <Cpu className="w-3 h-3 text-cyan-400" />
              AI Semantic Match
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Pipeline Kanban & Match Ranks (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stage Filter Tabs */}
          <div className="bg-[#1E1B4B]/30 p-1.5 rounded-xl border border-indigo-950 flex items-center gap-1 overflow-x-auto text-[11px] font-semibold text-slate-400">
            {['all', 'submitted', 'parsed', 'review', 'shortlisted', 'interview'].map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-3 py-1.5 rounded-lg capitalize transition whitespace-nowrap ${
                  activeStage === stage
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:text-slate-200 hover:bg-indigo-950/50'
                }`}
              >
                {stage === 'all' ? 'All Stages' : stage}
              </button>
            ))}
          </div>

          {/* Candidate Cards List */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredCandidates.map((cand) => {
              const isSelected = cand.id === selectedCandidateId;
              const isHigh = cand.totalScore >= 85;
              const isMed = cand.totalScore >= 70 && cand.totalScore < 85;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden backdrop-blur-md ${
                    isSelected
                      ? 'bg-[#1E1B4B]/70 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                      : 'bg-[#1E293B]/40 hover:bg-[#1E1B4B]/40 border-indigo-950 hover:border-indigo-800/60'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500" />
                  )}

                  <div className="flex items-center justify-between gap-3">
                    {/* Candidate Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-indigo-700/60"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
                            {cand.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            {cand.stage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{cand.role}</p>
                      </div>
                    </div>

                    {/* Circular Radial Percentage Meter */}
                    <div className="relative flex items-center justify-center">
                      <svg className="w-13 h-13 -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          stroke="#1E293B"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          stroke={isHigh ? '#10B981' : isMed ? '#06B6D4' : '#F59E0B'}
                          strokeWidth="3.5"
                          strokeDasharray={119.38}
                          strokeDashoffset={119.38 - (119.38 * cand.totalScore) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span
                          className={`text-xs font-black ${
                            isHigh
                              ? 'text-emerald-400 drop-shadow-[0_0_6px_#10B981]'
                              : isMed
                              ? 'text-cyan-400 drop-shadow-[0_0_6px_#06B6D4]'
                              : 'text-amber-400'
                          }`}
                        >
                          {cand.totalScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factor Score Tags */}
                  <div className="mt-3.5 pt-3 border-t border-indigo-950/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      Skills: <strong className="text-slate-200">{cand.breakdown.skills}%</strong>
                    </span>
                    <span className="bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      Exp: <strong className="text-slate-200">{cand.breakdown.experience}%</strong>
                    </span>
                    <span className="bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      Projects: <strong className="text-slate-200">{cand.breakdown.projects}%</strong>
                    </span>
                    <span className="bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      Quals: <strong className="text-slate-200">{cand.breakdown.qualifications}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Explainable AI Candidate Intelligence View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Candidate Profile Header & Quick Actions */}
          <div className="bg-[#1E1B4B]/30 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-white">
                      {selectedCandidate.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      {selectedCandidate.totalScore}% AI Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCandidate.role} • {selectedCandidate.experienceYears} Years Verified Experience
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedCandidate.education}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleStageChange(selectedCandidate.id, 'shortlisted')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Shortlist</span>
                </button>
                <button
                  onClick={() => handleStageChange(selectedCandidate.id, 'interview')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Interview</span>
                </button>
                <button
                  onClick={() => handleStageChange(selectedCandidate.id, 'review')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            {/* AI Summary Quote */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#0F172A]/80 border border-indigo-950 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">AI Assessment Summary: </strong>
                {selectedCandidate.summary}
              </div>
            </div>
          </div>

          {/* Interactive Radar/Spider Chart & 4-Factor Breakdown */}
          <div className="bg-[#1E1B4B]/30 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Multi-Factor Benchmark Radar (Candidate vs Job Requirements)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Scoring Weight Calibrated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radar Chart SVG */}
              <div className="flex justify-center items-center py-2">
                <svg className="w-56 h-56" viewBox="0 0 200 200">
                  {/* Grid Web Rings */}
                  <circle cx="100" cy="100" r="75" fill="none" stroke="#312E81" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#312E81" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="100" cy="100" r="25" fill="none" stroke="#312E81" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Axes */}
                  <line x1="100" y1="25" x2="100" y2="175" stroke="#312E81" strokeWidth="1" />
                  <line x1="25" y1="100" x2="175" y2="100" stroke="#312E81" strokeWidth="1" />

                  {/* Job Target Benchmark (Neutral Diamond Outline) */}
                  <polygon
                    points="100,25 175,100 100,175 25,100"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />

                  {/* Candidate Polygon */}
                  <polygon
                    points={candidatePolygon}
                    fill="rgba(6, 182, 212, 0.25)"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-500"
                  />

                  {/* Labels on Axes */}
                  <text x="100" y="16" textAnchor="middle" fill="#A5B4FC" fontSize="9" fontWeight="bold">
                    Skills (50%)
                  </text>
                  <text x="180" y="103" textAnchor="start" fill="#A5B4FC" fontSize="9" fontWeight="bold">
                    Exp (25%)
                  </text>
                  <text x="100" y="192" textAnchor="middle" fill="#A5B4FC" fontSize="9" fontWeight="bold">
                    Projects (15%)
                  </text>
                  <text x="20" y="103" textAnchor="end" fill="#A5B4FC" fontSize="9" fontWeight="bold">
                    Quals (10%)
                  </text>
                </svg>
              </div>

              {/* Factor Breakdown Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Skills Matching (50% weight)</span>
                    <span className="text-cyan-400 font-bold">{breakdown.skills}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-950">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${breakdown.skills}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Experience Alignment (25% weight)</span>
                    <span className="text-cyan-400 font-bold">{breakdown.experience}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-950">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${breakdown.experience}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Project Relevance (15% weight)</span>
                    <span className="text-cyan-400 font-bold">{breakdown.projects}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-950">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${breakdown.projects}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Qualifications & Education (10% weight)</span>
                    <span className="text-cyan-400 font-bold">{breakdown.qualifications}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-950">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${breakdown.qualifications}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Evidence & Verification Section */}
          <div className="bg-[#1E1B4B]/30 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Evidence & Zero-Hallucination Verification</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Verbatim Quotes Linked
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {selectedCandidate.matchedSkills.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0F19]/90 p-3.5 rounded-xl border border-cyan-500/20 text-xs shadow-[0_0_12px_rgba(6,182,212,0.06)]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {match.skill}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      Match: {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic font-mono bg-slate-950/50 p-2 rounded border border-indigo-950">
                    &quot;{match.excerpt}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap & Missing Evidence Warning Box */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Skill Gaps & Missing Evidence Warning Box</span>
              </h3>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold tracking-wide">
                Evidence Distinction
              </span>
            </div>

            {selectedCandidate.gaps.length === 0 ? (
              <p className="text-xs text-slate-400">No primary skill gaps detected for this candidate.</p>
            ) : (
              <div className="space-y-2.5">
                {selectedCandidate.gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{gap.skill}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            gap.status === 'confirmed_absent'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {gap.status === 'confirmed_absent' ? 'Confirmed Absent' : 'Missing Evidence'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{gap.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unsupported Claims Alert if any */}
            {selectedCandidate.unsupportedClaims.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                <strong className="font-bold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Hallucination Detection Flag:
                </strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-200/90">
                  {selectedCandidate.unsupportedClaims.map((claim, idx) => (
                    <li key={idx}>{claim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Side-by-Side Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-indigo-900 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCompareModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>Candidate Side-by-Side Comparison</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparative analysis of top applicants against the Backend Engineer role.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {candidates.slice(0, 2).map((cand) => (
                <div
                  key={cand.id}
                  className="bg-[#1E1B4B]/40 border border-indigo-900/60 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.avatar}
                      alt={cand.name}
                      className="w-12 h-12 rounded-full object-cover border border-cyan-400"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{cand.name}</h3>
                      <p className="text-xs text-cyan-400 font-bold">{cand.totalScore}% Overall Fit</p>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Skills (50%):</span>
                      <strong className="text-cyan-300">{cand.breakdown.skills}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Experience (25%):</span>
                      <strong className="text-cyan-300">{cand.breakdown.experience}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Projects (15%):</span>
                      <strong className="text-cyan-300">{cand.breakdown.projects}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Qualifications (10%):</span>
                      <strong className="text-cyan-300">{cand.breakdown.qualifications}%</strong>
                    </div>
                  </div>

                  {/* Top Verified Skills */}
                  <div className="pt-2 border-t border-indigo-950">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Verified Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        >
                          {s.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
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
