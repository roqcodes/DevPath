import type { EngineEvent, EngineState, ReviewCard, ReviewGrade } from "../types";
import { addDaysKey, todayKey } from "./dates";

function scheduleFromGrade(card: ReviewCard, grade: ReviewGrade): ReviewCard {
  let ease = card.ease;
  let interval = card.intervalDays;
  let reps = card.reps;
  let lapses = card.lapses;

  if (grade === "again") {
    lapses += 1;
    reps = 0;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
  } else {
    reps += 1;
    if (grade === "hard") {
      ease = Math.max(1.3, ease - 0.05);
      interval = Math.max(1, Math.round(interval * 1.2) || 1);
    } else if (grade === "good") {
      interval = Math.max(1, Math.round(interval * ease) || 1);
    } else {
      ease += 0.1;
      interval = Math.max(2, Math.round(interval * ease * 1.3) || 2);
    }
  }

  const dueAt = addDaysKey(todayKey(), interval);
  return {
    ...card,
    ease,
    intervalDays: interval,
    reps,
    lapses,
    dueAt: `${dueAt}T12:00:00.000Z`,
  };
}

function upsertCard(queue: ReviewCard[], card: ReviewCard): ReviewCard[] {
  const idx = queue.findIndex((c) => c.id === card.id);
  if (idx === -1) return [...queue, card];
  const next = [...queue];
  next[idx] = card;
  return next;
}

export function applyReviewEvent(state: EngineState, event: EngineEvent): EngineState {
  if (event.type === "review_graded") {
    const existing = state.reviewQueue.find((c) => c.id === event.cardId);
    if (!existing) return state;
    const updated = scheduleFromGrade(existing, event.grade);
    return { ...state, reviewQueue: upsertCard(state.reviewQueue, updated) };
  }

  if (event.type === "quiz_answered" && !event.correct && event.topic) {
    const id = `quiz_${event.itemId}`;
    if (state.reviewQueue.some((c) => c.id === id)) return state;
    const card: ReviewCard = {
      id,
      front: event.prompt ?? `Review: ${event.topic}`,
      back: `Topic: ${event.topic}`,
      topic: event.topic,
      ease: 2.5,
      intervalDays: 0,
      dueAt: `${todayKey()}T12:00:00.000Z`,
      reps: 0,
      lapses: 0,
    };
    return { ...state, reviewQueue: [...state.reviewQueue, card] };
  }

  if (event.type === "lesson_completed") {
    const id = `lesson_${event.lessonId}`;
    if (state.reviewQueue.some((c) => c.id === id)) return state;
    const title = event.title ?? event.lessonId;
    const card: ReviewCard = {
      id,
      front: `What was the key idea in “${title}”?`,
      back: "Revisit the lesson summary and explain it in your own words.",
      topic: event.moduleSlug,
      sourceHref: event.moduleSlug ? `/learn/${event.moduleSlug}` : undefined,
      ease: 2.5,
      intervalDays: 1,
      dueAt: `${addDaysKey(todayKey(), 1)}T12:00:00.000Z`,
      reps: 0,
      lapses: 0,
    };
    return { ...state, reviewQueue: [...state.reviewQueue, card] };
  }

  return state;
}

export function dueCards(queue: ReviewCard[], now = new Date()): ReviewCard[] {
  const t = now.getTime();
  return queue.filter((c) => new Date(c.dueAt).getTime() <= t);
}
