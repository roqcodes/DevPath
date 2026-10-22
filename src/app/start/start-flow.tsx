"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, Target } from "lucide-react";
import { CompanionAvatar, type CompanionMood } from "@/components/companion";
import { celebrate } from "@/components/motion";
import { useApp } from "@/lib/context/app-context";
import { dispatchEngine, getEngineState, useEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { buildPath, type Goal, type Language, type Level, type PersonalPath, type StartAnswers } from "./build-path";

interface Question<K extends keyof StartAnswers> {
  key: K;
  kip: string;
  title: string;
  options: { value: StartAnswers[K]; label: string; sub: string }[];
}

const QUESTIONS: [Question<"goal">, Question<"level">, Question<"minutesPerDay">, Question<"language">] = [
  {
    key: "goal",
    kip: "First, what are we training for?",
    title: "What's your goal?",
    options: [
      { value: "placement" as Goal, label: "Crack placement interviews", sub: "Patterns, timed rounds, mock interviews" },
      { value: "coursework" as Goal, label: "Ace my DSA coursework", sub: "Exam staples, clear explanations" },
      { value: "competitive" as Goal, label: "Get into competitive programming", sub: "Graphs, greedy, DP depth" },
      { value: "general" as Goal, label: "Just get better at problem solving", sub: "A steady, well-rounded path" },
    ],
  },
  {
    key: "level",
    kip: "No wrong answers. I'll skip what you already know.",
    title: "Where are you right now?",
    options: [
      { value: "new" as Level, label: "New to DSA", sub: "Start from loops and arrays" },
      { value: "basics" as Level, label: "Know the basics", sub: "Arrays, maybe some hashing" },
      { value: "comfortable" as Level, label: "Comfortable, want depth", sub: "Trees, graphs, DP" },
    ],
  },
  {
    key: "minutesPerDay",
    kip: "Small and daily beats big and rare. Pick what you'll actually do.",
    title: "How much time per day?",
    options: [
      { value: 5, label: "5 minutes", sub: "One concept, one check" },
      { value: 10, label: "10 minutes", sub: "A lesson section a day" },
      { value: 20, label: "20 minutes", sub: "Lesson plus practice" },
      { value: 30, label: "30+ minutes", sub: "Serious momentum" },
    ],
  },
  {
    key: "language",
    kip: "Last one. Which language should code examples use?",
    title: "Preferred language",
    options: [
      { value: "python" as Language, label: "Python", sub: "Readable, great for interviews" },
      { value: "java" as Language, label: "Java", sub: "Common in coursework" },
      { value: "cpp" as Language, label: "C++", sub: "The contest standard" },
      { value: "javascript" as Language, label: "JavaScript", sub: "If you live in the browser" },
    ],
  },
];

type Phase = "intro" | "ask" | "thinking" | "ready";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function fetchAiPath(answers: StartAnswers, signal: AbortSignal): Promise<Partial<PersonalPath> | null> {
  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "path", context: { surface: "start", detail: JSON.stringify(answers) } }),
      signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      source?: string;
      data?: { title?: string; summary?: string; steps?: { title?: string; why?: string; minutes?: number }[] };
    };
    if (!json?.data || json.source === "fallback") return null;
    return { title: json.data.title, summary: json.data.summary, steps: json.data.steps as PersonalPath["steps"] };
  } catch {
    return null;
  }
}

function mergeAi(local: PersonalPath, ai: Partial<PersonalPath> | null): PersonalPath {
  if (!ai) return local;
  return {
    ...local,
    title: typeof ai.title === "string" && ai.title.length < 80 ? ai.title : local.title,
    summary: typeof ai.summary === "string" && ai.summary.length < 240 ? ai.summary : local.summary,
    steps: local.steps.map((s, i) => {
      const w = ai.steps?.[i]?.why;
      return typeof w === "string" && w.length > 10 && w.length < 200 ? { ...s, why: w } : s;
    }),
  };
}

export function StartFlow() {
  const { updateUser } = useApp();
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<StartAnswers>>({});
  const [path, setPath] = useState<PersonalPath | null>(null);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const committed = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipThinking = useRef<(() => void) | null>(null);

  useEffect(() => {
    setAlreadyOnboarded(!!getEngineState().onboarding);
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase, step]);

  const finish = useCallback(
    (full: StartAnswers) => {
      const local = buildPath(full);
      setPhase("thinking");
      const ctrl = new AbortController();
      let done = false;
      const reveal = (p: PersonalPath) => {
        if (done) return;
        done = true;
        ctrl.abort();
        skipThinking.current = null;
        setPath(p);
        setPhase("ready");
      };
      skipThinking.current = () => reveal(local);
      if (prefersReducedMotion()) {
        reveal(local);
        return;
      }
      const minBeat = new Promise((r) => setTimeout(r, 1400));
      const cap = new Promise<null>((r) => setTimeout(() => r(null), 2600));
      const ai = Promise.race([fetchAiPath(full, ctrl.signal), cap]);
      Promise.all([minBeat, ai]).then(([, aiPath]) => reveal(mergeAi(local, aiPath)));
    },
    []
  );

  useEffect(() => {
    if (phase !== "ready" || !path || committed.current) return;
    committed.current = true;
    const a = answers as StartAnswers;
    dispatchEngine({ type: "onboarding_completed", goal: a.goal, level: a.level, minutesPerDay: a.minutesPerDay });
    updateUser({ preferredLanguage: a.language });
    celebrate({ kind: "big" });
  }, [phase, path, answers, updateUser]);

  const choose = useCallback(
    (value: StartAnswers[keyof StartAnswers]) => {
      const q = QUESTIONS[step];
      const next = { ...answers, [q.key]: value } as Partial<StartAnswers>;
      setAnswers(next);
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else finish(next as StartAnswers);
    },
    [answers, step, finish]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (phase === "intro" && e.key === "Enter" && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
        setPhase("ask");
        return;
      }
      if (phase === "thinking" && (e.key === "Enter" || e.key === " " || e.key === "Escape")) {
        e.preventDefault();
        skipThinking.current?.();
        return;
      }
      if (phase !== "ask") return;
      const n = Number(e.key);
      const opts = QUESTIONS[step].options;
      if (n >= 1 && n <= opts.length) {
        e.preventDefault();
        choose(opts[n - 1].value);
      } else if (e.key === "Backspace" && step > 0) {
        e.preventDefault();
        setStep(step - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, step, choose]);

  const mood: CompanionMood =
    phase === "thinking" ? "thinking" : phase === "ready" ? "proud" : phase === "intro" ? "excited" : "focused";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-sm font-bold tracking-tight text-white/90 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          DevPath
        </Link>
        {phase === "ask" && (
          <div className="flex items-center gap-1.5" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
            {QUESTIONS.map((q, i) => (
              <span
                key={q.key}
                className={cn("h-1.5 rounded-full transition-all duration-300", i <= step ? "w-6 bg-cyan-300" : "w-3 bg-white/20")}
              />
            ))}
          </div>
        )}
        <Link
          href={alreadyOnboarded ? "/dashboard" : "/login"}
          className="rounded text-xs font-medium text-indigo-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          {alreadyOnboarded ? "Back to Today" : "I have an account"}
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-10 pt-4 sm:px-8 sm:pt-10">
        <div aria-live="polite" className="sr-only">
          {phase === "thinking" ? "Building your path" : phase === "ready" ? "Your path is ready" : ""}
        </div>

        {phase === "intro" && (
          <section className="flex flex-1 flex-col items-center justify-center text-center motion-safe:animate-fade-in">
            <CompanionAvatar mood={mood} size={96} />
            <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-cyan-300">Hi, I&apos;m Kip</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-bold tracking-tight focus:outline-none sm:text-4xl">
              Four quick questions, then your path.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-indigo-200/90">
              I&apos;ll build a DSA route that fits your goal and your schedule. No signup, takes about 30 seconds.
            </p>
            <button
              type="button"
              onClick={() => setPhase("ask")}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-indigo-950 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60 motion-reduce:transition-none"
            >
              Let&apos;s go <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="mt-3 text-[11px] text-indigo-300/80">Press Enter to begin</p>
          </section>
        )}

        {phase === "ask" && (
          <section key={step} className="flex flex-1 flex-col motion-safe:animate-fade-in" aria-labelledby="q-title">
            <div className="flex items-start gap-3">
              <CompanionAvatar mood={mood} size={44} className="shrink-0" />
              <p className="mt-1 rounded-2xl rounded-tl-sm border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-indigo-100 backdrop-blur-md">
                {QUESTIONS[step].kip}
              </p>
            </div>
            <h1 id="q-title" ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-bold tracking-tight focus:outline-none sm:text-3xl">
              {QUESTIONS[step].title}
            </h1>
            <p className="mt-1 text-[11px] text-indigo-300/80">
              Tap an option or press {QUESTIONS[step].options.map((_, i) => i + 1).join(", ")}
            </p>
            <div role="radiogroup" aria-labelledby="q-title" className="mt-6 grid gap-3">
              {QUESTIONS[step].options.map((o, i) => {
                const selected = answers[QUESTIONS[step].key] === o.value;
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(o.value)}
                    className={cn(
                      "group flex min-h-16 items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50 motion-reduce:transition-none",
                      selected
                        ? "border-cyan-300/70 bg-white/15"
                        : "border-white/15 bg-white/5 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                        selected ? "bg-cyan-300 text-indigo-950" : "bg-white/10 text-indigo-200 group-hover:bg-white/20"
                      )}
                      aria-hidden
                    >
                      {selected ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{o.label}</span>
                      <span className="text-xs text-indigo-200/80">{o.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="mt-6 inline-flex items-center gap-1.5 self-start rounded text-xs font-medium text-indigo-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
              </button>
            )}
          </section>
        )}

        {phase === "thinking" && (
          <section className="flex flex-1 flex-col items-center justify-center text-center motion-safe:animate-fade-in">
            <CompanionAvatar mood="thinking" size={96} />
            <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-xl font-bold tracking-tight focus:outline-none">
              Reading the map…
            </h1>
            <p className="mt-2 text-sm text-indigo-200/90">Matching 12 modules to your goal and schedule.</p>
            <div className="mt-6 flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-cyan-300 motion-safe:animate-pulse" style={{ animationDelay: `${i * 180}ms` }} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => skipThinking.current?.()}
              className="mt-8 rounded text-xs font-medium text-indigo-300 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Skip
            </button>
          </section>
        )}

        {phase === "ready" && path && (
          <ReadyView path={path} minutesPerDay={(answers as StartAnswers).minutesPerDay} headingRef={headingRef} />
        )}
      </main>
    </div>
  );
}

function ReadyView({
  path,
  minutesPerDay,
  headingRef,
}: {
  path: PersonalPath;
  minutesPerDay: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const goalXp = useEngine().dailyGoalXp;
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex items-center gap-4 motion-safe:animate-fade-in">
        <CompanionAvatar mood="proud" size={64} className="shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{path.title}</p>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight focus:outline-none sm:text-4xl">
            Your path is ready
          </h1>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-indigo-200/90">{path.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold backdrop-blur-md">
          <Target className="h-3.5 w-3.5 text-cyan-300" aria-hidden /> Daily goal: {goalXp} XP
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold backdrop-blur-md">
          <Clock className="h-3.5 w-3.5 text-sky-300" aria-hidden /> {minutesPerDay >= 30 ? "30+" : minutesPerDay} min a day
        </span>
      </div>

      <ol className="relative mt-8 space-y-0" aria-label="Your personalized path">
        {path.steps.map((s, i) => (
          <li
            key={s.moduleSlug}
            className="relative flex gap-4 pb-5 motion-safe:animate-fade-in motion-safe:[animation-fill-mode:both]"
            style={{ animationDelay: `${150 + i * 110}ms` }}
          >
            {i < path.steps.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 bg-gradient-to-b from-cyan-300/60 to-white/10" aria-hidden />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ring-4",
                i === 0 ? "bg-cyan-300 text-indigo-950 ring-cyan-300/25" : "bg-indigo-800 text-indigo-100 ring-white/5"
              )}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-bold text-white">{s.title}</h2>
                <span className="shrink-0 text-[11px] tabular-nums text-indigo-300">
                  {s.minutes >= 60 ? `${Math.floor(s.minutes / 60)}h ${s.minutes % 60 ? `${s.minutes % 60}m` : ""}` : `${s.minutes}m`}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-indigo-200/85">{s.why}</p>
            </div>
          </li>
        ))}
      </ol>

      <div
        className="sticky bottom-0 -mx-5 mt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 sm:static sm:mx-0 sm:bg-none sm:px-0"
      >
        <Link
          href={path.firstLessonHref}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-bold text-indigo-950 shadow-xl transition-transform hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60 motion-reduce:transition-none"
        >
          Start lesson 1 (3 min) <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <p className="mt-2 text-center text-[11px] text-indigo-300/80">
          {path.firstLessonTitle} ·{" "}
          <Link href="/dashboard" className="underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded">
            or look around first
          </Link>
        </p>
      </div>
    </section>
  );
}
