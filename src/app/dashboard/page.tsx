"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { getGreeting } from "@/lib/utils";
import { DSA_SYLLABUS, getNextIncompleteLesson, syllabusProgress } from "@/lib/data/dsa-syllabus";
import { RANKING_RULES } from "@/lib/services/ranking-service";
import { listPublishedProblems } from "@/lib/problems/problem-catalog";
import type { LeaderboardRow } from "@/lib/types/rankings";
import { cn } from "@/lib/utils";
import { RankBadge } from "@/components/shared/rank-badge";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { state } = useApp();
  const [batchPreview, setBatchPreview] = useState<LeaderboardRow[]>([]);
  const firstName = state.user.name.split(" ")[0] || "Student";
  const nextLesson = getNextIncompleteLesson(state.progress.completedLessons);
  const syllabusPct = syllabusProgress(state.progress.completedLessons);
  const uniqueSolved = state.progress.solvedProblems.length;
  const dept = state.user.department || "IT";
  const batch = state.user.batch || "A";
  const academicYear = state.user.academicYear || "2";

  const continueHref = state.progress.lastVisitedLesson
    ? `/learn/${state.progress.lastVisitedLesson.moduleSlug}/${state.progress.lastVisitedLesson.lessonSlug}`
    : nextLesson
      ? `/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`
      : state.progress.lastActiveProblemId
        ? `/practice/${state.progress.lastActiveProblemId}`
        : "/learn";

  const nextLessonTitle = useMemo(() => {
    if (state.progress.lastVisitedLesson) {
      return state.progress.lastVisitedLesson.lessonSlug.replace(/-/g, " ");
    }
    if (nextLesson) {
      return nextLesson.lessonSlug.replace(/-/g, " ");
    }
    return "Foundations: Arrays & Indexing";
  }, [state.progress.lastVisitedLesson, nextLesson]);

  const nextModuleTitle = useMemo(() => {
    const modSlug = state.progress.lastVisitedLesson?.moduleSlug || nextLesson?.moduleSlug;
    if (!modSlug) return "Curriculum";
    const mod = DSA_SYLLABUS.find((m) => m.slug === modSlug);
    return mod?.title || "Data Structures";
  }, [state.progress.lastVisitedLesson, nextLesson]);

  useEffect(() => {
    fetch("/api/rankings?scope=batch&period=weekly&category=practice_points")
      .then((r) => r.json())
      .then((data) => setBatchPreview((data.rows ?? []).slice(0, 5)))
      .catch(() => setBatchPreview([]));
  }, []);

  const recentTopics = useMemo(() => {
    return listPublishedProblems()
      .filter((p) => state.progress.solvedProblems.includes(p.id))
      .flatMap((p) => p.topics)
      .slice(0, 5);
  }, [state.progress.solvedProblems]);

  const daily = state.progress.dailyGoal;
  const lessonDone = daily.completedLessons >= daily.targetLessons;
  const problemsDone = daily.completedProblems >= daily.targetProblems;

  // Compute day of week index for consistency tracker (0 = Mon, 6 = Sun)
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  // Student Initials
  const userInitials = (state.user.name || "Student")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* ========================================================================= */}
        {/* 1. HERO SPOTLIGHT & WELCOME BANNER                                        */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl lg:p-8">
          {/* Subtle background graphic geometry */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 right-48 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left greeting & status */}
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-800/80 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-white/10">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  SAIT CUSAT · Fall Term
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-amber-400/30">
                  <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {state.progress.streak} Day Streak
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {getGreeting()}, <span className="text-cyan-300">{firstName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Department of {dept} · Year {academicYear} · Batch {batch}. You have completed{" "}
                <strong className="text-white font-semibold">{syllabusPct}%</strong> of the CUSAT peer
                curriculum.
              </p>
            </div>

            {/* Right Quick Resume Learning Capsule */}
            <div className="flex shrink-0 flex-col rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all hover:bg-white/15 shadow-lg lg:w-80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200 flex items-center justify-between">
                <span>Next Milestone</span>
                <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] text-indigo-200">
                  ~25 min
                </span>
              </span>
              <p className="mt-1 text-xs font-medium text-cyan-300 truncate">{nextModuleTitle}</p>
              <h2 className="mt-0.5 text-sm font-bold text-white capitalize truncate">{nextLessonTitle}</h2>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-indigo-200 mb-1">
                  <span>Module completion</span>
                  <span className="font-semibold text-white">{syllabusPct}%</span>
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
                className="mt-4 w-full bg-white text-indigo-950 font-bold hover:bg-cyan-50 shadow-md group"
                asChild
              >
                <Link href={continueHref} className="flex items-center justify-center gap-1.5">
                  <span>Continue Lesson</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FOUR KEY METRIC STAT CARDS (Inspired by Reference 1 & 2)              */}
        {/* ========================================================================= */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Solved Problems */}
          <Card className="hover-lift border-slate-200/80 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Unique Solved</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{uniqueSolved}</span>
                <span className="text-xs text-slate-500">problems</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Weekly Target: {state.user.weeklyGoalProblems}</span>
                <Badge variant="success" dot className="text-[10px]">
                  {uniqueSolved >= state.user.weeklyGoalProblems ? "Met" : "In Progress"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Practice Streak */}
          <Card className="hover-lift border-slate-200/80 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Current Streak</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {state.progress.streak}
                </span>
                <span className="text-xs font-medium text-amber-700">Days on-fire</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Qualifying solves</span>
                <Badge variant="warning" className="text-[10px]">
                  Asia/Kolkata
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Active Time */}
          <Card className="hover-lift border-slate-200/80 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Time (Week)</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {state.progress.activeMinutesThisWeek}
                </span>
                <span className="text-xs text-slate-500">minutes</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Heartbeat tracking</span>
                <Badge variant="sky" className="text-[10px]">
                  Focused
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Ranking Score */}
          <Card className="hover-lift border-slate-200/80 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Ranking Score</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {state.progress.rankingScore}
                </span>
                <span className="text-xs text-slate-500">pts</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Batch {batch}</span>
                <Link
                  href="/rankings"
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-purple-700 hover:underline"
                >
                  Leaderboard <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD SPLIT (2 COLUMNS: CONTENT & CONTEXTUAL PROFILE)        */}
        {/* ========================================================================= */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT 2 COLUMNS: LEARNING ROADMAP & DAILY ACTION PLAN                   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Daily Target Checklist (Inspired by Reference 2 & 3 To-Do) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Today&apos;s Learning Plan
                    </CardTitle>
                    <p className="text-xs text-slate-500">Stay consistent with daily DSA practice</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {/* Task 1: Complete 1 lesson */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        lessonDone
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300 text-slate-400"
                      )}
                    >
                      {lessonDone ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", lessonDone ? "text-slate-500 line-through" : "text-slate-800")}>
                        Complete one structured lesson
                      </p>
                      <p className="text-[11px] text-slate-500">Review checkpoints or knowledge quizzes</p>
                    </div>
                  </div>
                  <Badge variant={lessonDone ? "success" : "outline"} className="text-xs">
                    {lessonDone ? "Completed" : "Open"}
                  </Badge>
                </div>

                {/* Task 2: Solve 2 problems */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        problemsDone
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300 text-slate-400"
                      )}
                    >
                      {problemsDone ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", problemsDone ? "text-slate-500 line-through" : "text-slate-800")}>
                        Solve two problems on Judge
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Authoritative pass: {daily.completedProblems} of {daily.targetProblems}
                      </p>
                    </div>
                  </div>
                  <Badge variant={problemsDone ? "success" : "warning"} className="text-xs">
                    {problemsDone ? "Completed" : `${daily.completedProblems}/${daily.targetProblems}`}
                  </Badge>
                </div>

                {/* Task 3: Review complex topic */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 text-xs font-bold text-slate-400">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Review visualizer & complexity trade-offs
                      </p>
                      <p className="text-[11px] text-slate-500">Trace memory and operation steps</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                    <Link href="/learn">Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Modules & Syllabus Tracks (Inspired by Reference 1 & 3 Course Cards) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Curriculum Modules</h3>
                  <p className="text-xs text-slate-500">Core algorithmic foundations for CUSAT students</p>
                </div>
                <Link
                  href="/learn"
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View all 12 modules <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {DSA_SYLLABUS.slice(0, 4).map((mod, idx) => {
                  const total = mod.lessons.length;
                  const done = mod.lessons.filter((l) =>
                    state.progress.completedLessons.includes(l.id)
                  ).length;
                  const pct = total ? Math.round((done / total) * 100) : 0;

                  // Visual badges based on module index
                  const theme =
                    idx === 0
                      ? { bg: "bg-sky-50 text-sky-700 border-sky-200/80", icon: "arrays" }
                      : idx === 1
                        ? { bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80", icon: "strings" }
                        : idx === 2
                          ? { bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", icon: "search" }
                          : { bg: "bg-purple-50 text-purple-700 border-purple-200/80", icon: "hash" };

                  return (
                    <Card key={mod.id} className="hover-lift flex flex-col justify-between border-slate-200/80 bg-white p-5">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide",
                              theme.bg
                            )}
                          >
                            Track {mod.sortOrder}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {mod.estimatedHours}h study
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          <Link href={`/learn/${mod.slug}`} className="hover:text-indigo-600">
                            {mod.title}
                          </Link>
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span>Progress</span>
                          <span className="font-semibold text-slate-800">
                            {done}/{total} lessons ({pct}%)
                          </span>
                        </div>
                        <Progress value={pct} size="sm" />
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 capitalize">
                            {mod.difficultyRange[0]}–{mod.difficultyRange[1]}
                          </span>
                          <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-indigo-600" asChild>
                            <Link href={`/learn/${mod.slug}`} className="inline-flex items-center gap-1">
                              Open track
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recently Practiced Topics & Problem Bank Shortcut */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-600" />
                  Practice Bank Highlights
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Judged test suites with execution runtimes and memory validation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTopics.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Mastered Topic Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {recentTopics.map((t) => (
                        <Badge key={t} variant="secondary" className="capitalize text-xs font-medium">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Ready to test your code?</h5>
                    <p className="text-xs text-slate-500">
                      Solve published algorithmic challenges in Python, Java, or C++.
                    </p>
                  </div>
                  <Button size="sm" className="shrink-0" asChild>
                    <Link href="/practice">
                      Open Problem Bank
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: CONTEXTUAL STUDENT PROFILE, CONSISTENCY & LEADERBOARD     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="space-y-6">
            {/* Student Profile Card (Reference 1 & 2 inspired) */}
            <Card className="border-slate-200/80 bg-white text-center p-6">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-500 text-2xl font-bold text-white shadow-md ring-4 ring-indigo-50">
                {userInitials}
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {state.user.name || "Student"}
              </h3>
              <p className="text-xs text-slate-500">{state.user.email}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-left text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Department
                  </span>
                  <p className="font-semibold text-slate-800">{dept}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Batch
                  </span>
                  <p className="font-semibold text-slate-800">Batch {batch}</p>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Year
                  </span>
                  <p className="font-semibold text-slate-800">Year {academicYear}</p>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Language
                  </span>
                  <p className="font-semibold text-slate-800 capitalize">
                    {state.user.preferredLanguage || "Python"}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="mt-4 w-full text-xs font-semibold" asChild>
                <Link href="/profile">View Complete Profile</Link>
              </Button>
            </Card>

            {/* Weekly Consistency Visualizer (Reference 2 "Time spends" / Reference 3) */}
            <Card className="border-slate-200/80 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                    Weekly Consistency
                  </h4>
                  <p className="text-xs text-slate-500">Days active in Asia/Kolkata</p>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {state.progress.streak} Day Run
                </span>
              </div>

              {/* 7-day pill bars */}
              <div className="grid grid-cols-7 gap-2 items-end pt-3 pb-1 h-32 border-b border-slate-100">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isToday = idx === currentDayIndex;
                  const isPastOrToday = idx <= currentDayIndex;
                  // Dynamic height based on activity
                  const heightClass = isToday
                    ? "h-24 bg-gradient-to-t from-amber-500 to-orange-400 text-white shadow-xs"
                    : isPastOrToday
                      ? "h-16 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "h-8 bg-slate-100 text-slate-400";

                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-full rounded-xl flex items-center justify-center font-bold text-[10px] transition-all",
                          heightClass
                        )}
                        title={`${day}: ${isToday ? "Active Today" : "Tracked"}`}
                      >
                        {isToday && <Flame className="h-3.5 w-3.5 fill-white text-white" />}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          isToday ? "text-amber-800 font-bold" : "text-slate-400"
                        )}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-slate-500 text-center">
                Active days earn qualifying streak marks & rankings credibility.
              </p>
            </Card>

            {/* Batch Leaderboard Preview (Reference 3 Leaderboard table) */}
            <Card className="border-slate-200/80 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900">Batch {batch} Leaders</h4>
                </div>
                <Link
                  href="/rankings"
                  className="text-xs font-semibold text-purple-700 hover:underline"
                >
                  <span className="inline-flex items-center gap-1">
                    Full Board
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">{RANKING_RULES.description}</p>

              <div className="space-y-2.5">
                {batchPreview.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-3">
                    No batch rankings logged yet. Solve problems to lead!
                  </p>
                )}
                {batchPreview.map((r) => {
                  return (
                    <div
                      key={r.userId}
                      className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <RankBadge rank={r.rank} size="sm" />
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                          {r.displayName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 tabular-nums">
                          {r.score}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" size="sm" className="mt-4 w-full text-xs font-semibold" asChild>
                <Link href="/rankings">View All Rankings</Link>
              </Button>
            </Card>

            {/* Quick Beta Feedback Callout */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold mb-1">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span>Found a bug or issue?</span>
              </div>
              <p className="text-indigo-800/80 leading-relaxed mb-3">
                Help us polish SAIT DSA before the campus-wide launch. Share your feedback in 10 seconds.
              </p>
              <Button size="sm" variant="outline" className="w-full bg-white text-indigo-700" asChild>
                <Link href="/settings">Report Feedback</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
