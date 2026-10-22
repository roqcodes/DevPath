"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Code2,
  Flame,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/learn",
    label: "Learn",
    icon: BookOpen,
    badge: "89",
  },
  {
    href: "/practice",
    label: "Practice",
    icon: Code2,
    badge: "Bank",
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: Zap,
    badge: "Beta",
  },
  {
    href: "/rankings",
    label: "Rankings",
    icon: Trophy,
    badge: null,
  },
];

const BOTTOM_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useApp();

  const userInitials = (state.user.name || "Student")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const NavLink = ({
    href,
    label,
    icon: Icon,
    badge,
  }: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string | null;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-[0_1px_2px_rgba(79,70,229,0.06)] ring-1 ring-indigo-200/70"
            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              active
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
          </div>
          <span>{label}</span>
        </div>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight transition-colors",
              active
                ? "bg-indigo-200/70 text-indigo-800"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
            )}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white">
      {/* Brand header */}
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Logo href="/dashboard" size="sm" />
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Platform Menu
          </p>
          <nav className="space-y-1" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* Motivational Card: Daily Streak & Focus */}
        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-100/30 p-3.5 shadow-[0_2px_8px_rgba(245,158,11,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              {state.progress.streak} Day Streak
            </span>
            <span className="rounded-full bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              Active
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900/80 mb-2.5">
            Keep your momentum going! Solve 2 problems or complete 1 lesson today.
          </p>
          <Link
            href="/learn"
            className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Resume Syllabus
          </Link>
        </div>

        {/* Account links */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Account
          </p>
          <nav className="space-y-1" aria-label="Account">
            {BOTTOM_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>
      </div>

      {/* User profile footer pill */}
      <div className="border-t border-slate-100 p-3.5">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors group"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 font-semibold text-white shadow-xs ring-2 ring-indigo-100">
            {userInitials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1 leading-tight">
            <span className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {state.user.name || "Student"}
            </span>
            <span className="truncate text-[11px] text-slate-500">
              {state.user.department || "IT"} · Batch {state.user.batch || "A"}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-3.5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-sm lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      <div className="hidden lg:block shrink-0">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-fade-in shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
