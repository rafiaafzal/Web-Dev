import { Suspense } from "react";
import Link from "next/link";
import { RecruiterCommandCenter } from "@/components/RecruiterCommandCenter";
import { Plus, Briefcase, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Bar Navigation Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B]/60 border border-indigo-950 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Active Requisition: Senior Backend Engineer</h2>
            <p className="text-xs text-slate-400">Python • Django • PostgreSQL • Docker (4 Active Candidates)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/jobs"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E1B4B] border border-indigo-900/60 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
            <span>All Jobs</span>
          </Link>
          <Link
            href="/recruiter/jobs/new"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post New Role</span>
          </Link>
        </div>
      </div>

      {/* Futuristic Command Center */}
      <Suspense fallback={<div className="h-[700px] rounded-2xl bg-slate-900/40 animate-pulse border border-indigo-950" />}>
        <RecruiterCommandCenter />
      </Suspense>
    </div>
  );
}
