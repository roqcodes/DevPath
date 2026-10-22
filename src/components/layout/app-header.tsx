"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Code2,
  Flame,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useApp } from "@/lib/context/app-context";
import { syllabusProgress } from "@/lib/data/dsa-syllabus";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn Curriculum", icon: BookOpen },
  { href: "/practice", label: "Problem Practice", icon: Code2 },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/profile", label: "Student Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppHeader() {
  const { state } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const overall = syllabusProgress(state.progress.completedLessons);

  const initials = (state.user.name || "Student")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div className="flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/70 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>{state.progress.streak}</span>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 z-30 border-b border-slate-200 bg-white p-4 shadow-xl lg:hidden animate-fade-in">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Syllabus: {overall}% complete</span>
            <span className="font-mono text-purple-700 font-semibold">{state.progress.rankingScore} pts</span>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <header className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 backdrop-blur-md">
        {/* Quick search affordance */}
        <Link
          href="/practice"
          className="flex w-72 items-center justify-between rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search topics, problems…</span>
          </span>
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-3xs">
            ⌘K
          </kbd>
        </Link>

        {/* Right status indicators */}
        <div className="flex items-center gap-4">
          {/* Syllabus Progress */}
          <Link
            href="/learn"
            className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100/70 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Syllabus</span>
            <span className="rounded-full bg-indigo-200/80 px-1.5 py-0.2 text-[10px] font-bold text-indigo-900 tabular-nums">
              {overall}%
            </span>
          </Link>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-semibold text-amber-800">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="tabular-nums">{state.progress.streak}</span>
            <span className="text-[11px] font-medium text-amber-700/80">days</span>
          </div>

          {/* Ranking Score */}
          <Link
            href="/rankings"
            className="flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/70 px-3 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-100/70 transition-colors"
          >
            <Trophy className="h-3.5 w-3.5 text-purple-600" />
            <span className="tabular-nums">{state.progress.rankingScore}</span>
            <span className="text-[11px] font-medium text-purple-700/80">pts</span>
          </Link>

          {/* User Capsule */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 hover:border-slate-300 transition-all shadow-2xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-[11px] font-bold text-white shadow-xs">
              {initials}
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-slate-800">
                {state.user.displayName || state.user.name.split(" ")[0] || "Student"}
              </span>
              <span className="text-[10px] text-slate-400">
                {state.user.department || "IT"} · {state.user.batch || "A"}
              </span>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
}
