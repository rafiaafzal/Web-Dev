import { requireRole } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Candidate Portal | TalentAI',
};

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole('candidate');

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans">
      <Navbar
        user={{
          name: profile.full_name || 'Candidate',
          email: profile.email || '',
          role: profile.role,
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
