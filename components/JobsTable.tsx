"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Users,
  Edit,
  PowerOff,
  CheckCircle,
  Plus,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import type { Job } from "@/types/recruiter";
import { setJobStatus } from "@/app/actions/jobs";
import { cn } from "@/lib/utils";

interface JobsTableProps {
  initialJobs: Job[];
}

export function JobsTable({ initialJobs }: JobsTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleStatus = async (job: Job) => {
    const nextStatus = job.status === "open" ? "closed" : "open";
    setUpdatingId(job.id);
    const toastId = toast.loading(
      nextStatus === "closed" ? "Closing job posting..." : "Reopening job posting..."
    );

    try {
      const result = await setJobStatus(job.id, nextStatus);
      if (result.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
        );
        toast.success(
          nextStatus === "closed" ? "Job closed successfully" : "Job reopened successfully",
          { id: toastId }
        );
        router.refresh();
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch {
      toast.error("Failed to update status", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
          <Briefcase className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No job postings yet
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
          Create your first role to start receiving applicants and generating explainable candidate assessments.
        </p>
        <div className="mt-6">
          <Link
            href="/recruiter/jobs/new"
            className={cn(
              buttonVariants(),
              "bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Create First Job</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {jobs.map((job) => {
          const isUpdating = updatingId === job.id;
          return (
            <div
              key={job.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    {job.department && <span>{job.department}</span>}
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={job.status === "open" ? "default" : "secondary"}
                  className={
                    job.status === "open"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 font-semibold text-[11px]"
                      : "bg-slate-100 text-slate-600 font-semibold text-[11px]"
                  }
                >
                  {job.status === "open" ? "Active" : "Closed"}
                </Badge>
              </div>

              {/* Stats snippet */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-1 border-y border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{job.applicant_count || 0} applicants</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Link
                  href={`/recruiter/jobs/${job.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs inline-flex items-center")}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleToggleStatus(job)}
                  className={`h-8 text-xs ${
                    job.status === "open"
                      ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : job.status === "open" ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5 mr-1" /> Close
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Reopen
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-zinc-950/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Job Title</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Department & Location</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Applicants</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date Posted</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const isUpdating = updatingId === job.id;
              return (
                <TableRow key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium">
                    <div>
                      <span className="text-slate-900 dark:text-white font-semibold block">
                        {job.title}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {job.type} {job.salary && `• ${job.salary}`}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <span>{job.department || "General"}</span>
                      {job.location && (
                        <span className="block text-xs text-slate-400">
                          {job.location}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={job.status === "open" ? "default" : "secondary"}
                      className={
                        job.status === "open"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 font-semibold"
                          : "bg-slate-100 text-slate-600 font-semibold"
                      }
                    >
                      {job.status === "open" ? "Active" : "Closed"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                      <Users className="h-3 w-3" />
                      {job.applicant_count || 0}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {new Date(job.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white inline-flex items-center"
                        )}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(job)}
                        className={`h-8 px-2.5 text-xs font-medium ${
                          job.status === "open"
                            ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : job.status === "open" ? (
                          <>
                            <PowerOff className="h-3.5 w-3.5 mr-1" />
                            Close
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Reopen
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
