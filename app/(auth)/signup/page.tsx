import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, AlertCircle, Building2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const defaultRole = params?.role === "recruiter" ? "recruiter" : "candidate";

  return (
    <Card className="border-slate-200/80 shadow-sm bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Join the AI-powered recruitment platform
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
          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-zinc-300">I am joining as</Label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50 has-[:checked]:text-indigo-900 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800 dark:has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-950/30 dark:has-[:checked]:text-indigo-200"
              >
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  defaultChecked={defaultRole === "candidate"}
                  className="sr-only"
                />
                <UserCircle className="h-5 w-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Candidate</p>
                  <p className="text-[11px] text-slate-500">Apply & track</p>
                </div>
              </label>

              <label
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50 has-[:checked]:text-indigo-900 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800 dark:has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-950/30 dark:has-[:checked]:text-indigo-200"
              >
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  defaultChecked={defaultRole === "recruiter"}
                  className="sr-only"
                />
                <Building2 className="h-5 w-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Recruiter</p>
                  <p className="text-[11px] text-slate-500">Hire talent</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-zinc-300">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              className="bg-white border-slate-200 text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-zinc-300">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              className="bg-white border-slate-200 text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-zinc-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
              minLength={6}
              className="bg-white border-slate-200 text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 shadow-sm transition-all dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Create Account
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50/60 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Get started with TalentAI
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Intelligent recruitment with explainable matching
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-64 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-900" />
          }
        >
          <SignupForm searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
