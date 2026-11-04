import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, AlertCircle, Building2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/app/actions/auth";

async function signupAction(formData: FormData) {
  "use server";
  const role = (formData.get("role") as string) || "recruiter";
  const res = await signUp(formData);
  if (!res.ok) {
    redirect(`/signup?role=${encodeURIComponent(role)}&error=${encodeURIComponent(res.error)}`);
  }
  redirect(res.data.redirectUrl);
}

async function SignupForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const defaultRole = params?.role === "candidate" ? "candidate" : "recruiter";

  return (
    <Card className="border-slate-200 shadow-xl shadow-slate-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Get started</CardTitle>
        <CardDescription>
          Select your role and complete your profile
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error Banner */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Registration Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form action={signupAction} className="space-y-4">
          {/* Role Selection Radios */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Select your role
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex cursor-pointer flex-col rounded-xl border border-slate-200 p-3.5 hover:border-indigo-500 has-checked:border-indigo-600 has-checked:bg-indigo-50/50 has-checked:ring-2 has-checked:ring-indigo-600/20 dark:border-zinc-800 dark:has-checked:bg-indigo-950/30">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Recruiter
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    defaultChecked={defaultRole === "recruiter"}
                    className="h-4 w-4 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  Post jobs, review ranked candidates & manage interviews
                </span>
              </label>

              <label className="relative flex cursor-pointer flex-col rounded-xl border border-slate-200 p-3.5 hover:border-indigo-500 has-checked:border-indigo-600 has-checked:bg-indigo-50/50 has-checked:ring-2 has-checked:ring-indigo-600/20 dark:border-zinc-800 dark:has-checked:bg-indigo-950/30">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Candidate
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    defaultChecked={defaultRole === "candidate"}
                    className="h-4 w-4 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  Upload PDF resume, apply to roles & track application status
                </span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              className="bg-white dark:bg-zinc-950"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              className="bg-white dark:bg-zinc-950"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 shadow-sm transition-all"
            >
              Create account
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Join the recruitment intelligence platform
          </p>
        </div>

        <Suspense fallback={<div className="h-96 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-900" />}>
          <SignupForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
