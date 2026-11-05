import { Navbar } from "@/components/Navbar";
import { requireRole } from "@/lib/auth";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("recruiter");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans">
      <Navbar
        user={{
          name: profile.full_name || "Recruiter",
          email: profile.email || "",
          role: profile.role,
        }}
      />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
