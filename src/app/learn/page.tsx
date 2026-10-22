"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Lock, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DSA_SYLLABUS, getNextIncompleteLesson, syllabusProgress } from "@/lib/data/dsa-syllabus";
import { getModule } from "@/lib/curriculum";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import { Map } from "lucide-react";

export default function LearnPage() {
  const { state } = useApp();
  const overall = syllabusProgress(state.progress.completedLessons);
  const totalLessons = DSA_SYLLABUS.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = state.progress.completedLessons.length;

  const next = getNextIncompleteLesson(state.progress.completedLessons);
  const last = state.progress.lastVisitedLesson;
  const continueModuleSlug = last?.moduleSlug ?? next?.moduleSlug;
  const continueLessonSlug = last?.lessonSlug ?? next?.lessonSlug;
  const continueMod = continueModuleSlug ? getModule(continueModuleSlug) : undefined;
  const continueLesson = continueMod?.lessons.find((l) => l.slug === continueLessonSlug);
  const continueHref =
    continueModuleSlug && continueLessonSlug
      ? `/learn/${continueModuleSlug}/${continueLessonSlug}`
      : "/learn/foundations/variables-types";
  const continuePct =
    continueModuleSlug ? Math.round(
      ((continueMod?.lessons.filter((l) => state.progress.completedLessons.includes(l.id)).length ?? 0) /
        Math.max(continueMod?.lessons.length ?? 1, 1)) *
        100
    ) : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Continue + path */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <Card className="border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-cyan-50/30 shadow-sm overflow-hidden">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Continue where you left off
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{continueMod?.title ?? "Programming Foundations"}</p>
                <h2 className="text-lg font-bold text-slate-900 truncate mt-1">
                  {continueLesson?.title ?? "Variables, types, and expressions"}
                </h2>
                <div className="mt-3 max-w-xs">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Track progress</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{continuePct}%</span>
                  </div>
                  <Progress value={continuePct} size="sm" />
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button asChild className="font-semibold group">
                  <Link href={continueHref}>
                    Resume lesson
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href="/path">
                    <Map className="h-3.5 w-3.5" aria-hidden />
                    See your map
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Button asChild variant="outline" size="sm" className="h-fit self-start lg:self-center">
            <Link href="/review">Review due cards</Link>
          </Button>
        </div>

        {/* Header Hero */}
        <div className="flex flex-col gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 p-6 lg:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                  SAIT Official Curriculum
                </span>
                <span className="text-xs font-medium text-slate-500">12 Modules · 89 Lessons</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                DSA Syllabus & Learning Tracks
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                Step-by-step algorithmic concepts with interactive visualizers, complexity breakdowns,
                worked traces, and code playgrounds.
              </p>
            </div>

            {/* Overall Progress Box */}
            <div className="flex shrink-0 flex-col rounded-2xl border border-indigo-200/80 bg-white p-4 shadow-sm sm:w-64">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">Syllabus Mastery</span>
                <span className="font-bold text-indigo-600 tabular-nums">{overall}%</span>
              </div>
              <Progress value={overall} size="sm" />
              <p className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Completed</span>
                <span className="font-semibold text-slate-800">
                  {completedCount} of {totalLessons} lessons
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {DSA_SYLLABUS.map((mod, idx) => {
            const done = mod.lessons.filter((l) =>
              state.progress.completedLessons.includes(l.id)
            ).length;
            const pct = mod.lessons.length ? Math.round((done / mod.lessons.length) * 100) : 0;
            const isCompleted = done === mod.lessons.length && done > 0;
            const locked = mod.prerequisiteModuleIds.some((pre) => {
              const preMod = DSA_SYLLABUS.find((m) => m.id === pre);
              if (!preMod) return false;
              return preMod.lessons.some((l) => !state.progress.completedLessons.includes(l.id));
            });

            return (
              <Card
                key={mod.id}
                className={cn(
                  "hover-lift flex flex-col justify-between border-slate-200/80 bg-white transition-all",
                  locked ? "opacity-75 bg-slate-50/50" : "hover:border-indigo-300"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 ring-1 ring-indigo-200/60">
                        {mod.sortOrder}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 capitalize">
                        {mod.difficultyRange[0]}–{mod.difficultyRange[1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {mod.estimatedHours}h
                      </span>
                      {isCompleted ? (
                        <Badge variant="success" dot className="text-[10px]">
                          Complete
                        </Badge>
                      ) : locked ? (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Lock className="h-2.5 w-2.5" /> Locked
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px]">
                          {pct > 0 ? "In Progress" : "Available"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-slate-900 mt-2">
                    <Link
                      href={locked ? "#" : `/learn/${mod.slug}`}
                      className={cn(
                        "hover:text-indigo-600 transition-colors",
                        locked && "pointer-events-none text-slate-600"
                      )}
                    >
                      {mod.title}
                    </Link>
                  </CardTitle>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                    {mod.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Topic tag chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {mod.topicTags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        {done} of {mod.lessons.length} lessons completed
                      </span>
                      <span className="font-semibold text-slate-800 tabular-nums">{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      size="sm"
                      indicatorClassName={
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-indigo-600 to-indigo-500"
                      }
                    />
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-500">
                      {locked
                        ? "Requires earlier prerequisite tracks"
                        : `${mod.lessons.length} interactive lessons`}
                    </div>
                    {locked ? (
                      <Button size="sm" variant="outline" disabled className="h-8 text-xs gap-1.5">
                        <Lock className="h-3 w-3" /> Locked
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        className="h-8 text-xs font-semibold group"
                        asChild
                      >
                        <Link href={`/learn/${mod.slug}`}>
                          {isCompleted ? "Review Track" : pct > 0 ? "Continue Track" : "Start Track"}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
