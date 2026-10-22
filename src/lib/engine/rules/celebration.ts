import type { Achievement, Celebration, EngineState } from "../types";
import { levelFromXp } from "./level";

export function pickCelebration(
  prev: EngineState,
  next: EngineState,
  newlyUnlocked: Achievement[],
  xpEarned: number
): Celebration | null {
  if (newlyUnlocked.length > 0) {
    const a = newlyUnlocked[0];
    return {
      id: `ach_${a.id}_${Date.now()}`,
      kind: "achievement",
      title: a.title,
      detail: a.description,
    };
  }

  const prevLevel = levelFromXp(prev.xp).level;
  const nextLevel = levelFromXp(next.xp).level;
  if (nextLevel > prevLevel) {
    const info = levelFromXp(next.xp);
    return {
      id: `level_${nextLevel}_${Date.now()}`,
      kind: "level_up",
      title: `Level ${info.level}`,
      detail: info.title,
    };
  }

  const day = Object.keys(next.xpByDay).sort().at(-1);
  if (day && (next.xpByDay[day] ?? 0) >= next.dailyGoalXp && (prev.xpByDay[day] ?? 0) < next.dailyGoalXp) {
    return {
      id: `goal_${day}`,
      kind: "goal_met",
      title: "Daily goal crushed",
      detail: `${next.dailyGoalXp} XP today`,
      xp: xpEarned,
    };
  }

  if (next.streak.current > prev.streak.current && [3, 7, 14, 30].includes(next.streak.current)) {
    return {
      id: `streak_${next.streak.current}`,
      kind: "streak",
      title: `${next.streak.current}-day streak`,
      detail: "Keep the flame alive.",
    };
  }

  if (xpEarned >= 30) {
    return {
      id: `xp_burst_${Date.now()}`,
      kind: "xp",
      title: "Big XP gain",
      detail: undefined,
      xp: xpEarned,
    };
  }

  return null;
}
