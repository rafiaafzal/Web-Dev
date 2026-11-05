import { requireRole } from '@/lib/auth';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';

export const metadata = {
  title: 'Candidate Portal | Talent Intelligence Platform',
};

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole('candidate');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b bg-white border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/candidate"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              TalentAI Candidate
            </Link>
            <nav className="hidden md:flex space-x-1">
              <Link
                href="/candidate"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/candidate/jobs"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              >
                Browse Jobs
              </Link>
              <Link
                href="/candidate/resume"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              >
                My Resume
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">
                {profile.full_name || 'Candidate'}
              </div>
              <div className="text-xs text-slate-500">{profile.email}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              Candidate
            </span>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md border border-red-200 transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
