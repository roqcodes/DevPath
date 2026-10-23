"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Copy, Download, Pause, Play, Share2 } from "lucide-react";
import { CompanionAvatar } from "@/components/companion";
import { CountUp } from "@/components/motion";
import { toast } from "@/components/ui/toast";
import { useEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { computeWrapped, hasEnoughData, sampleEngineState, type WrappedStats } from "./stats";
import { drawShareCard, shareSummary } from "./share-card";

const SLIDE_MS = 6500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function Wrapped() {
  const engine = useEngine();
  const enough = hasEnoughData(engine);
  const [sample, setSample] = useState(false);
  const useSample = sample;
  const stats = useMemo(
    () => (useSample ? computeWrapped(sampleEngineState(engine), true) : computeWrapped(engine)),
    [engine, useSample]
  );
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const autoOn = auto && !reduced;
  const toggleSample = (on: boolean) => {
    setSample(on);
    setIdx(0);
  };

  const slides = useMemo(() => buildSlides(stats), [stats]);
  const last = slides.length - 1;
  const go = useCallback((d: number) => setIdx((i) => Math.max(0, Math.min(last, i + d))), [last]);

  useEffect(() => {
    if (!autoOn || idx >= last) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [autoOn, idx, last, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const interactive = el?.closest("button, a, input, textarea, select");
      if (e.key === "ArrowRight" || (e.key === " " && !interactive)) {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const empty = !enough && !useSample;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:gap-3">
      <WrappedStyles />
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 md:pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">DevPath Wrapped</p>
          <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg md:text-xl">
            Your learning, in six slides
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(!enough || sample) && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 md:px-3 md:text-xs">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-indigo-600"
                checked={sample}
                onChange={(e) => toggleSample(e.target.checked)}
              />
              Preview sample data
            </label>
          )}
          {!reduced && !empty && (
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:px-3 md:text-xs"
            >
              {auto ? <Pause className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
              {auto ? "Auto-play on" : "Auto-play off"}
            </button>
          )}
        </div>
      </header>

      {useSample && (
        <p className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900 text-justify ring-1 ring-amber-200 md:text-xs">
          Sample data — a made-up learner so you can see how Wrapped works. None of these numbers are yours.
        </p>
      )}

      {empty ? (
        <EmptyState onSample={() => toggleSample(true)} />
      ) : (
        <section
          aria-roledescription="carousel"
          aria-label="DevPath Wrapped story"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 via-indigo-950 to-slate-950 text-white shadow-lg shadow-indigo-950/25 md:rounded-3xl"
        >
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />

          <div className="absolute inset-x-4 top-3 z-20 flex gap-1.5 md:inset-x-8 md:top-5" aria-hidden>
            {slides.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  key={`${i}-${idx}-${autoOn}`}
                  className={cn("h-full w-full origin-left rounded-full bg-white", i === idx && autoOn && idx < last && "wrapped-seg")}
                  style={{
                    transform: `scaleX(${i < idx || (i === idx && (!autoOn || idx === last)) ? 1 : 0})`,
                    animationDuration: `${SLIDE_MS}ms`,
                  }}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            disabled={idx === 0}
            aria-label="Previous slide"
            className="absolute inset-y-0 left-0 z-10 w-1/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 disabled:cursor-default md:w-1/5"
          />
          <button
            type="button"
            onClick={() => go(1)}
            disabled={idx === last}
            aria-label="Next slide"
            className={cn(
              "absolute inset-y-0 right-0 z-10 w-3/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 md:w-4/5",
              idx === last && "pointer-events-none"
            )}
          />

          <div
            key={`${idx}-${useSample}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${slides.length}`}
            aria-live="polite"
            className={cn(
              "wrapped-in relative z-[5] mx-auto flex h-full min-h-0 w-full max-w-4xl flex-1 flex-col px-6 pb-4 pt-11 sm:px-10 sm:pt-14 md:px-14 lg:max-w-5xl lg:px-16 lg:pt-16",
              idx === last && "z-20"
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col justify-center py-2 md:py-4">
              {slides[idx].render(idx === last ? <ShareActions stats={stats} /> : null)}
            </div>
          </div>

          <footer className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-4 py-2.5 text-[11px] text-indigo-200 backdrop-blur-sm md:px-8 md:py-3 md:text-xs">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={idx === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Back
            </button>
            <span className="tabular-nums text-indigo-100">
              {idx + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={idx === last}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}

interface Slide {
  id: string;
  render: (extra: ReactNode) => ReactNode;
}

function Eyebrow({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "amber" }) {
  return <p className={cn("text-[10px] font-bold uppercase tracking-wider", tone === "cyan" ? "text-cyan-300" : "text-amber-300")}>{children}</p>;
}

function buildSlides(s: WrappedStats): Slide[] {
  const maxHeat = Math.max(1, ...s.heat.map((h) => h.xp));
  return [
    {
      id: "intro",
      render: () => (
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <CompanionAvatar mood="excited" size={28} /> devpath
          </div>
          <div>
            <Eyebrow>{s.isSample ? "Sample recap" : "Your recap"}</Eyebrow>
            <h2 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              You showed up.
              <br />
              <span className="text-cyan-300">Here&apos;s the receipt.</span>
            </h2>
            <p className="mt-4 text-xs text-indigo-200 text-justify md:text-sm">Level {s.level} · {s.levelTitle}</p>
          </div>
          <p className="text-[11px] text-indigo-300">Tap the right side to continue</p>
        </div>
      ),
    },
    {
      id: "xp",
      render: () => (
        <div className="flex flex-1 flex-col justify-center">
          <Eyebrow>Total XP earned</Eyebrow>
          <p className="mt-2 text-6xl font-black tabular-nums tracking-tight text-cyan-300 sm:text-7xl md:text-8xl">
            <CountUp value={s.xp} duration={1200} />
          </p>
          <p className="mt-3 max-w-2xl text-sm text-indigo-100 text-justify md:text-base">
            {s.bestDay && s.bestDay.xp > 0
              ? `Your biggest day was ${formatDay(s.bestDay.date)}: ${s.bestDay.xp} XP in one sitting.`
              : "Every lesson, quiz and review added up to this."}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat label="Achievements" value={s.achievements} />
            <MiniStat label="Interview rounds" value={s.interviewRounds} />
          </div>
        </div>
      ),
    },
    {
      id: "streak",
      render: () => (
        <div className="flex flex-1 flex-col justify-center">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Eyebrow>Days active</Eyebrow>
              <p className="mt-1 text-5xl font-black tabular-nums tracking-tight">
                <CountUp value={s.daysActive} />
              </p>
            </div>
            <div>
              <Eyebrow tone="amber">Longest streak</Eyebrow>
              <p className="mt-1 text-5xl font-black tabular-nums tracking-tight text-amber-300">
                <CountUp value={s.longestStreak} />
                <span className="text-2xl">d</span>
              </p>
            </div>
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-indigo-300">Last 12 weeks</p>
          <div className="mt-2 grid grid-flow-col grid-rows-7 gap-1" role="img" aria-label={`Activity heatmap: ${s.heat.filter((h) => h.xp > 0).length} active days in the last 12 weeks`}>
            {s.heat.map((h, i) => (
              <span
                key={h.date}
                title={`${h.date}: ${h.xp} XP`}
                className="wrapped-cell aspect-square rounded-[3px]"
                style={{
                  backgroundColor: h.xp === 0 ? "rgba(255,255,255,0.07)" : `rgba(34,211,238,${0.25 + (h.xp / maxHeat) * 0.75})`,
                  animationDelay: `${i * 6}ms`,
                }}
              />
            ))}
          </div>
          {s.currentStreak > 0 && <p className="mt-4 text-xs text-indigo-200">Current streak: {s.currentStreak} days and counting.</p>}
        </div>
      ),
    },
    {
      id: "topics",
      render: () => (
        <div className="flex flex-1 flex-col justify-center">
          <Eyebrow>Where your time went</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Top topics</h2>
          {s.topTopics.length ? (
            <ol className="mt-6 space-y-3">
              {s.topTopics.map((t, i) => {
                const pct = t.count / s.topTopics[0].count;
                return (
                  <li key={t.name} className="wrapped-row" style={{ animationDelay: `${120 + i * 120}ms` }}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-baseline gap-3">
                        <span className="text-3xl font-black tabular-nums text-white/30">{i + 1}</span>
                        <span className="text-lg font-semibold">{t.name}</span>
                      </span>
                      <span className="text-[11px] tabular-nums text-indigo-300">{t.count} sessions</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ transform: `scaleX(${pct})` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-indigo-200">Not enough topic history yet. Finish a few lessons and this fills in.</p>
          )}
        </div>
      ),
    },
    {
      id: "archetype",
      render: () => (
        <div className="flex flex-1 flex-col justify-center">
          <Eyebrow tone="amber">Your learning archetype</Eyebrow>
          <h2 className="mt-2 text-4xl font-black leading-[1.05] tracking-tight">{s.archetype.name}</h2>
          <p className="mt-3 max-w-2xl text-sm text-indigo-100 text-justify md:text-base">{s.archetype.line}</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur md:mt-8">
            <CompanionAvatar mood="proud" size={36} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Kip&apos;s verdict</p>
              <p className="mt-1 text-sm leading-relaxed text-justify md:text-base">{s.verdict}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "share",
      render: (extra) => (
        <div className="flex flex-1 flex-col">
          <Eyebrow>Share card</Eyebrow>
          <div className="mt-3 flex-1 rounded-2xl border border-white/15 bg-white/[0.06] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Archetype</p>
            <p className="text-lg font-black leading-tight">{s.archetype.name}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="XP" value={s.xp} tone="cyan" />
              <MiniStat label="Days" value={s.daysActive} />
              <MiniStat label="Streak" value={s.longestStreak} tone="amber" suffix="d" />
              <MiniStat label="Top topic" text={s.topTopics[0]?.name ?? "—"} />
            </div>
          </div>
          <div className="relative z-20 mt-4">{extra}</div>
        </div>
      ),
    },
  ];
}

function MiniStat({ label, value, text, tone, suffix }: { label: string; value?: number; text?: string; tone?: "cyan" | "amber"; suffix?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.07] p-2.5 ring-1 ring-white/10">
      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">{label}</p>
      <p className={cn("truncate text-lg font-bold tabular-nums", tone === "cyan" ? "text-cyan-300" : tone === "amber" ? "text-amber-300" : "text-white")}>
        {text ?? (
          <>
            <CountUp value={value ?? 0} />
            {suffix}
          </>
        )}
      </p>
    </div>
  );
}

function ShareActions({ stats }: { stats: WrappedStats }) {
  const [busy, setBusy] = useState(false);

  const render = async (): Promise<Blob | null> => {
    const canvas = document.createElement("canvas");
    const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    if (document.fonts?.ready) await document.fonts.ready;
    drawShareCard(canvas, stats, family);
    return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
  };

  const download = async () => {
    setBusy(true);
    try {
      const blob = await render();
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = stats.isSample ? "devpath-wrapped-sample.png" : "devpath-wrapped.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast({ title: "Share card downloaded", tone: "success" });
    } catch {
      toast({ title: "Couldn't render the card", description: "Your browser blocked canvas export.", tone: "warning" });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareSummary(stats));
      toast({ title: "Summary copied", tone: "success" });
    } catch {
      toast({ title: "Clipboard unavailable", tone: "warning" });
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const blob = await render();
      const text = shareSummary(stats);
      if (blob) {
        const file = new File([blob], "devpath-wrapped.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "My DevPath Wrapped", text });
          return;
        }
      }
      await navigator.share({ title: "My DevPath Wrapped", text });
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  };

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const btn =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-[transform,opacity] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 disabled:opacity-50";
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={download} disabled={busy} className={cn(btn, "col-span-2 bg-white text-indigo-950 hover:opacity-95")}>
        <Download className="h-3.5 w-3.5" aria-hidden /> Download PNG
      </button>
      <button type="button" onClick={copy} className={cn(btn, "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15", !canShare && "col-span-2")}>
        <Copy className="h-3.5 w-3.5" aria-hidden /> Copy summary
      </button>
      {canShare && (
        <button type="button" onClick={share} disabled={busy} className={cn(btn, "bg-cyan-400 text-indigo-950 hover:opacity-95")}>
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
        </button>
      )}
    </div>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 px-6 py-10 text-center text-white md:rounded-3xl md:px-12">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative z-10 flex max-w-lg flex-col items-center">
      <div className="flex justify-center">
        <CompanionAvatar mood="sleepy" size={64} />
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight md:text-2xl">Not much to wrap yet</h2>
      <p className="mt-2 text-sm leading-relaxed text-indigo-200 text-justify md:text-base">
        Kip needs a few days of activity before this recap says anything honest about you.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSample}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-xs font-semibold text-indigo-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
        >
          Preview with sample data
        </button>
        <Link
          href="/learn"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          Start a lesson
        </Link>
      </div>
      </div>
    </div>
  );
}

function formatDay(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function WrappedStyles() {
  return (
    <style>{`
@media (prefers-reduced-motion: no-preference) {
  @keyframes wrapped-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
  @keyframes wrapped-seg { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes wrapped-pop { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
  .wrapped-in { animation: wrapped-in 420ms cubic-bezier(0.16,1,0.3,1) both; }
  .wrapped-seg { animation-name: wrapped-seg; animation-timing-function: linear; animation-fill-mode: forwards; }
  .wrapped-cell { animation: wrapped-pop 320ms cubic-bezier(0.16,1,0.3,1) both; }
  .wrapped-row { animation: wrapped-in 420ms cubic-bezier(0.16,1,0.3,1) both; }
}
`}</style>
  );
}
