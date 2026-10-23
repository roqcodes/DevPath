import type { Achievement, EngineEvent, EngineState, LevelInfo } from "./types";
import { unlockAchievement, checkAchievements } from "./rules/achievements";
import { pickCelebration } from "./rules/celebration";
import { applyCompanion } from "./rules/companion";
import { todayKey } from "./rules/dates";
import { levelFromXp } from "./rules/level";
import { advanceQuests, claimQuest, ensureQuests } from "./rules/quests";
import { applyReviewEvent } from "./rules/review";
import {
  applyStreakActivity,
  autoFreezeMissedDays,
  isStreakQualifyingEvent,
  maybeAwardFreeze,
  useStreakFreeze,
} from "./rules/streak";
import { xpForEvent } from "./rules/xp";

export { todayKey } from "./rules/dates";
export { levelFromXp } from "./rules/level";
export type { LevelInfo };

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

export { xpForEvent } from "./rules/xp";

function dailyGoalFromMinutes(minutes: number): number {
  if (minutes <= 5) return 20;
  if (minutes <= 10) return 30;
  if (minutes <= 20) return 50;
  return 80;
}

function activityLabel(event: EngineEvent): string {
  switch (event.type) {
    case "lesson_viewed":
      return `Viewed ${event.title ?? event.lessonId}`;
    case "lesson_completed":
      return `Completed ${event.title ?? event.lessonId}`;
    case "quiz_answered":
      return event.correct ? `Quiz correct: ${event.topic ?? event.itemId}` : `Quiz miss: ${event.topic ?? event.itemId}`;
    case "quiz_finished":
      return `Quiz ${event.correct}/${event.total}`;
    case "problem_attempted":
      return event.accepted ? `Solved ${event.title ?? event.problemId}` : `Attempted ${event.problemId}`;
    case "review_graded":
      return `Review: ${event.grade}`;
    case "interview_round":
      return `Interview round ${event.roundId}`;
    case "onboarding_completed":
      return "Path ready";
    case "app_opened":
      return "Opened DevPath";
    case "streak_freeze_used":
      return "Streak freeze";
    case "custom":
      return event.name;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

function logActivity(state: EngineState, event: EngineEvent, xp: number): EngineState {
  if (xp <= 0 && event.type === "app_opened") {
    return {
      ...state,
      activity: [
        { at: new Date().toISOString(), type: event.type, label: activityLabel(event), xp: 0 },
        ...state.activity,
      ].slice(0, 200),
    };
  }
  if (xp <= 0 && event.type !== "quiz_answered") return state;
  return {
    ...state,
    activity: [
      { at: new Date().toISOString(), type: event.type, label: activityLabel(event), xp },
      ...state.activity,
    ].slice(0, 200),
  };
}

export function reduceEvent(prev: EngineState, event: EngineEvent): EngineState {
  const nowIso = new Date().toISOString();
  const day = todayKey();

  if (event.type === "custom") {
    if (event.name.startsWith("quest_claim:")) {
      return claimQuest(prev, event.name.slice("quest_claim:".length));
    }
    const bonus = event.xp ?? 0;
    if (bonus <= 0) return prev;
    return {
      ...prev,
      xp: prev.xp + bonus,
      xpByDay: { ...prev.xpByDay, [day]: (prev.xpByDay[day] ?? 0) + bonus },
    };
  }

  if (event.type === "streak_freeze_used") {
    const streak = useStreakFreeze(prev.streak, day);
    return applyCompanion({ ...prev, streak }, event, nowIso);
  }

  if (event.type === "app_opened") {
    let state = { ...prev, streak: autoFreezeMissedDays(prev.streak, day) };
    state = ensureQuests(state);
    return applyCompanion(state, event, nowIso);
  }

  const xp = xpForEvent(event);
  let next: EngineState = {
    ...prev,
    xp: prev.xp + xp,
    xpByDay: { ...prev.xpByDay, [day]: (prev.xpByDay[day] ?? 0) + xp },
  };
  next = logActivity(next, event, xp);

  if (event.type === "onboarding_completed") {
    next = {
      ...next,
      dailyGoalXp: dailyGoalFromMinutes(event.minutesPerDay),
      onboarding: {
        goal: event.goal,
        level: event.level,
        minutesPerDay: event.minutesPerDay,
        pathReadyAt: nowIso,
      },
    };
  }

  next = applyReviewEvent(next, event);
  next = applyCompanion(next, event, nowIso);
  next = ensureQuests(next);
  next = advanceQuests(next, event, xp);

  if (isStreakQualifyingEvent(event)) {
    const prevCurrent = next.streak.current;
    const streak = applyStreakActivity(next.streak, day);
    next = { ...next, streak: maybeAwardFreeze(streak, prevCurrent) };
  }

  const level = levelFromXp(next.xp).level;
  const unlockIds = checkAchievements(next, event, level);
  const newlyUnlocked: Achievement[] = [];
  for (const id of unlockIds) {
    const before = next.achievements;
    next = { ...next, achievements: unlockAchievement(before, id) };
    const a = next.achievements.find((x) => x.id === id);
    if (a?.unlockedAt) newlyUnlocked.push(a);
  }

  const celebration = pickCelebration(prev, next, newlyUnlocked, xp);
  if (celebration) next = { ...next, pendingCelebration: celebration };

  return next;
}
