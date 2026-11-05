import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  FileCheck2,
  CalendarCheck2,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getCurrentUser();
  const user = profile
    ? {
        name: profile.full_name || "User",
        email: profile.email || "",
        role: profile.role,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-950 font-sans">
      <Navbar user={user} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-slate-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-slate-50 to-indigo-50/20 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Next-Generation Talent Intelligence & Matching</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl dark:text-white max-w-4xl mx-auto leading-[1.12]">
              Hiring decisions backed by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700">
                explainable AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Eliminate black-box screening. Post roles, parse PDF resumes with verified evidence,
              rank applicants with transparent scoring breakdowns, and conduct confident interviews.
            </p>

            {/* Call to Actions */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/signup?role=recruiter"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-12 px-8 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                )}
              >
                <span>I&apos;m hiring</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/signup?role=candidate"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto h-12 px-8 text-base font-semibold border-slate-300 bg-white hover:bg-slate-50 text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                )}
              >
                <span>I&apos;m looking for a job</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero Hallucination Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>pgvector Cosine Semantic Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Auditable Recruitment Pipeline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Core Architecture
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                A complete, end-to-end recruitment intelligence system
              </p>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
                Engineered for speed, transparency, and human oversight. AI assists and explains, recruiters decide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  1. Evidence-Based Resumes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every extracted skill, experience, and project is cross-referenced against the raw PDF text. Unverified claims never receive scoring weight.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  2. Transparent Scoring Breakdown
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Candidate scores are decomposed mathematically: Skills (50%), Experience (25%), Project Relevance (15%), and Qualifications (10%).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  3. Structured Interviewing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate tailored role and project questions with concrete answer guides, record feedback, and advance through pipeline stages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
          TalentAI — Recruitment & Talent Intelligence Platform. Designed with HCI principles & explainable AI.
        </div>
      </footer>
    </div>
  );
}
