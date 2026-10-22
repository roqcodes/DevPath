"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { CompanionAvatar, CompanionNote } from "@/components/companion";
import { celebrate, Reveal } from "@/components/motion";
import { dispatchEngine } from "@/lib/engine";
import { enableDemoCookie, isDemoMode } from "@/lib/auth/demo";
import { cn } from "@/lib/utils";

const START_KEY = "devpath_start_v1";

type StartDraft = {
  goal: string;
  level: string;
  minutes: number;
  complete?: boolean;
};

const GOALS = [
  { id: "campus", label: "Crush campus DSA", detail: "Syllabus + batch rankings" },
  { id: "faang", label: "Interview-ready", detail: "Patterns, arena, spaced review" },
  { id: "curious", label: "Learn for fun", detail: "Short nodes, low pressure" },
];

const LEVELS = [
  { id: "beginner", label: "Starting out", detail: "Arrays, loops, first proofs" },
  { id: "intermediate", label: "Comfortable coding", detail: "Trees, graphs, complexity" },
  { id: "revisit", label: "Revisiting", detail: "Fast placement, fill gaps" },
];

const MINUTES = [15, 25, 45] as const;

function loadDraft(): StartDraft {
  if (typeof window === "undefined") {
    return { goal: "campus", level: "beginner", minutes: 25 };
  }
  try {
    const raw = localStorage.getItem(START_KEY);
    if (raw) return JSON.parse(raw) as StartDraft;
  } catch {
    /* ignore */
  }
  return { goal: "campus", level: "beginner", minutes: 25 };
}

function saveDraft(d: StartDraft) {
  localStorage.setItem(START_KEY, JSON.stringify(d));
}

export default function StartPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<StartDraft>(() => loadDraft());
  const [pathReady, setPathReady] = useState(false);

  useEffect(() => {
    if (!isDemoMode()) enableDemoCookie();
  }, []);

  const update = useCallback((patch: Partial<StartDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      saveDraft(next);
      return next;
    });
  }, []);

  const finish = useCallback(() => {
    dispatchEngine({
      type: "onboarding_completed",
      goal: draft.goal,
      level: draft.level,
      minutesPerDay: draft.minutes,
    });
    celebrate({ kind: "big", origin: { x: 0.5, y: 0.45 } });
    saveDraft({ ...draft, complete: true });
    setPathReady(true);
  }, [draft]);

  const steps = ["Your why", "Your level", "Daily rhythm", "Path ready"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Logo href="/" size="sm" tone="onDark" />
          <Link href="/" className="text-xs text-indigo-200 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 lg:py-14">
        {!pathReady ? (
          <>
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">
                Step {step + 1} of 4
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{steps[step]}</h1>
              <div className="mt-4 flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= step ? "bg-cyan-400" : "bg-white/15"
                    )}
                  />
                ))}
              </div>
            </div>

            {step === 0 && (
              <Reveal className="space-y-3 m-rise">
                <CompanionNote mood="excited" className="mb-4 flex gap-3 text-sm text-indigo-100">
                  I&apos;m Kip. Pick a north star — I&apos;ll tune your path and nudges.
                </CompanionNote>
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => update({ goal: g.id })}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      draft.goal === g.id
                        ? "border-cyan-400/60 bg-cyan-500/10 ring-1 ring-cyan-400/40"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <p className="font-semibold">{g.label}</p>
                    <p className="mt-1 text-xs text-indigo-200/90">{g.detail}</p>
                  </button>
                ))}
              </Reveal>
            )}

            {step === 1 && (
              <Reveal className="space-y-3 m-rise">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => update({ level: l.id })}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      draft.level === l.id
                        ? "border-cyan-400/60 bg-cyan-500/10 ring-1 ring-cyan-400/40"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <p className="font-semibold">{l.label}</p>
                    <p className="mt-1 text-xs text-indigo-200/90">{l.detail}</p>
                  </button>
                ))}
              </Reveal>
            )}

            {step === 2 && (
              <Reveal className="space-y-4 m-rise">
                <p className="text-sm text-indigo-200/90">
                  Honest minutes beat heroic plans. We&apos;ll size daily XP to this.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update({ minutes: m })}
                      className={cn(
                        "rounded-2xl border py-6 text-center font-bold tabular-nums transition-all",
                        draft.minutes === m
                          ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      )}
                    >
                      {m}
                      <span className="block text-[10px] font-medium text-indigo-200/80">min / day</span>
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            {step === 3 && (
              <Reveal className="text-center m-rise">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-cyan-400/40 bg-indigo-900/50 m-unlock m-glow">
                  <GitBranch className="h-12 w-12 text-cyan-300" aria-hidden />
                  <CompanionAvatar mood="proud" size={36} className="absolute -right-2 -bottom-2" />
                </div>
                <h2 className="mt-6 text-xl font-bold">Ready to unlock your path?</h2>
                <p className="mt-2 text-sm text-indigo-200/90 max-w-md mx-auto">
                  One tap seeds your engine, turns on demo mode, and drops you on the map with node zero
                  glowing.
                </p>
                <Button
                  size="lg"
                  className="mt-8 bg-white text-indigo-950 font-bold hover:bg-cyan-50"
                  onClick={finish}
                >
                  <Sparkles className="h-4 w-4" />
                  Light up my path
                </Button>
              </Reveal>
            )}

            <div className="mt-10 flex justify-between">
              <Button
                variant="ghost"
                className="text-indigo-200 hover:text-white hover:bg-white/10"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button
                  className="bg-indigo-500 hover:bg-indigo-400 text-white"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <Reveal className="text-center py-8 m-pop">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
              <Check className="h-3.5 w-3.5" /> Path ready
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">You&apos;re on the graph.</h1>
            <p className="mt-3 text-sm text-indigo-200/90 max-w-md mx-auto">
              Demo mode is on — no Supabase required. Your first node is waiting on the path map.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white text-indigo-950 font-bold" asChild>
                <Link href="/path">
                  Open path map
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </Reveal>
        )}
      </main>
    </div>
  );
}
