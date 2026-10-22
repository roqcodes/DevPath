"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  getLessonContent,
  getModule,
  getNextLesson,
  getPrevLesson,
  moduleProgress,
  isModuleLocked,
} from "@/lib/curriculum";
import { LearningPanel } from "./learning-panel";
import { LessonPlayground } from "./lesson-playground";
import { LessonTutorPanel } from "./lesson-tutor-panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

type MobilePane = "learn" | "playground" | "guide";

export function DsaLessonWorkspace({
  moduleSlug,
  lessonSlug,
}: {
  moduleSlug: string;
  lessonSlug: string;
}) {
  const { state, recordLessonVisit } = useApp();
  const mod = getModule(moduleSlug);
  const content = getLessonContent(moduleSlug, lessonSlug);
  const [navOpen, setNavOpen] = useState(true);
  const [playH, setPlayH] = useState(38);
  const [mobilePane, setMobilePane] = useState<MobilePane>("learn");

  const locked = isModuleLocked(moduleSlug, state.progress.completedLessons);
  const modPct = moduleProgress(moduleSlug, state.progress.completedLessons);
  const lessonIndex = mod?.lessons.findIndex((l) => l.slug === lessonSlug) ?? -1;
  const lessonDone = content ? state.progress.completedLessons.includes(content.id) : false;
  const prev = getPrevLesson(moduleSlug, lessonSlug);
  const next = getNextLesson(moduleSlug, lessonSlug);

  const lessonId = content?.id;

  useEffect(() => {
    if (!lessonId) return;
    recordLessonVisit(moduleSlug, lessonSlug, lessonId);
  }, [lessonId, moduleSlug, lessonSlug, recordLessonVisit]);

  if (locked) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 mb-4">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Module Locked</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Please complete prerequisite curriculum modules before proceeding with this lesson.
        </p>
        <Button asChild className="mt-6 font-semibold" variant="default">
          <Link href="/learn">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Syllabus
          </Link>
        </Button>
      </div>
    );
  }

  if (!mod || !content) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center animate-fade-in">
        <p className="text-base font-semibold text-slate-800">Lesson Not Found</p>
        <p className="text-xs text-slate-500 mt-1">This module or lesson slug does not exist.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/learn">Back to Syllabus</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/50">
      {/* Top Breadcrumb & Status Bar */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/learn"
            className="font-medium text-slate-500 hover:text-indigo-600 transition-colors hidden sm:inline"
          >
            Learn
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
          <Link
            href={`/learn/${moduleSlug}`}
            className="font-medium text-slate-600 hover:text-indigo-600 truncate max-w-[140px] transition-colors"
          >
            {mod.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-900 truncate">{content.title}</span>

          {lessonDone ? (
            <Badge variant="success" dot className="hidden md:inline-flex text-[11px] ml-1">
              Completed
            </Badge>
          ) : (
            <Badge variant="sky" dot className="hidden md:inline-flex text-[11px] ml-1">
              In Progress
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <span className="text-[11px] font-medium text-slate-500">Module</span>
            <div className="w-20">
              <Progress value={modPct} size="sm" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 tabular-nums">{modPct}%</span>
          </div>

          <div className="flex items-center gap-1">
            {prev && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                title={`Previous: ${prev.lessonSlug}`}
                asChild
              >
                <Link href={`/learn/${prev.moduleSlug}/${prev.lessonSlug}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {next && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                title={`Next: ${next.lessonSlug}`}
                asChild
              >
                <Link href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile pane switcher */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white">
        {(["learn", "playground", "guide"] as MobilePane[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setMobilePane(p)}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold capitalize transition-colors",
              mobilePane === p
                ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/20"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {p === "guide" ? "AI Guide" : p}
          </button>
        ))}
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          className={cn(
            "flex flex-1 min-w-0 min-h-0 flex-col lg:flex-row",
            mobilePane === "guide" ? "hidden lg:flex" : "flex"
          )}
        >
          <div className="flex flex-1 min-h-0 min-w-0">
            {/* Desktop Lesson Drawer */}
            {navOpen && (
              <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-slate-200/80 bg-white overflow-y-auto">
                <div className="px-3.5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Module Lessons
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-indigo-600">
                    {lessonIndex + 1}/{mod.lessons.length}
                  </span>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {mod.lessons.map((l, i) => {
                    const done = state.progress.completedLessons.includes(l.id);
                    const isActive = l.slug === lessonSlug;
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${moduleSlug}/${l.slug}`}
                        className={cn(
                          "group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors",
                          isActive
                            ? "bg-indigo-50 font-bold text-indigo-700"
                            : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900",
                          done && !isActive && "text-slate-500"
                        )}
                      >
                        <span className="truncate pr-1">
                          {i + 1}. {l.title}
                        </span>
                        {done && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="p-3 mt-auto border-t border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700">{modPct}%</span>
                  </div>
                  <Progress value={modPct} size="sm" />
                </div>
              </aside>
            )}

            <div className="flex flex-1 min-w-0 min-h-0 flex-col bg-white">
              {/* Drawer toggle bar */}
              <div className="flex items-center justify-between border-b border-slate-200/80 px-2.5 py-1.5 bg-slate-50/60 shrink-0">
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex h-7 px-2 text-slate-500 hover:text-slate-900"
                    onClick={() => setNavOpen((o) => !o)}
                  >
                    {navOpen ? (
                      <PanelLeftClose className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <PanelLeftOpen className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-[11px]">Syllabus</span>
                  </Button>
                  <span className="text-xs text-slate-500 ml-2">
                    Lesson {lessonIndex + 1} of {mod.lessons.length}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {content.id}
                </div>
              </div>

              {/* Lesson Theory & Visualizer Panel */}
              <div
                className={cn(
                  "min-h-0 flex flex-col overflow-hidden",
                  mobilePane === "playground" ? "hidden lg:flex" : "flex"
                )}
                style={{ flex: `${100 - playH} 1 0%` }}
              >
                <LearningPanel lesson={content} moduleSlug={moduleSlug} />
              </div>

              {/* Interactive Resizer Bar */}
              <div
                className={cn(
                  "min-h-0 flex flex-col border-t border-slate-200/80",
                  mobilePane === "learn" ? "hidden lg:flex" : "flex"
                )}
                style={{ flex: `${playH} 1 0%` }}
              >
                <div
                  className="h-1.5 cursor-row-resize bg-slate-100 hover:bg-indigo-300 transition-colors shrink-0 hidden lg:block"
                  role="separator"
                  aria-orientation="horizontal"
                  title="Drag to resize workspace"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startH = playH;
                    const onMove = (ev: MouseEvent) => {
                      const delta = ev.clientY - startY;
                      const next = Math.min(70, Math.max(20, startH - delta * 0.15));
                      setPlayH(next);
                    };
                    const onUp = () => {
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  }}
                />
                <LessonPlayground lesson={content} moduleSlug={moduleSlug} />
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "w-full lg:w-[min(100%,22rem)] xl:w-80 shrink-0 min-h-0 border-l border-slate-200/80 bg-white",
            mobilePane === "guide" ? "flex" : "hidden lg:flex"
          )}
        >
          <LessonTutorPanel lesson={content} />
        </div>
      </div>
    </div>
  );
}
