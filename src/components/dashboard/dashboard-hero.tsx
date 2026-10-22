"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanionBriefing, CompanionNote } from "@/components/companion";
import { DailyGoalRing, LevelBadge, StreakFlame, XpBar } from "@/components/progression";
import { Reveal } from "@/components/motion";
import { useApp } from "@/lib/context/app-context";
import { getGreeting } from "@/lib/utils";
import { getNextIncompleteLesson, syllabusProgress } from "@/lib/data/dsa-syllabus";
import { DSA_SYLLABUS } from "@/lib/data/dsa-syllabus";

export function DashboardHero({ continueHref }: { continueHref: string }) {
  const { state } = useApp();
  const firstName = state.user.name.split(" ")[0] || "Learner";
  const nextLesson = getNextIncompleteLesson(state.progress.completedLessons);
  const syllabusPct = syllabusProgress(state.progress.completedLessons);

  const modSlug = state.progress.lastVisitedLesson?.moduleSlug || nextLesson?.moduleSlug;
  const mod = modSlug ? DSA_SYLLABUS.find((m) => m.slug === modSlug) : undefined;
  const lessonTitle =
    state.progress.lastVisitedLesson?.lessonSlug?.replace(/-/g, " ") ||
    nextLesson?.lessonSlug.replace(/-/g, " ") ||
    "Arrays & indexing";

  return (
    <Reveal className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl lg:p-8 m-rise">
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 right-48 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-800/80 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-white/10">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              DevPath · V14
            </span>
            <StreakFlame
              size="sm"
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/30 tabular-nums"
            />
            <LevelBadge compact className="text-xs font-semibold text-cyan-200" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {getGreeting()}, <span className="text-cyan-300">{firstName}</span>
          </h1>

          <CompanionNote
            mood="focused"
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-indigo-100/95 backdrop-blur-sm"
          >
            Kip mapped your next node — syllabus{" "}
            <strong className="text-white tabular-nums">{syllabusPct}%</strong> complete. One focused
            session keeps the path glowing.
          </CompanionNote>

          <CompanionBriefing className="hidden" />

          <XpBar className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/15" />
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:w-72">
          <DailyGoalRing size={72} className="text-cyan-300 font-bold tabular-nums" />
          <div className="w-full text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">Next node</p>
            <p className="text-xs font-medium text-cyan-300 truncate">{mod?.title ?? "Curriculum"}</p>
            <h2 className="mt-0.5 text-sm font-bold capitalize truncate">{lessonTitle}</h2>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[11px] text-indigo-200 mb-1">
              <span>Path progress</span>
              <span className="font-semibold text-white tabular-nums">{syllabusPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-300 transition-all duration-500"
                style={{ width: `${syllabusPct}%` }}
              />
            </div>
          </div>
          <Button
            size="sm"
            className="w-full bg-white text-indigo-950 font-bold hover:bg-cyan-50 shadow-md group"
            asChild
          >
            <Link href={continueHref} className="flex items-center justify-center gap-1.5">
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="w-full border-white/25 bg-transparent text-white hover:bg-white/10" asChild>
            <Link href="/path">View path map</Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
