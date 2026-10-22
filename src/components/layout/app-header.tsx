"use client";

import Link from "next/link";
import { Keyboard, Search } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { DailyGoalRing, LevelBadge, StreakFlame } from "@/components/progression";
import { Kbd } from "@/components/ui/kbd";
import { openCommandPalette, openShortcutsHelp } from "./use-shell-data";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md lg:h-16 lg:px-8">
      <div className="lg:hidden">
        <Logo href="/dashboard" size="sm" />
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        aria-label="Search lessons, pages and actions (Ctrl K)"
        aria-keyshortcuts="Control+K Meta+K"
        className="ml-auto flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:ml-0 lg:w-80 lg:justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          <span className="hidden sm:inline">Search or ask Kip…</span>
        </span>
        <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
      </button>

      <div className="flex items-center gap-2 lg:ml-auto lg:gap-3">
        <Link
          href="/achievements"
          aria-label="Streak"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <StreakFlame size="sm" />
        </Link>
        <Link
          href="/dashboard#today"
          aria-label="Daily goal"
          className="hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:inline-flex"
        >
          <DailyGoalRing size={30} />
        </Link>
        <Link
          href="/achievements"
          aria-label="Level"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <LevelBadge compact />
        </Link>
        <button
          type="button"
          onClick={openShortcutsHelp}
          aria-label="Keyboard shortcuts (?)"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:flex"
        >
          <Keyboard className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
