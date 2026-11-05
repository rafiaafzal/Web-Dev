import { Navbar } from "@/components/Navbar";

// TEMP-STUB: When Dev A delivers lib/auth.ts, uncomment:
// import { requireRole } from "@/lib/auth";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TEMP-STUB: Once Dev A delivers lib/auth.ts, protect layout:
  // await requireRole("recruiter");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-950">
      <Navbar user={{ name: "Alex Morgan", email: "alex.morgan@talentai.io", role: "recruiter" }} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
