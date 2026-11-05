"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  FileText,
  PlusCircle,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";

export interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "recruiter" | "candidate" | string;
  } | null;
}

function NavbarContent({ user = null }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      window.location.href = "/login?message=" + encodeURIComponent("Logged out successfully");
    } catch {
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  // Role-aware navigation links
  const isCandidate = user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter";

  const navItems = isCandidate
    ? [
        { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
        { label: "Browse Jobs", href: "/candidate/jobs", icon: Briefcase },
        { label: "My Resume", href: "/candidate/resume", icon: FileText },
      ]
    : isRecruiter
    ? [
        { label: "Overview", href: "/recruiter", icon: LayoutDashboard },
        { label: "Job Postings", href: "/recruiter/jobs", icon: Briefcase },
        { label: "Create Job", href: "/recruiter/jobs/new", icon: PlusCircle },
        { label: "Interviews", href: "/recruiter/interviews", icon: Calendar },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href={user ? (isCandidate ? "/candidate" : "/recruiter") : "/"} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-indigo-600 transition-transform group-hover:scale-105">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                Talent<span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-400">
                {isCandidate ? "Candidate Portal" : isRecruiter ? "Recruiter Suite" : "Talent Intelligence"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex md:items-center md:gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/recruiter" || item.href === "/candidate"
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side: User Profile / Auth Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "flex items-center gap-2.5 rounded-full py-1 px-2.5 hover:bg-slate-100 border border-slate-200/60 dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xs dark:bg-indigo-600">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
                    {user.name || "User"}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 shadow-md rounded-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-2.5 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-zinc-100">{user.name || "Account"}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || ""}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer p-0 rounded-lg">
                  <Link href={isCandidate ? "/candidate" : "/recruiter"} className="flex w-full items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                    <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    <span>Workspace Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isRecruiter && (
                  <>
                    <DropdownMenuItem className="cursor-pointer p-0 rounded-lg">
                      <Link href="/recruiter/jobs/new" className="flex w-full items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                        <Briefcase className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        <span>Create Job Post</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer p-0 rounded-lg">
                      <Link href="/recruiter/interviews" className="flex w-full items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                        <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        <span>Interviews</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                <DropdownMenuItem
                  className="cursor-pointer px-2.5 py-1.5 text-xs font-medium text-red-600 rounded-lg focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  disabled={loggingOut}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-700 dark:text-zinc-300")}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-medium")}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="h-9 w-9 p-0"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden animate-in slide-in-from-top-2">
          {navItems.length > 0 && (
            <div className="space-y-1 mb-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/recruiter" || item.href === "/candidate"
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 dark:border-zinc-800">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span> ({user.role})
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full justify-start text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 hover:bg-slate-800 text-white justify-center dark:bg-indigo-600")}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 bg-white/95" />
      }
    >
      <NavbarContent {...props} />
    </Suspense>
  );
}
