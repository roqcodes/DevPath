"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dispatchEngine, updateEngine, useEngine, type ReviewGrade } from "@/lib/engine";
import { dueCards as engineDueCards } from "@/lib/engine/rules/review";
import { CompanionAvatar } from "@/components/companion";
import { CountUp, celebrate } from "@/components/motion";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { foundationSeedCards } from "./review-seeds";
import { nextDueAt } from "./review-schedule";
import { cn } from "@/lib/utils";

const GRADES: { grade: ReviewGrade; label: string; key: string; className: string }[] = [
  { grade: "again", label: "Again", key: "1", className: "border-rose-200 bg-rose-50/80 text-rose-900 hover:bg-rose-100" },
  { grade: "hard", label: "Hard", key: "2", className: "border-amber-200 bg-amber-50/80 text-amber-950 hover:bg-amber-100" },
  { grade: "good", label: "Good", key: "3", className: "border-indigo-200 bg-indigo-50/80 text-indigo-950 hover:bg-indigo-100" },
  { grade: "easy", label: "Easy", key: "4", className: "border-emerald-200 bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100" },
];

function SessionPanel({
  total,
  progressPct,
  graded,
  nextDue,
  sessionDone,
  hasCard,
}: {
  total: number;
  progressPct: number;
  graded: number;
  nextDue: Date | null;
  sessionDone: boolean;
  hasCard: boolean;
}) {
  return (
    <aside className="hidden min-h-0 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:flex md:p-4">
      <div className="shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This session</p>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold tabular-nums text-slate-900">{total}</p>
          <span className="text-[11px] font-medium text-slate-500">due</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Progress</span>
            <span className="tabular-nums font-medium text-slate-700">{progressPct}%</span>
          </div>
          <Progress value={progressPct} size="sm" />
        </div>
        {graded > 0 && (
          <p className="mt-1.5 text-[11px] text-slate-500">
            Graded <span className="font-semibold tabular-nums text-slate-800">{graded}</span>
          </p>
        )}
      </div>
      {nextDue && !sessionDone && hasCard && (
        <p className="shrink-0 text-[11px] leading-snug text-slate-500 line-clamp-2">
          Next after batch:{" "}
          <span className="font-medium text-slate-700">
            {nextDue.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
          </span>
        </p>
      )}
      <p className="mt-auto shrink-0 rounded-xl border border-indigo-100/80 bg-indigo-50/40 px-2.5 py-2 text-[11px] leading-snug text-slate-600">
        Grade honestly — that schedules your next review.
      </p>
    </aside>
  );
}

export function ReviewSession({ className }: { className?: string }) {
  const engine = useEngine();
  const reduced = useReducedMotion();
  const [showBack, setShowBack] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [graded, setGraded] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    updateEngine((s) => {
      if (s.reviewQueue.length > 0) return s;
      const seeds = foundationSeedCards();
      return { ...s, reviewQueue: seeds };
    });
  }, []);

  const queue = useMemo(() => engineDueCards(engine.reviewQueue), [engine.reviewQueue]);
  const card = queue[0];
  const total = queue.length;
  const progressPct = total ? Math.round((graded / Math.max(graded + total, 1)) * 100) : 100;

  const revealAnswer = useCallback(() => {
    setShowBack(true);
    setFlip(true);
  }, []);

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!card) return;
      dispatchEngine({ type: "review_graded", cardId: card.id, grade: g });
      setGraded((n) => n + 1);
      setShowBack(false);
      setFlip(false);
      if (queue.length <= 1) {
        celebrate({ kind: "small" });
        setSessionDone(true);
      }
    },
    [card, queue.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sessionDone || !card) return;
      if (e.key === " " && !showBack) {
        e.preventDefault();
        revealAnswer();
        return;
      }
      const match = GRADES.find((g) => g.key === e.key);
      if (match && showBack) grade(match.grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, showBack, sessionDone, grade, revealAnswer]);

  const nextDue = nextDueAt(engine.reviewQueue);

  const shell = "grid min-h-0 flex-1 gap-3 overflow-hidden md:grid-cols-[minmax(0,1fr)_220px] md:gap-4 lg:grid-cols-[minmax(0,1fr)_252px]";

  const sessionPanel = (
    <SessionPanel
      total={total}
      progressPct={progressPct}
      graded={graded}
      nextDue={nextDue}
      sessionDone={sessionDone}
      hasCard={Boolean(card)}
    />
  );

  if (sessionDone) {
    return (
      <div className={cn(shell, className)}>
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-white px-4 text-center shadow-sm">
          <CompanionAvatar mood="proud" size={52} className="mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Session complete</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            You graded <CountUp value={graded} className="font-bold text-emerald-700" /> cards.
          </p>
          <Button asChild variant="default" className="mt-5" size="sm">
            <Link href="/learn">Back to syllabus</Link>
          </Button>
        </div>
        {sessionPanel}
      </div>
    );
  }

  if (!card) {
    return (
      <div className={cn(shell, className)}>
        <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 text-center shadow-sm">
          <CompanionAvatar mood="sleepy" size={48} className="mx-auto" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">All caught up</h2>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            {nextDue
              ? `Next card due ${nextDue.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
              : "No review cards yet — complete a lesson first."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/path">See your path</Link>
          </Button>
        </div>
        {sessionPanel}
      </div>
    );
  }

  return (
    <div className={cn(shell, className)}>
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-indigo-100/90 bg-white shadow-md shadow-indigo-950/5 transition-transform duration-300",
          !reduced && flip && "m-pop"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 md:px-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">{card.topic}</p>
          <p className="text-[11px] font-medium tabular-nums text-slate-500 md:hidden">
            {total} due · {progressPct}%
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5">
          {!showBack ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                <p className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl lg:text-2xl">
                  {card.front}
                </p>
              </div>
              <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <Button type="button" className="h-10 rounded-xl px-6 font-semibold" onClick={revealAnswer}>
                  Show answer
                </Button>
                <p className="text-[11px] text-slate-500">Answer in your head first.</p>
              </div>
            </>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answer</p>
                <p className="text-sm leading-relaxed text-slate-800 sm:text-base">{card.back}</p>
                {card.sourceHref && (
                  <Link
                    href={card.sourceHref}
                    className="inline-flex text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Revisit lesson
                  </Link>
                )}
              </div>
              <div className="mt-3 shrink-0 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your recall</p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="group" aria-label="Grade recall">
                  {GRADES.map((g) => (
                    <Button
                      key={g.grade}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("h-9 rounded-lg text-xs font-semibold", g.className)}
                      onClick={() => grade(g.grade)}
                    >
                      {g.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {sessionPanel}
    </div>
  );
}
