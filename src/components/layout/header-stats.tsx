"use client";

import Link from "next/link";
import { Flame, Snowflake } from "lucide-react";
import { useHydrated, useLevel } from "@/components/progression";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useEngine } from "@/lib/engine";
import { todayKey } from "@/lib/engine/rules/dates";
import { cn } from "@/lib/utils";

function Divider({ className }: { className?: string }) {
  return (
    <span className={cn("mx-0.5 h-5 w-px shrink-0 bg-slate-200/90", className)} aria-hidden />
  );
}

export function HeaderStatsCluster({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const engine = useEngine();
  const level = useLevel();
  const day = todayKey();
  const earned = hydrated ? (engine.xpByDay[day] ?? 0) : 0;
  const goal = engine.dailyGoalXp;
  const goalPct = goal > 0 ? Math.min(100, Math.round((earned / goal) * 100)) : 0;
  const streakActive = hydrated && engine.streak.current > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl border border-slate-200/80 bg-slate-50/90 p-0.5 shadow-sm shadow-slate-900/5",
        className
      )}
    >
      <Link
        href="/achievements"
        className="flex items-center gap-1.5 rounded-[14px] px-2.5 py-1.5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`${hydrated ? engine.streak.current : 0} day streak`}
      >
        <Flame
          className={cn("h-4 w-4 shrink-0", streakActive ? "text-orange-500" : "text-slate-300")}
          aria-hidden
        />
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {hydrated ? engine.streak.current : "—"}
        </span>
        {hydrated && engine.streak.freezes > 0 ? (
          <span
            className="inline-flex items-center gap-0.5 rounded-md bg-sky-100/90 px-1 py-0.5 text-[10px] font-semibold tabular-nums text-sky-700"
            title="Streak freezes"
          >
            <Snowflake className="h-2.5 w-2.5" aria-hidden />
            {engine.streak.freezes}
          </span>
        ) : null}
      </Link>

      <Divider />

      <Link
        href="/dashboard#today"
        className="hidden items-center gap-1.5 rounded-[14px] px-2 py-1.5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex"
        aria-label="Daily XP goal"
      >
        <ProgressRing
          value={goalPct}
          size={26}
          stroke={3}
          trackClassName="text-slate-200"
          barClassName={goalPct >= 100 ? "text-emerald-500" : "text-indigo-500"}
          label="Daily XP goal"
        >
          <span className="text-[9px] font-bold tabular-nums leading-none text-slate-800">
            {hydrated ? earned : "—"}
          </span>
        </ProgressRing>
        <span className="hidden text-[10px] font-medium tabular-nums text-slate-500 lg:inline">
          / {goal} XP
        </span>
      </Link>

      <Divider className="hidden sm:block" />

      <Link
        href="/achievements"
        className="flex items-baseline gap-1 rounded-[14px] px-2.5 py-1.5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Level ${hydrated ? level.level : 1}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lv</span>
        <span className="text-sm font-bold tabular-nums text-slate-900">
          {hydrated ? level.level : "—"}
        </span>
      </Link>
    </div>
  );
}
