"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Gift, Repeat, Swords, Trophy, Zap } from "lucide-react";
import { CompanionAvatar } from "@/components/companion";
import { CountUp } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RankBadge } from "@/components/shared/rank-badge";
import { DSA_SYLLABUS, getLesson, getModule, moduleProgress } from "@/lib/data/dsa-syllabus";
import { levelFromXp, todayKey, useEngine } from "@/lib/engine";
import type { LeaderboardRow } from "@/lib/types/rankings";
import { cn } from "@/lib/utils";

export interface ContinueTarget {
  href: string;
  moduleTitle: string;
  lessonTitle: string;
  minutes: number;
  resumed: boolean;
}

export function resolveContinue(
  last: { moduleSlug: string; lessonSlug: string } | undefined,
  next: { moduleSlug: string; lessonSlug: string } | null
): ContinueTarget {
  const target = last ?? next;
  if (!target) {
    return { href: "/learn", moduleTitle: "Curriculum complete", lessonTitle: "Pick any module to revisit", minutes: 0, resumed: false };
  }
  const mod = getModule(target.moduleSlug);
  const les = getLesson(target.moduleSlug, target.lessonSlug);
  return {
    href: `/learn/${target.moduleSlug}/${target.lessonSlug}`,
    moduleTitle: mod?.title ?? "Curriculum",
    lessonTitle: les?.title ?? target.lessonSlug.replace(/-/g, " "),
    minutes: les?.estimatedMinutes ?? 20,
    resumed: !!last,
  };
}

export function ContinueCard({ target, isNew }: { target: ContinueTarget; isNew: boolean }) {
  return (
    <div className="flex w-full shrink-0 flex-col rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-md lg:w-80">
      <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-200">
        <span>{isNew ? "Your first stop" : target.resumed ? "Pick up where you left off" : "Up next"}</span>
        {target.minutes > 0 && (
          <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] tabular-nums text-indigo-100">{target.minutes} min</span>
        )}
      </span>
      <p className="mt-2 truncate text-xs font-medium text-cyan-300">{target.moduleTitle}</p>
      <h2 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-white">{target.lessonTitle}</h2>
      <Link
        href={target.href}
        className="group mt-4 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-bold text-indigo-950 shadow-md transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60"
      >
        {isNew ? "Start lesson 1" : "Continue"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
      </Link>
    </div>
  );
}

function StatTile({
  label,
  icon: Icon,
  tone,
  children,
  foot,
}: {
  label: string;
  icon: typeof Zap;
  tone: "indigo" | "purple" | "amber" | "sky";
  children: React.ReactNode;
  foot: React.ReactNode;
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    purple: "bg-purple-50 text-purple-600 ring-purple-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
  } as const;
  return (
    <div className="hover-lift rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", tones[tone])}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{children}</div>
      <div className="mt-1.5 text-[11px] text-slate-500">{foot}</div>
    </div>
  );
}

export function StatRow({ due, mounted }: { due: number; mounted: boolean }) {
  const engine = useEngine();
  const lvl = levelFromXp(engine.xp);
  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatTile label="Total XP" icon={Zap} tone="indigo" foot={`${engine.xpByDay[todayKey()] ?? 0} earned today`}>
        <CountUp value={engine.xp} />
        <span className="text-xs font-medium text-slate-500">xp</span>
      </StatTile>
      <StatTile
        label="Level"
        icon={Trophy}
        tone="purple"
        foot={
          <span className="flex items-center gap-2">
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-purple-500" style={{ width: `${Math.round(lvl.pct)}%` }} />
            </span>
            <span className="tabular-nums">{lvl.xpForNext - lvl.xpIntoLevel} to go</span>
          </span>
        }
      >
        {lvl.level}
        <span className="truncate text-xs font-medium text-slate-500">{lvl.title}</span>
      </StatTile>
      <StatTile
        label="Streak"
        icon={Flame}
        tone="amber"
        foot={engine.streak.freezes > 0 ? `${engine.streak.freezes} freeze${engine.streak.freezes > 1 ? "s" : ""} banked` : `Best: ${engine.streak.longest} days`}
      >
        <CountUp value={engine.streak.current} />
        <span className="text-xs font-medium text-amber-700">{engine.streak.current === 1 ? "day" : "days"}</span>
      </StatTile>
      <Link href="/review" className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <StatTile label="Reviews due" icon={Repeat} tone="sky" foot={due > 0 ? "Clear them to lock in memory" : "All caught up"}>
          <CountUp value={due} />
          <span className="text-xs font-medium text-slate-500">cards</span>
        </StatTile>
      </Link>
    </div>
  );
}

export function FirstSteps({ target }: { target: ContinueTarget }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <CompanionAvatar mood="excited" size={64} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Kip</p>
          <h3 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">Your stats start with one lesson.</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">{target.lessonTitle}</span> takes about {target.minutes} minutes.
            Finish it and you&apos;ll earn your first XP, start a streak, and unlock reviews.
          </p>
        </div>
        <Link
          href={target.href}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
        >
          Start now <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ol className="mt-5 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        {["Read the 3-minute hook", "Predict, then run the example", "Pass the knowledge check"].map((s, i) => (
          <li key={s} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[10px] font-bold text-indigo-700">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PathStrip({ completed, currentModule }: { completed: string[]; currentModule?: string }) {
  const nodes = useMemo(
    () => DSA_SYLLABUS.map((m) => ({ slug: m.slug, title: m.title, pct: moduleProgress(m.slug, completed) })),
    [completed]
  );
  const currentIdx = Math.max(0, nodes.findIndex((n) => n.slug === currentModule));
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5" aria-labelledby="path-preview">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 id="path-preview" className="text-sm font-bold text-slate-900">Your path</h3>
          <p className="text-[11px] text-slate-500">
            Stop {currentIdx + 1} of {nodes.length}: {nodes[currentIdx]?.title}
          </p>
        </div>
        <Link href="/path" className="inline-flex items-center gap-1 rounded text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          Open map <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ol className="-mx-1 flex items-center overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin]">
        {nodes.map((n, i) => {
          const done = n.pct >= 100;
          const current = i === currentIdx;
          return (
            <li key={n.slug} className="flex shrink-0 items-center">
              {i > 0 && <span className={cn("h-0.5 w-5 sm:w-7", i <= currentIdx ? "bg-indigo-400" : "bg-slate-200")} aria-hidden />}
              <Link
                href={`/learn/${n.slug}`}
                title={`${n.title} · ${n.pct}%`}
                aria-label={`${n.title}, ${done ? "complete" : current ? "current" : `${n.pct}% done`}`}
                className={cn(
                  "relative flex items-center justify-center rounded-full font-mono text-[10px] font-bold transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 motion-reduce:transition-none",
                  current ? "h-9 w-9 bg-indigo-600 text-white ring-4 ring-indigo-100" : "h-7 w-7",
                  !current && done && "bg-emerald-500 text-white",
                  !current && !done && n.pct > 0 && "bg-indigo-100 text-indigo-700",
                  !current && !done && n.pct === 0 && "bg-slate-100 text-slate-400"
                )}
              >
                {i + 1}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReviewDueCard({ due }: { due: number }) {
  if (due <= 0) return null;
  const minutes = Math.max(1, Math.round((due * 12) / 60));
  return (
    <Link
      href="/review"
      className="hover-lift group flex items-center gap-4 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
        <Repeat className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-amber-950">
          {due} card{due === 1 ? "" : "s"} ready, {minutes} min
        </span>
        <span className="block text-xs text-amber-900/75">Review now, before they fade.</span>
      </span>
      <ArrowRight className="h-4 w-4 text-amber-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
    </Link>
  );
}

export function TeaserCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/arena"
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-5 text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/60"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" aria-hidden />
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Swords className="h-[18px] w-[18px] text-rose-300" aria-hidden />
        </span>
        <h3 className="mt-3 text-sm font-bold">Arena: mock interview</h3>
        <p className="mt-1 text-xs leading-relaxed text-indigo-200/85">
          A timed boss fight with an AI interviewer. Think aloud, get scored, get better.
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
          Enter the arena <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </span>
      </Link>
      <Link
        href="/wrapped"
        className="group relative overflow-hidden rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-50 via-white to-pink-50/60 p-5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
          <Gift className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <h3 className="mt-3 text-sm font-bold text-slate-900">Your Wrapped</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Your learning story in a shareable recap: topics conquered, streaks, and best moments.
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-700">
          See your recap <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </span>
      </Link>
    </div>
  );
}

/** Batch leaderboard preview. Renders nothing if rankings are unavailable (no Supabase, offline, empty). */
export function BatchLeaders({ batch }: { batch: string }) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/rankings?scope=batch&period=weekly&category=practice_points", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRows(Array.isArray(d?.rows) ? (d.rows as LeaderboardRow[]).slice(0, 5) : []))
      .catch(() => setRows([]));
    return () => ctrl.abort();
  }, []);

  if (!rows || rows.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5" aria-labelledby="batch-leaders">
      <div className="mb-3 flex items-center justify-between">
        <h3 id="batch-leaders" className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Trophy className="h-4 w-4 text-purple-600" aria-hidden /> Batch {batch} this week
        </h3>
        <Link href="/rankings" className="rounded text-xs font-semibold text-purple-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
          Full board
        </Link>
      </div>
      <ol className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.userId} className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50">
            <span className="flex min-w-0 items-center gap-2.5">
              <RankBadge rank={r.rank} size="sm" />
              <span className="truncate text-xs font-semibold text-slate-800">{r.displayName}</span>
            </span>
            <span className="text-xs font-bold tabular-nums text-indigo-600">
              {r.score}
              <span className="ml-1 text-[10px] font-normal text-slate-400">pts</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SectionTitle({ id, title, sub, action }: { id: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 id={id} className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          {title}
        </h3>
        {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}