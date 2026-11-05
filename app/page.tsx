import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b bg-white border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TalentAI
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Recruitment & Talent Intelligence
            </span>
          </div>

          <nav className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-600 hidden sm:inline">
                  Signed in as <strong className="text-slate-900">{user.full_name || user.email}</strong> ({user.role})
                </span>
                <Link
                  href={user.role === 'recruiter' ? '/recruiter' : '/candidate'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                  Go to {user.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Dashboard →
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-6">
          <span>⚡ Real-Time Evidence Verification & Multi-Factor AI Scoring</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
          Intelligent Hiring with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Evidence-Based AI
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl">
          Upload PDF resumes, automatically extract verified skills, assess candidates with multi-factor scoring (Skills, Experience, Projects, Qualifications), and make confident hiring decisions.
        </p>

        {/* Action Portal Launch Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
          {/* Candidate Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                👨‍💻
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Candidate Portal
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Upload your PDF resume, view extracted skills with hallucination verification, browse open roles, and track your application status in real-time.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Link
                href="/candidate"
                className="flex-1 text-center py-2.5 px-4 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Open Candidate Portal →
              </Link>
              <Link
                href="/candidate/resume"
                className="py-2.5 px-3 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 text-center transition"
              >
                Upload Resume
              </Link>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
                💼
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Recruiter Portal
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Post jobs, extract requirements with AI, review ranked applicants with score breakdowns, generate tailored interview questions, and schedule interviews.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Link
                href="/recruiter"
                className="flex-1 text-center py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Open Recruiter Portal →
              </Link>
              <Link
                href="/login"
                className="py-2.5 px-3 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 text-center transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-900">
              📄 Verified Resume Extraction
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Extracts skills, experience, projects, and education with verbatim quote evidence checks.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-900">
              ⚖️ Objective 4-Factor Scoring
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Skills (50%), Experience (25%), Projects (15%), and Qualifications (10%) with zero demographic bias.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-900">
              🔍 Gap Analysis & Evidence
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Distinguishes between missing evidence and confirmed absent skills with personalized learning tips.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-900">
              🚀 End-to-End Pipeline
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Audit trail tracking from submission and assessment through shortlisting and interview scheduling.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
