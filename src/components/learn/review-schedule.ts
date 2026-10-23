import type { ReviewCard, ReviewGrade } from "@/lib/engine";

/** SM-2-lite scheduling until progression reducer owns review_graded fully. */
export function scheduleCardAfterGrade(card: ReviewCard, grade: ReviewGrade, now = new Date()): ReviewCard {
  let { ease, intervalDays, reps, lapses } = card;

  if (grade === "again") {
    lapses += 1;
    reps = 0;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (grade === "hard") {
      ease = Math.max(1.3, ease - 0.15);
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2) || 1);
    } else if (grade === "good") {
      intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(intervalDays * ease);
    } else {
      ease += 0.15;
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * ease * 1.3));
    }
  }

  const due = new Date(now);
  due.setDate(due.getDate() + intervalDays);

  return {
    ...card,
    ease,
    intervalDays,
    reps,
    lapses,
    dueAt: due.toISOString(),
  };
}

export function dueCards(queue: ReviewCard[], now = new Date()): ReviewCard[] {
  const t = now.getTime();
  return queue.filter((c) => new Date(c.dueAt).getTime() <= t);
}

export function nextDueAt(queue: ReviewCard[]): Date | null {
  const future = queue
    .map((c) => new Date(c.dueAt).getTime())
    .filter((t) => t > Date.now())
    .sort((a, b) => a - b);
  return future.length ? new Date(future[0]) : null;
}
