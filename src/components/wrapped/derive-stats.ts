import { levelFromXp, type EngineState } from "@/lib/engine";
import type { WrappedStats } from "./types";

function countActivity(state: EngineState, type: EngineState["activity"][0]["type"]) {
  return state.activity.filter((a) => a.type === type).length;
}

function xpInPeriod(state: EngineState, periodKey: string): number {
  if (periodKey.length === 4) {
    return Object.entries(state.xpByDay)
      .filter(([d]) => d.startsWith(periodKey))
      .reduce((sum, [, v]) => sum + v, 0);
  }
  return Object.entries(state.xpByDay)
    .filter(([d]) => d.startsWith(periodKey))
    .reduce((sum, [, v]) => sum + v, 0);
}

function activeDaysInPeriod(state: EngineState, periodKey: string): number {
  return state.streak.activeDates.filter((d) => d.startsWith(periodKey)).length;
}

function derivePersona(state: EngineState): { persona: string; blurb: string } {
  const lessons = countActivity(state, "lesson_completed");
  const problems = countActivity(state, "problem_attempted");
  const interviews = countActivity(state, "interview_round");
  const quizzes = countActivity(state, "quiz_answered");

  if (interviews >= 3) {
    return {
      persona: "Whiteboard Warrior",
      blurb: "You chase verbal clarity as hard as correct code.",
    };
  }
  if (problems >= lessons) {
    return {
      persona: "Bug Slayer",
      blurb: "Judge0 green lights are your comfort food.",
    };
  }
  if (quizzes >= 10) {
    return {
      persona: "Pattern Matcher",
      blurb: "You spot the template before the timer starts.",
    };
  }
  if (state.companion.weakSpots && Object.keys(state.companion.weakSpots).length > 2) {
    return {
      persona: "Recursion Monk",
      blurb: "You sit with hard topics until the stack overflows — then you optimize.",
    };
  }
  return {
    persona: "Greedy Optimist",
    blurb: "You grab momentum first and refine on the second pass.",
  };
}

function deriveBigOAge(level: number): string {
  if (level <= 2) return "O(n²) — exploratory loops";
  if (level <= 4) return "O(n log n) — sorting things out";
  if (level <= 6) return "O(n) — single-pass clarity";
  return "O(1) — amortized wisdom";
}

export function deriveWrappedStats(state: EngineState, period: string): WrappedStats {
  const level = levelFromXp(state.xp);
  const { persona, blurb } = derivePersona(state);
  const periodLabel = period.includes("-") ? formatMonth(period) : `${period} on DevPath`;
  const periodKey = period;

  const lessons = countActivity(state, "lesson_completed");
  const problems = state.activity.filter((a) => a.type === "problem_attempted").length;
  const interviews = countActivity(state, "interview_round");
  const topWin = state.companion.wins[0] ?? "First lesson completed — graph node lit up.";

  return {
    periodLabel,
    xp: state.xp,
    level: level.level,
    levelTitle: level.title,
    streakCurrent: state.streak.current,
    streakLongest: state.streak.longest,
    lessonsCompleted: lessons,
    problemsSolved: problems,
    interviewRounds: interviews,
    totalXpInPeriod: xpInPeriod(state, periodKey),
    activeDays: activeDaysInPeriod(state, periodKey) || state.streak.activeDates.length,
    persona,
    personaBlurb: blurb,
    bigOAge: deriveBigOAge(level.level),
    topWin,
    headline: interviews > 0
      ? "Mock interviews made it into your routine — that's rare."
      : "Your graph grew quietly — consistency beats cramming.",
  };
}

function formatMonth(period: string): string {
  const [y, m] = period.split("-");
  const month = new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  return `${month} on DevPath`;
}

export function buildSlides(stats: WrappedStats): import("./types").WrappedSlide[] {
  return [
    {
      id: "intro",
      title: "Your DevPath Wrapped",
      subtitle: stats.periodLabel,
      body: stats.headline,
      accent: "indigo",
    },
    {
      id: "xp",
      title: "XP energy",
      metric: stats.totalXpInPeriod.toLocaleString(),
      metricLabel: "XP this period",
      body: `Lifetime ${stats.xp.toLocaleString()} XP · Level ${stats.level} ${stats.levelTitle}`,
      accent: "cyan",
    },
    {
      id: "streak",
      title: "Streak flame",
      metric: String(stats.streakCurrent),
      metricLabel: "day streak",
      body: `Longest run: ${stats.streakLongest} days · Active days in period: ${stats.activeDays}`,
      accent: "amber",
    },
    {
      id: "grind",
      title: "What you shipped",
      body: `${stats.lessonsCompleted} lessons · ${stats.problemsSolved} problem attempts · ${stats.interviewRounds} interview rounds`,
      accent: "emerald",
    },
    {
      id: "persona",
      title: "Algorithm persona",
      metric: stats.persona,
      body: stats.personaBlurb,
      accent: "indigo",
    },
    {
      id: "bigo",
      title: "Big-O age",
      metric: stats.bigOAge,
      body: "Not your real age — the complexity class your brain defaults to.",
      accent: "cyan",
    },
    {
      id: "win",
      title: "Brightest win",
      body: stats.topWin,
      accent: "amber",
    },
    {
      id: "share",
      title: "Share the graph",
      body: "Export a 1080×1350 story card — identity, not rank.",
      accent: "indigo",
    },
  ];
}
