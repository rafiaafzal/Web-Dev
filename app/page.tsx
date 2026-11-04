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

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950">
      <Navbar
        user={
          user
            ? {
                name: user.full_name || "User",
                email: user.email || "",
                role: user.role,
              }
            : null
        }
      />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-slate-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-slate-50 to-indigo-50/20 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
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

            {/* Call to Actions (The two required buttons) */}
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

            {/* Trust badge */}
            <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Humans make all final decisions
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Evidence-checked claims
              </span>
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="h-4 w-4 text-indigo-600" /> Zero hallucination policy
              </span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-white dark:bg-zinc-900 border-b border-slate-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Built For Seamless Workflows
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                From job posting to final hire in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-7 hover:border-indigo-200 transition-all dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-5">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Evidence-Based Matching
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every score maps directly to verified excerpts in resumes. Clearly separates confirmed gaps from mere missing evidence.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-7 hover:border-indigo-200 transition-all dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-5">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Smart Interview Suite
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate tailored interview questions across three difficulty tiers plus project deep-dives with sample answer guides.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-7 hover:border-indigo-200 transition-all dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-5">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Pipeline Intelligence
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track hiring velocity, common skill gaps across applicant pools, shortlist ratios, and real-time candidate progression.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TalentAI Platform. Recruitment & Talent Intelligence.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">
              Recruiter Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
