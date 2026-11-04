"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Calendar,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// TEMP-STUB: remove when Dev A delivers app/actions/auth.ts logout action
async function stubLogout() {
  if (typeof window !== "undefined") {
    window.location.href = "/login?message=Logged+out";
  }
}

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "recruiter" | "candidate" | string;
  } | null;
}

export function Navbar({ user = { name: "Alex Recruiter", email: "alex@company.com", role: "recruiter" } }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const recruiterNavItems = [
    { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
    { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Interviews", href: "/recruiter/interviews", icon: Calendar },
    { label: "Search", href: "/recruiter/search", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                Talent<span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {recruiterNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/recruiter"
                  ? pathname === "/recruiter"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: User Profile / Auth Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-2.5 rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "HR"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-none">
                    {user.name || "Recruiter"}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-none mt-1">
                    {user.role === "recruiter" ? "Recruiting Lead" : "Member"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 shadow-lg">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "Recruiter"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-0">
                  <Link href="/recruiter/jobs/new" className="flex w-full items-center px-2 py-1.5 text-sm">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Create Job Post</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-0">
                  <Link href="/recruiter" className="flex w-full items-center px-2 py-1.5 text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Recruiter Workspace</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-0">
                  {/* TEMP-STUB: replace stub action with real logout formAction when Dev A delivers app/actions/auth.ts */}
                  <form action={stubLogout} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center px-2 py-1.5 text-red-600 focus:text-red-600 cursor-pointer text-left text-sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }), "bg-indigo-600 hover:bg-indigo-700 text-white")}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {recruiterNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/recruiter"
                  ? pathname === "/recruiter"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-zinc-800">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                </div>
                {/* TEMP-STUB: logout */}
                <form action={stubLogout}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-center")}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "sm" }), "bg-indigo-600 hover:bg-indigo-700 text-white justify-center")}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
