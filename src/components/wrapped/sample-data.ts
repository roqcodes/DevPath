import type { WrappedStats } from "./types";

export function sampleWrappedStats(period: string): WrappedStats {
  const periodLabel = period.includes("-")
    ? period
    : `${period} on DevPath`;
  return {
    periodLabel,
    xp: 2840,
    level: 7,
    levelTitle: "Optimizer",
    streakCurrent: 12,
    streakLongest: 18,
    lessonsCompleted: 34,
    problemsSolved: 19,
    interviewRounds: 6,
    totalXpInPeriod: 920,
    activeDays: 22,
    persona: "Greedy Optimist",
    personaBlurb: "You reach for the fast heuristic first — then prove it later.",
    bigOAge: "O(n log n)",
    topWin: "Cleared Graph Warden with a 9/10 rubric score",
    headline: "You treated DSA like a playlist — on repeat until it sticks.",
  };
}
