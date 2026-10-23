"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lock, Map } from "lucide-react";
import {
  DSA_SYLLABUS,
  getNextIncompleteLesson,
  isModuleLocked,
  moduleProgress,
} from "@/lib/curriculum";
import { useApp } from "@/lib/context/app-context";
import { useEngine } from "@/lib/engine";
import { CompanionAvatar, askCompanion } from "@/components/companion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const UNLOCK_KEY = "devpath_path_unlocks_v1";

type NodeState = "locked" | "available" | "progress" | "current" | "mastered";

function loadUnlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveUnlocked(ids: Set<string>) {
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export function PathMap() {
  const { state } = useApp();
  const engine = useEngine();
  const completed = state.progress.completedLessons;
  const next = getNextIncompleteLesson(completed);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<Set<string>>(new Set());
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const unlockedNow = useMemo(() => {
    return DSA_SYLLABUS.filter((m) => !isModuleLocked(m.slug, completed)).map((m) => m.slug);
  }, [completed]);

  useEffect(() => {
    const seen = loadUnlocked();
    const fresh = unlockedNow.filter((id) => !seen.has(id));
    if (fresh.length) {
      setNewUnlocks(new Set(fresh));
      saveUnlocked(new Set([...seen, ...unlockedNow]));
      const t = window.setTimeout(() => setNewUnlocks(new Set()), 1200);
      return () => window.clearTimeout(t);
    }
    saveUnlocked(new Set([...seen, ...unlockedNow]));
  }, [unlockedNow]);

  const moduleState = useCallback(
    (slug: string): NodeState => {
      const mod = DSA_SYLLABUS.find((m) => m.slug === slug);
      if (!mod) return "locked";
      if (isModuleLocked(slug, completed)) return "locked";
      const pct = moduleProgress(slug, completed);
      if (pct === 100) return "mastered";
      if (next?.moduleSlug === slug) return "current";
      if (pct > 0) return "progress";
      return "available";
    },
    [completed, next]
  );

  const focusNode = (index: number) => {
    nodeRefs.current[index]?.focus();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      const active = document.activeElement;
      const idx = nodeRefs.current.findIndex((el) => el === active);
      if (idx === -1) return;
      e.preventDefault();
      if (e.key === "ArrowDown") focusNode(Math.min(idx + 1, DSA_SYLLABUS.length - 1));
      if (e.key === "ArrowUp") focusNode(Math.max(idx - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sheetMod = sheet ? DSA_SYLLABUS.find((m) => m.slug === sheet) : null;

  return (
    <div className="relative h-full min-h-0 overflow-y-auto overscroll-contain pb-4 pr-1">
      {engine.onboarding?.goal && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
          <Map className="h-3.5 w-3.5" aria-hidden />
          Your path for: {engine.onboarding.goal}
        </div>
      )}

      <div className="relative mx-auto max-w-md">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-indigo-200"
          aria-hidden
          preserveAspectRatio="none"
        >
          {DSA_SYLLABUS.map((_, i) => {
            if (i === 0) return null;
            const x1 = i % 2 === 0 ? 28 : 72;
            const x2 = (i - 1) % 2 === 0 ? 28 : 72;
            const y1 = (i - 1) * 88 + 44;
            const y2 = i * 88 + 44;
            return (
              <line
                key={i}
                x1={`${x1}%`}
                y1={y1}
                x2={`${x2}%`}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        <ol className="relative space-y-6 py-4" aria-label="Curriculum path">
          {DSA_SYLLABUS.map((mod, i) => {
            const st = moduleState(mod.slug);
            const pct = moduleProgress(mod.slug, completed);
            const zig = i % 2 === 0 ? "ml-0 mr-auto" : "ml-auto mr-0";
            const isCurrent = st === "current";

            return (
              <li key={mod.slug} className={cn("relative flex w-[58%]", zig)}>
                <button
                  type="button"
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  onClick={() => {
                    setSheet(mod.slug);
                    setExpanded(expanded === mod.slug ? null : mod.slug);
                  }}
                  className={cn(
                    "group relative w-full rounded-2xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    st === "locked" && "border-slate-200 bg-slate-50 text-slate-500",
                    st === "available" && "border-indigo-200 bg-white hover:border-indigo-400 shadow-xs",
                    st === "progress" && "border-indigo-300 bg-indigo-50/50 ring-2 ring-indigo-200/60",
                    st === "current" && "border-cyan-400 bg-white shadow-md ring-2 ring-cyan-300/70",
                    st === "mastered" && "border-emerald-300 bg-emerald-50/60"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {newUnlocks.has(mod.slug) && (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl m-unlock" aria-hidden />
                  )}
                  <div className="flex items-start gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-mono text-xs font-bold text-indigo-700">
                      {mod.sortOrder}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{mod.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{mod.estimatedHours}h · {mod.lessons.length} lessons</p>
                      {st === "progress" && (
                        <Progress value={pct} size="sm" className="mt-2" />
                      )}
                    </div>
                    {st === "locked" && <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
                    {st === "mastered" && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />}
                  </div>
                  {isCurrent && (
                    <CompanionAvatar
                      mood="focused"
                      size={32}
                      className="absolute -right-3 -top-3 ring-2 ring-white rounded-xl shadow-sm m-float"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {sheetMod && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-[2px]"
          role="dialog"
          aria-label={`${sheetMod.title} details`}
          onClick={() => setSheet(null)}
        >
          <div
            className="h-full w-full max-w-sm bg-white shadow-xl p-5 overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">{sheetMod.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{sheetMod.description}</p>
            <div className="mt-4 space-y-2">
              {sheetMod.lessons.map((l) => {
                const done = completed.includes(l.id);
                const locked = isModuleLocked(sheetMod.slug, completed);
                return (
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <span className={cn(done && "text-emerald-700")}>{l.title}</span>
                    {done ? (
                      <Check className="h-4 w-4 text-emerald-600" aria-label="Done" />
                    ) : locked ? (
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <Link
                        href={`/learn/${sheetMod.slug}/${l.slug}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {!isModuleLocked(sheetMod.slug, completed) && (
                <Button asChild>
                  <Link
                    href={`/learn/${sheetMod.slug}/${
                      sheetMod.lessons.find((l) => !completed.includes(l.id))?.slug ?? sheetMod.lessons[0]?.slug
                    }`}
                  >
                    {moduleProgress(sheetMod.slug, completed) > 0 ? "Continue track" : "Start track"}
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  askCompanion(`What should I focus on in ${sheetMod.title}?`, {
                    surface: "path",
                    subject: sheetMod.title,
                  })
                }
              >
                Ask Kip about this
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSheet(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
