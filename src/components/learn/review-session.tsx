"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dispatchEngine, updateEngine, useEngine, type ReviewGrade } from "@/lib/engine";
import { CompanionAvatar, CompanionNote } from "@/components/companion";
import { CountUp, celebrate } from "@/components/motion";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { foundationSeedCards } from "./review-seeds";
import { dueCards, nextDueAt, scheduleCardAfterGrade } from "./review-schedule";
import { cn } from "@/lib/utils";

const GRADES: { grade: ReviewGrade; label: string; key: string }[] = [
  { grade: "again", label: "Again", key: "1" },
  { grade: "hard", label: "Hard", key: "2" },
  { grade: "good", label: "Good", key: "3" },
  { grade: "easy", label: "Easy", key: "4" },
];

export function ReviewSession() {
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

  const queue = useMemo(() => dueCards(engine.reviewQueue), [engine.reviewQueue]);
  const card = queue[0];
  const total = queue.length;
  const progressPct = total ? Math.round((graded / Math.max(graded + total, 1)) * 100) : 100;

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!card) return;
      dispatchEngine({ type: "review_graded", cardId: card.id, grade: g });
      updateEngine((s) => ({
        ...s,
        reviewQueue: s.reviewQueue.map((c) => (c.id === card.id ? scheduleCardAfterGrade(c, g) : c)),
      }));
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
        setShowBack(true);
        setFlip(true);
        return;
      }
      const match = GRADES.find((g) => g.key === e.key);
      if (match && showBack) grade(match.grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, showBack, sessionDone, grade]);

  const nextDue = nextDueAt(engine.reviewQueue);

  if (sessionDone) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-8 text-center space-y-4 animate-fade-in">
        <CompanionAvatar mood="proud" size={56} className="mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Session complete</h2>
        <p className="text-sm text-slate-600">
          You graded <CountUp value={graded} className="font-bold text-emerald-700" /> cards. XP is on its way.
        </p>
        <Button asChild variant="default">
          <Link href="/learn">Back to syllabus</Link>
        </Button>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4">
        <CompanionAvatar mood="sleepy" size={48} className="mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">All caught up</h2>
        <p className="text-sm text-slate-600">
          {nextDue
            ? `Next card due ${nextDue.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
            : "No review cards yet — complete a lesson or visit Review after studying."}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/path">See your path</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{total} due</span>
        <span className="tabular-nums">{progressPct}% session</span>
      </div>
      <Progress value={progressPct} size="sm" />

      <div
        className={cn(
          "relative min-h-[200px] rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition-transform duration-300",
          !reduced && flip && "m-pop"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {!showBack ? (
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">{card.topic}</p>
            <p className="text-lg font-semibold text-slate-900 leading-snug">{card.front}</p>
            <Button type="button" onClick={() => { setShowBack(true); setFlip(true); }}>
              Show answer <span className="text-slate-400 ml-1">(Space)</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">{card.back}</p>
            {card.sourceHref && (
              <Link href={card.sourceHref} className="text-xs text-indigo-600 hover:underline">
                Revisit lesson
              </Link>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2" role="group" aria-label="Grade recall">
              {GRADES.map((g) => (
                <Button
                  key={g.grade}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => grade(g.grade)}
                >
                  {g.label} <span className="text-slate-400 ml-0.5">({g.key})</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <CompanionNote mood="focused" className="text-xs text-slate-500">
        Recall first, then grade honestly — that schedules your next review.
      </CompanionNote>
    </div>
  );
}
