"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Briefcase,
  AlertCircle,
  Building,
  MapPin,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import type { Job, JobInput, SkillRequirement } from "@/types/recruiter";
import { createJob, updateJob, extractRequirements } from "@/app/actions/jobs";

interface JobFormProps {
  initialData?: Job;
  isEditing?: boolean;
}

export function JobForm({ initialData, isEditing = false }: JobFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [type, setType] = useState<JobInput["type"]>(initialData?.type || "full-time");
  const [salary, setSalary] = useState(initialData?.salary || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [minExperienceYears, setMinExperienceYears] = useState<number>(
    initialData?.min_experience_years || 2
  );
  const [qualifications, setQualifications] = useState(
    initialData?.qualifications || ""
  );

  const [skills, setSkills] = useState<SkillRequirement[]>(
    initialData?.skills || [
      { name: "Python", importance: 5, required: true },
      { name: "PostgreSQL", importance: 4, required: true },
      { name: "Docker", importance: 3, required: false },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Skill editor helpers
  const handleAddSkill = () => {
    setSkills([...skills, { name: "", importance: 3, required: true }]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (
    index: number,
    field: keyof SkillRequirement,
    value: unknown
  ) => {
    const updated = [...skills];
    // @ts-expect-error dynamic key assignment
    updated[index][field] = value;
    setSkills(updated);
  };

  // AI Extraction
  const handleExtractWithAI = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please enter a longer description first to extract requirements.");
      return;
    }

    setIsExtracting(true);
    const toastId = toast.loading("Analyzing job description with AI...");

    try {
      const result = await extractRequirements(description);
      if (result.ok) {
        if (result.data.skills?.length > 0) {
          setSkills(result.data.skills);
        }
        if (result.data.min_experience_years !== undefined) {
          setMinExperienceYears(result.data.min_experience_years);
        }
        if (result.data.qualifications) {
          setQualifications(result.data.qualifications);
        }
        toast.success("Requirements & skills extracted successfully!", { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (err) {
      toast.error("An unexpected error occurred during extraction.", { id: toastId });
    } finally {
      setIsExtracting(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Job title is required.");
      return;
    }

    if (!description.trim()) {
      toast.error("Job description is required.");
      return;
    }

    const cleanedSkills = skills.filter((s) => s.name.trim().length > 0);
    if (cleanedSkills.length === 0) {
      toast.error("Please add at least one required skill.");
      return;
    }

    const payload: JobInput = {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      type,
      salary: salary.trim(),
      description: description.trim(),
      skills: cleanedSkills,
      min_experience_years: Number(minExperienceYears) || 0,
      qualifications: qualifications.trim(),
    };

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? "Updating job..." : "Publishing job...");

    try {
      const result = isEditing && initialData?.id
        ? await updateJob(initialData.id, payload)
        : await createJob(payload);

      if (result.ok) {
        toast.success(isEditing ? "Job updated successfully!" : "Job published successfully!", {
          id: toastId,
        });
        router.push("/recruiter/jobs");
        router.refresh();
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch {
      toast.error("Failed to save job posting.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Bar with Back and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-2 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to jobs</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define requirements, target skills with importance weights, and qualifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/recruiter/jobs")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Job"
            )}
          </Button>
        </div>
      </div>

      {/* Basic Role Information Card */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Basic Role Details
          </CardTitle>
          <CardDescription>
            Specify the title, employment type, department, and compensation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="bg-white dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering / Platform"
                  className="pl-9 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / New York, NY"
                  className="pl-9 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Employment Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as JobInput["type"])}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950 dark:border-zinc-800"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary / Compensation</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $140,000 - $170,000"
                  className="pl-9 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & AI Extraction Card */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Job Description</CardTitle>
            <CardDescription>
              Provide responsibilities, requirements, and day-to-day scope.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExtractWithAI}
            disabled={isExtracting || !description.trim()}
            className="border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 gap-1.5"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Extract requirements with AI</span>
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            required
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste or write the full job description here... (e.g. We are looking for a Backend Engineer with 3+ years experience in Python, Django, PostgreSQL, Docker, building distributed microservices and RESTful APIs...)"
            className="bg-white dark:bg-zinc-950 resize-y font-normal"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="min_experience_years">Minimum Experience (Years)</Label>
              <Input
                id="min_experience_years"
                type="number"
                min={0}
                max={30}
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(Number(e.target.value))}
                className="bg-white dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualifications">Qualifications / Education</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="qualifications"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. Bachelor's in CS or equivalent practical experience"
                  className="pl-9 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Importance Weights Card */}
      <Card className="border-slate-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>Required & Preferred Skills</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {skills.length} skills
              </Badge>
            </CardTitle>
            <CardDescription>
              Assign importance weights (1 = Nice-to-have, 5 = Critical) for the AI scoring engine.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSkill}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Skill
          </Button>
        </CardHeader>

        <CardContent>
          {skills.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-zinc-800">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">No skills added yet</p>
              <p className="mt-1 text-xs">Click &quot;Extract requirements with AI&quot; or &quot;Add Skill&quot; to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header labels */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">Skill Name</div>
                <div className="col-span-3 text-center">Importance (1-5)</div>
                <div className="col-span-3 text-center">Mandatory</div>
                <div className="col-span-1 text-right">Remove</div>
              </div>

              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  {/* Skill Name */}
                  <div className="sm:col-span-5">
                    <Input
                      required
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                      placeholder="e.g. Python, Docker, PostgreSQL"
                      className="bg-white dark:bg-zinc-900 h-9"
                    />
                  </div>

                  {/* Importance 1-5 */}
                  <div className="sm:col-span-3 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleSkillChange(index, "importance", lvl as SkillRequirement["importance"])}
                        className={`h-7 w-7 rounded text-xs font-semibold transition-all ${
                          skill.importance === lvl
                            ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-slate-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Required Checkbox */}
                  <div className="sm:col-span-3 flex items-center sm:justify-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-${index}`}
                      checked={skill.required}
                      onChange={(e) => handleSkillChange(index, "required", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <label
                      htmlFor={`req-${index}`}
                      className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      {skill.required ? "Required" : "Optional"}
                    </label>
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(index)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 flex justify-between p-4">
          <span>AI scoring algorithm weights skills at 50% of total candidate assessment.</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddSkill}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-0 h-auto font-medium"
          >
            + Add another skill
          </Button>
        </CardFooter>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/recruiter/jobs")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Publish Job"
          )}
        </Button>
      </div>
    </form>
  );
}
