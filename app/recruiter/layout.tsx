import { Navbar } from "@/components/Navbar";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      <Navbar user={{ name: "Alex Morgan", email: "alex.morgan@talentai.io", role: "recruiter" }} />
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
