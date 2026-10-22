"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Map as MapIcon,
  Snowflake,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  ACHIEVEMENT_DEFS,
} from "@/lib/engine/rules/achievements";
import { todayKey } from "@/lib/engine/rules/dates";
import { levelFromXp, useEngine } from "@/lib/engine";
import { claimEngineQuest } from "@/lib/engine/store";
import type { Achievement, LevelInfo, Quest } from "@/lib/engine/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Map: MapIcon,
  CheckCircle2,
  Brain,
  Flame,
  Swords,
  TrendingUp,
  Crown,
  BookOpen,
  Zap,
  Target,
  Trophy,
};

/** Avoid SSR/client mismatch for localStorage-backed engine state. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useLevel(): LevelInfo {
  const xp = useEngine().xp;
  return useMemo(() => levelFromXp(xp), [xp]);
}

const sizeMap = { sm: 28, md: 36, lg: 48 };

export function StreakFlame({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hydrated = useHydrated();
  const s = useEngine();
  const px = sizeMap[size];
  const active = hydrated && s.streak.current > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 tabular-nums font-bold text-[var(--flame-strong)]",
        className
      )}
      data-size={size}
    >
      <Flame
        className={cn("shrink-0", active ? "text-[var(--flame)]" : "text-slate-300")}
        style={{ width: px, height: px }}
        aria-hidden
      />
      <span>{hydrated ? s.streak.current : "—"}</span>
      {hydrated && s.streak.freezes > 0 ? (
        <span
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600"
          title="Streak freezes"
        >
          <Snowflake className="h-3 w-3" aria-hidden />
          {s.streak.freezes}
        </span>
      ) : null}
    </span>
  );
}

export function LevelBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const l = useLevel();

  return (
    <span
      className={cn(
        "inline-flex flex-col",
        compact ? "gap-0" : "gap-0.5",
        className
      )}
      data-compact={compact}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Level
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
        {hydrated ? l.level : "—"}
      </span>
      {!compact && hydrated ? (
        <span className="text-xs text-muted-foreground">{l.title}</span>
      ) : null}
    </span>
  );
}

export function DailyGoalRing({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const s = useEngine();
  const day = todayKey();
  const earned = hydrated ? (s.xpByDay[day] ?? 0) : 0;
  const goal = s.dailyGoalXp;
  const pct = goal > 0 ? Math.min(100, Math.round((earned / goal) * 100)) : 0;

  return (
    <ProgressRing
      value={pct}
      size={size}
      stroke={5}
      className={className}
      trackClassName="text-slate-200"
      barClassName={pct >= 100 ? "text-emerald-500" : "text-[var(--xp)]"}
      label="Daily XP goal"
    >
      <div className="text-center leading-tight">
        <div className="text-xs font-bold tabular-nums text-foreground">
          {hydrated ? earned : "—"}
        </div>
        <div className="text-[9px] text-muted-foreground">/ {goal}</div>
      </div>
    </ProgressRing>
  );
}

export function XpBar({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const l = useLevel();

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{hydrated ? `${l.xpIntoLevel} / ${l.xpForNext} XP` : "—"}</span>
        <span className="tabular-nums">{hydrated ? `${l.pct}%` : ""}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--xp)] to-emerald-500 transition-[width] duration-500 ease-out"
          style={{ width: hydrated ? `${l.pct}%` : "0%" }}
          role="progressbar"
          aria-valuenow={hydrated ? l.pct : 0}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function QuestRow({ quest }: { quest: Quest }) {
  const done = quest.progress >= quest.target;
  const canClaim = done && !quest.claimed;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{quest.title}</p>
        <p className="text-[11px] text-muted-foreground">
          {Math.min(quest.progress, quest.target)} / {quest.target} · +{quest.xp} XP
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-[width]"
            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
          />
        </div>
      </div>
      {quest.claimed ? (
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Claimed</span>
      ) : canClaim ? (
        <Button type="button" size="sm" onClick={() => claimEngineQuest(quest.id)}>
          Claim
        </Button>
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {quest.period}
        </span>
      )}
    </li>
  );
}

export function QuestList({
  period,
  limit,
  className,
}: {
  period?: "daily" | "weekly";
  limit?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const quests = useEngine().quests;
  const filtered = useMemo(() => {
    let list = period ? quests.filter((q) => q.period === period) : quests;
    if (limit) list = list.slice(0, limit);
    return list;
  }, [quests, period, limit]);

  if (!hydrated) {
    return <div className={cn("text-sm text-muted-foreground", className)}>Loading quests…</div>;
  }

  if (filtered.length === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No quests yet.</div>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {filtered.map((q) => (
        <QuestRow key={q.id} quest={q} />
      ))}
    </ul>
  );
}

function AchievementTile({
  def,
  unlocked,
}: {
  def: Omit<Achievement, "unlockedAt">;
  unlocked?: Achievement;
}) {
  const Icon = ICONS[def.icon] ?? Trophy;
  const on = Boolean(unlocked);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
        on
          ? "border-amber-200/80 bg-amber-50/50"
          : "border-border/60 bg-muted/30 opacity-70"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
          on ? "bg-amber-100 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-400 ring-slate-200"
        )}
      >
        {on ? <Icon className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
      </div>
      <p className="text-xs font-semibold text-foreground">{def.title}</p>
      <p className="text-[10px] leading-snug text-muted-foreground">{def.description}</p>
    </div>
  );
}

export function AchievementGrid({
  limit,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const unlocked = useEngine().achievements;
  const byId = useMemo(() => new globalThis.Map(unlocked.map((a) => [a.id, a])), [unlocked]);
  const defs = limit ? ACHIEVEMENT_DEFS.slice(0, limit) : ACHIEVEMENT_DEFS;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        !hydrated && "opacity-60",
        className
      )}
    >
      {defs.map((def) => (
        <AchievementTile key={def.id} def={def} unlocked={hydrated ? byId.get(def.id) : undefined} />
      ))}
    </div>
  );
}

export function StreakCalendar({
  weeks = 12,
  className,
}: {
  weeks?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const streak = useEngine().streak;
  const cells = useMemo(() => {
    const total = weeks * 7;
    const today = todayKey();
    const out: { day: string; kind: "empty" | "active" | "frozen" | "none" }[] = [];
    for (let i = total - 1; i >= 0; i--) {
      const d = new Date(`${today}T12:00:00`);
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      if (streak.activeDates.includes(key)) out.push({ day: key, kind: "active" });
      else if (streak.frozenDates.includes(key)) out.push({ day: key, kind: "frozen" });
      else out.push({ day: key, kind: "none" });
    }
    return out;
  }, [weeks, streak.activeDates, streak.frozenDates]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1" aria-label="Practice calendar">
        {cells.map((c) => (
          <span
            key={c.day}
            title={c.day}
            className={cn(
              "h-3 w-3 rounded-sm",
              c.kind === "active" && "bg-[var(--flame)]",
              c.kind === "frozen" && "bg-sky-400",
              c.kind === "none" && "bg-slate-200/90"
            )}
          />
        ))}
      </div>
      {!hydrated ? (
        <p className="text-[11px] text-muted-foreground">Syncing calendar…</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-sm bg-[var(--flame)] mr-1 align-middle" />
          Active
          <span className="inline-block h-2 w-2 rounded-sm bg-sky-400 mx-1 align-middle" />
          Freeze
        </p>
      )}
    </div>
  );
}
