"use client";

import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageScroll } from "@/components/layout/page-shell";
import { useMounted, useReviewsDue } from "@/components/layout/use-shell-data";
import { CompanionBriefing } from "@/components/companion";
import { QuestList, StreakCalendar } from "@/components/progression";
import { Reveal } from "@/components/motion";
import {
  BatchLeaders,
  ContinueCard,
  FirstSteps,
  PathStrip,
  ReviewDueCard,
  SectionTitle,
  StatRow,
  TeaserCards,
  resolveContinue,
} from "@/components/dashboard/today-sections";
import { useApp } from "@/lib/context/app-context";
import { useEngine } from "@/lib/engine";
import { getNextIncompleteLesson } from "@/lib/data/dsa-syllabus";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { state, hydrated } = useApp();
  const engine = useEngine();
  const mounted = useMounted();
  const due = useReviewsDue();

  const firstName = (state.user.displayName || state.user.name || "").split(" ")[0];
  const target = resolveContinue(state.progress.lastVisitedLesson, getNextIncompleteLesson(state.progress.completedLessons));
  const ready = mounted && hydrated;
  const isNew = ready && engine.xp === 0 && state.progress.completedLessons.length === 0;
  const currentModule = target.href.split("/")[2];

  return (
    <AppLayout>
      <PageScroll className="gap-6 lg:gap-8">
        <Reveal as="section" className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 pb-16 text-white shadow-xl lg:p-8 lg:pb-20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-16 right-48 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-indigo-100 ring-1 ring-white/15">
                    <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
                    Today
                  </span>
                  {ready && engine.streak.current > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-400/30">
                      <Flame className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                      {engine.streak.current}-day streak
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  {mounted ? getGreeting() : "Welcome back"}
                  {firstName && (
                    <>
                      , <span className="text-cyan-300">{firstName}</span>
                    </>
                  )}
                </h1>
                <p className="text-sm leading-relaxed text-indigo-200/90 text-pretty md:text-justify">
                  {isNew
                    ? "Your path is set. One short lesson gets everything moving."
                    : due > 0
                      ? `Pick up your lesson, then clear ${due} review${due === 1 ? "" : "s"} to keep it all fresh.`
                      : "One focused session today keeps the streak and the memory alive."}
                </p>
              </div>
              <ContinueCard target={target} isNew={isNew} />
            </div>
          </div>
          <div className="relative z-10 -mt-10 px-3 sm:px-6">
            <CompanionBriefing className="shadow-lg" />
          </div>
        </Reveal>

        {isNew ? (
          <Reveal delay={80}>
            <FirstSteps target={target} />
          </Reveal>
        ) : (
          <Reveal delay={80}>
            <StatRow due={due} mounted={ready} />
          </Reveal>
        )}

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <ReviewDueCard due={due} />

            <Reveal as="section" delay={140} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div id="today" className="scroll-mt-24" />
              <SectionTitle
                id="quests-title"
                title="Today's quests"
                sub="Resets at midnight. Each one pays XP."
                action={
                  <Link href="/achievements" className="rounded text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                    Trophy room
                  </Link>
                }
              />
              <QuestList period="daily" limit={4} />
            </Reveal>

            <Reveal delay={200}>
              <PathStrip completed={state.progress.completedLessons} currentModule={currentModule} />
            </Reveal>

            <Reveal delay={260}>
              <TeaserCards />
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal as="section" delay={180} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <SectionTitle
                id="streak-title"
                title="Consistency"
                sub={ready ? `Longest streak: ${engine.streak.longest} days` : "Last 12 weeks"}
              />
              <StreakCalendar weeks={12} />
            </Reveal>
            <Reveal delay={240}>
              <BatchLeaders batch={state.user.batch || "A"} />
            </Reveal>
          </div>
        </div>
      </PageScroll>
    </AppLayout>
  );
}
