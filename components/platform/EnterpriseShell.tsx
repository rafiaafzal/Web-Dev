"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Eye,
  Search,
  Calendar,
  BarChart3,
  UserCheck,
  User,
  Bell,
  Sparkles,
  Command,
  ChevronDown,
  Layers,
  ShieldCheck,
  Menu,
  X,
  Plus,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { RecruiterDashboardScreen } from "./screens/RecruiterDashboardScreen";
import { JobPostingScreen } from "./screens/JobPostingScreen";
import { PipelineKanbanScreen } from "./screens/PipelineKanbanScreen";
import { CandidateInspectorScreen } from "./screens/CandidateInspectorScreen";
import { TalentSearchScreen } from "./screens/TalentSearchScreen";
import { InterviewCommandScreen } from "./screens/InterviewCommandScreen";
import { CandidatePortalScreen } from "./screens/CandidatePortalScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";

export function EnterpriseShell() {
  const [role, setRole] = useState<"recruiter" | "candidate">("recruiter");
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [selectedCandidateId, setSelectedCandidateId] = useState("cand-1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveScreen("search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setActiveScreen("inspector");
  };

  const handleScheduleInterview = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveScreen("interviews");
  };

  const handleGenerateQuestions = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveScreen("interviews");
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const recruiterNav: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Job Requisitions", icon: Briefcase },
    { id: "pipeline", label: "Pipeline Kanban", icon: Users },
    { id: "inspector", label: "AI Candidate Inspector", icon: Eye },
    { id: "search", label: "Semantic Search", icon: Search, badge: "Cmd+K" },
    { id: "interviews", label: "Interview Command", icon: Calendar },
    { id: "analytics", label: "Analytics & Telemetry", icon: BarChart3 },
  ];

  const candidateNav: NavItem[] = [
    { id: "candidate-dash", label: "Candidate Dashboard", icon: UserCheck },
    { id: "candidate-resume", label: "Resume & Verified Skills", icon: ShieldCheck },
  ];

  const currentNav = role === "recruiter" ? recruiterNav : candidateNav;

  const notifications = [
    { id: 1, text: "Elena Rostova scored 94% on Senior Backend Engineer requisition", time: "10m ago", read: false },
    { id: 2, text: "Schedule conflict flagged for Dr. Sarah Lin on Nov 6, 2:00 PM", time: "35m ago", read: false },
    { id: 3, text: "Marcus Vance moved to 'Shortlisted' stage", time: "1h ago", read: true },
    { id: 4, text: "Gemini 2.5 Flash batch embedded 4 new candidate resumes", time: "2h ago", read: true },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  Talent<span className="text-cyan-400">AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ml-1">
                    Enterprise
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Autonomous Intelligence
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Switcher Toggle */}
          <div className="p-1.5 rounded-xl border border-slate-800 bg-[#141C2E] space-y-1">
            <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Operational Mode</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => {
                  setRole("recruiter");
                  setActiveScreen("dashboard");
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  role === "recruiter"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Recruiter</span>
              </button>

              <button
                onClick={() => {
                  setRole("candidate");
                  setActiveScreen("candidate-dash");
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  role === "candidate"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Candidate</span>
              </button>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {role === "recruiter" ? "Recruiter Console" : "Candidate Portal"}
            </p>
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveScreen(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: System Telemetry */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B0F19]/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Gemini 2.5 Flash</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">Online</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>pgvector Embeddings</span>
            </span>
            <span className="text-cyan-400 font-mono font-bold">768-dim</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              {role === "recruiter" ? "AM" : "ER"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {role === "recruiter" ? "Alex Morgan" : "Elena Rostova"}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {role === "recruiter" ? "Recruiting Lead" : "Candidate"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Cmd+K Search Trigger */}
            <button
              onClick={() => setActiveScreen("search")}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#1E293B]/70 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition shadow-inner w-56 sm:w-80"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span className="truncate">Search candidates, skills, or jobs...</span>
              <span className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">
                <Command className="h-3 w-3" />
                <span>K</span>
              </span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-slate-800 bg-[#1E293B]/70 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0B0F19] animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-[#0F172A] shadow-2xl p-3 space-y-2 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
                    <span>Audit & Telemetry Feed</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Live</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                        <p className="text-slate-200 font-medium leading-tight">{n.text}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role indicator pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-xs font-semibold text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="capitalize">{role} Mode</span>
            </div>
          </div>
        </header>

        {/* 3. Main Dynamic Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeScreen === "dashboard" && (
            <RecruiterDashboardScreen
              onSelectCandidate={handleSelectCandidate}
              onNavigate={(s) => setActiveScreen(s)}
            />
          )}

          {activeScreen === "jobs" && (
            <JobPostingScreen
              onJobCreated={(title) => {
                setActiveScreen("pipeline");
              }}
            />
          )}

          {activeScreen === "pipeline" && (
            <PipelineKanbanScreen
              onSelectCandidate={handleSelectCandidate}
              onScheduleInterview={handleScheduleInterview}
            />
          )}

          {activeScreen === "inspector" && (
            <CandidateInspectorScreen
              selectedCandidateId={selectedCandidateId}
              onScheduleInterview={handleScheduleInterview}
              onGenerateQuestions={handleGenerateQuestions}
            />
          )}

          {activeScreen === "search" && (
            <TalentSearchScreen onSelectCandidate={handleSelectCandidate} />
          )}

          {activeScreen === "interviews" && (
            <InterviewCommandScreen
              initialCandidateId={selectedCandidateId}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {(activeScreen === "candidate-dash" || activeScreen === "candidate-resume") && (
            <CandidatePortalScreen />
          )}

          {activeScreen === "analytics" && <AnalyticsScreen />}
        </main>
      </div>
    </div>
  );
}
