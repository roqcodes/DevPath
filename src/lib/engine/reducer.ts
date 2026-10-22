import type { EngineEvent, EngineState, LevelInfo } from "./types";

/**
 * PLACEHOLDER rules. Owner: Agent G replaces with the full XP / streak-freeze /
 * quest / achievement / spaced-repetition logic. Keep these exported names stable.
 */

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function initialEngineState(): EngineState {
  return {
    version: 1,
    xp: 0,
    xpByDay: {},
    dailyGoalXp: 30,
    streak: { current: 0, longest: 0, lastActiveDate: "", freezes: 1, frozenDates: [], activeDates: [] },
    achievements: [],
    quests: [],
    questsRefreshedOn: "",
    reviewQueue: [],
    activity: [],
    companion: { weakSpots: {}, wins: [], personality: "playful", nudgesMuted: false },
    pendingCelebration: null,
  };
}

export function xpForEvent(event: EngineEvent): number {
  switch (event.type) {
    case "lesson_completed":
      return event.mastery ? 30 : 20;
    case "quiz_answered":
      return event.correct ? 5 : 1;
    case "problem_attempted":
      return event.accepted ? 40 : 2;
    case "review_graded":
      return 3;
    case "interview_round":
      return 10 + Math.round((event.score / Math.max(1, event.maxScore)) * 30);
    case "onboarding_completed":
      return 10;
    case "custom":
      return event.xp ?? 0;
    default:
      return 0;
  }
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  const titles = ["Newcomer", "Tracer", "Iterator", "Builder", "Optimizer", "Architect", "Grandmaster"];
  return {
    level,
    title: titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))],
    xpIntoLevel: rest,
    xpForNext: need,
    pct: Math.round((rest / need) * 100),
  };
}

export function reduceEvent(prev: EngineState, event: EngineEvent): EngineState {
  const xp = xpForEvent(event);
  const day = todayKey();
  return {
    ...prev,
    xp: prev.xp + xp,
    xpByDay: { ...prev.xpByDay, [day]: (prev.xpByDay[day] ?? 0) + xp },
    activity: [{ at: new Date().toISOString(), type: event.type, label: event.type, xp }, ...prev.activity].slice(0, 200),
  };
}
