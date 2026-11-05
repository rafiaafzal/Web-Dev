import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { JobForm } from "@/components/JobForm";
import { getJob } from "@/app/actions/jobs";
import { cn } from "@/lib/utils";

async function EditJobContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getJob(id);

  if (!result.ok || !result.data) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Not Found</h2>
        <p className="text-sm text-slate-500">
          {result.ok ? "The requested job could not be found." : result.error}
        </p>
        <div>
          <Link
            href="/recruiter/jobs"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Jobs List</span>
          </Link>
        </div>
      </div>
    );
  }

  return <JobForm initialData={result.data} isEditing={true} />;
}

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="py-2">
      <Suspense fallback={<div className="h-96 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-900" />}>
        <EditJobContent params={params} />
      </Suspense>
    </div>
  );
}
