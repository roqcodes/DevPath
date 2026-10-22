import type { EngineEvent, StreakState } from "../types";
import { addDaysKey, daysBetween, daysBetweenExclusive, todayKey } from "./dates";

const MAX_ACTIVE_DATES = 120;
const MAX_FREEZES = 2;

function trimActive(dates: string[]): string[] {
  return [...new Set(dates)].sort().slice(-MAX_ACTIVE_DATES);
}

function withActiveDate(streak: StreakState, day: string): StreakState {
  return { ...streak, activeDates: trimActive([...streak.activeDates, day]) };
}

export function isStreakQualifyingEvent(event: EngineEvent): boolean {
  switch (event.type) {
    case "lesson_completed":
    case "onboarding_completed":
    case "interview_round":
    case "review_graded":
      return true;
    case "problem_attempted":
      return event.accepted;
    case "quiz_answered":
      return event.correct;
    case "quiz_finished":
      return event.correct >= Math.ceil(event.total * 0.6);
    default:
      return false;
  }
}

/** Extend streak when the learner completes qualifying practice on `day`. */
export function applyStreakActivity(streak: StreakState, day: string): StreakState {
  if (streak.lastActiveDate === day) {
    return withActiveDate(streak, day);
  }

  if (!streak.lastActiveDate) {
    const current = 1;
    return withActiveDate(
      {
        ...streak,
        current,
        longest: Math.max(streak.longest, current),
        lastActiveDate: day,
      },
      day
    );
  }

  const gap = daysBetween(streak.lastActiveDate, day);
  if (gap <= 0) {
    return withActiveDate({ ...streak, lastActiveDate: day }, day);
  }

  if (gap === 1) {
    const current = streak.current + 1;
    return withActiveDate(
      {
        ...streak,
        current,
        longest: Math.max(streak.longest, current),
        lastActiveDate: day,
      },
      day
    );
  }

  const bridge = daysBetweenExclusive(streak.lastActiveDate, day);
  const covered = bridge.every(
    (d) => streak.frozenDates.includes(d) || streak.activeDates.includes(d)
  );
  if (covered) {
    const current = streak.current + 1;
    return withActiveDate(
      {
        ...streak,
        current,
        longest: Math.max(streak.longest, current),
        lastActiveDate: day,
      },
      day
    );
  }

  const current = 1;
  return withActiveDate(
    {
      ...streak,
      current,
      longest: Math.max(streak.longest, current),
      lastActiveDate: day,
    },
    day
  );
}

/** On app open, auto-spend freezes for missed calendar days (up to bank). */
export function autoFreezeMissedDays(streak: StreakState, today = todayKey()): StreakState {
  if (!streak.lastActiveDate || streak.lastActiveDate >= today) return streak;

  const yesterday = addDaysKey(today, -1);
  if (streak.lastActiveDate >= yesterday) return streak;

  let next: StreakState = { ...streak, frozenDates: [...streak.frozenDates] };
  let cursor = streak.lastActiveDate;

  while (cursor < yesterday && next.freezes > 0) {
    const missed = addDaysKey(cursor, 1);
    if (missed >= today) break;
    if (!next.activeDates.includes(missed) && !next.frozenDates.includes(missed)) {
      next = {
        ...next,
        freezes: next.freezes - 1,
        frozenDates: trimActive([...next.frozenDates, missed]),
      };
    }
    cursor = missed;
  }

  next.freezes = Math.min(MAX_FREEZES, next.freezes);
  return next;
}

export function useStreakFreeze(streak: StreakState, day = todayKey()): StreakState {
  if (streak.freezes <= 0) return streak;
  if (streak.frozenDates.includes(day)) return streak;
  return {
    ...streak,
    freezes: streak.freezes - 1,
    frozenDates: trimActive([...streak.frozenDates, day]),
  };
}

/** Earn one freeze when hitting a 7-day streak milestone (cap at 2). */
export function maybeAwardFreeze(streak: StreakState, prevCurrent: number): StreakState {
  if (streak.current >= 7 && prevCurrent < 7 && streak.freezes < MAX_FREEZES) {
    return { ...streak, freezes: streak.freezes + 1 };
  }
  return streak;
}
