import type { EngineEvent, EngineState, Quest } from "../types";
import { todayKey, weekKey } from "./dates";

function dailyQuests(day: string): Quest[] {
  return [
    {
      id: `daily_lessons_${day}`,
      title: "Finish a lesson",
      target: 1,
      progress: 0,
      xp: 20,
      period: "daily",
      metric: "lessons",
      claimed: false,
    },
    {
      id: `daily_quiz_${day}`,
      title: "5 correct quiz answers",
      target: 5,
      progress: 0,
      xp: 15,
      period: "daily",
      metric: "quiz_correct",
      claimed: false,
    },
    {
      id: `daily_xp_${day}`,
      title: "Hit your XP goal",
      target: 30,
      progress: 0,
      xp: 10,
      period: "daily",
      metric: "xp",
      claimed: false,
    },
  ];
}

function weeklyQuests(wk: string): Quest[] {
  return [
    {
      id: `weekly_problems_${wk}`,
      title: "Solve 3 problems",
      target: 3,
      progress: 0,
      xp: 50,
      period: "weekly",
      metric: "problems",
      claimed: false,
    },
    {
      id: `weekly_lessons_${wk}`,
      title: "Complete 5 lessons",
      target: 5,
      progress: 0,
      xp: 40,
      period: "weekly",
      metric: "lessons",
      claimed: false,
    },
  ];
}

export function ensureQuests(state: EngineState, now = new Date()): EngineState {
  const day = todayKey(now);
  const wk = weekKey(now);
  const hasDaily = state.quests.some((q) => q.period === "daily" && q.id.includes(day));
  const hasWeekly = state.quests.some((q) => q.period === "weekly" && q.id.includes(wk));

  let quests = state.quests.filter((q) => {
    if (q.period === "daily" && !q.id.includes(day)) return false;
    if (q.period === "weekly" && !q.id.includes(wk)) return false;
    return true;
  });

  if (!hasDaily) quests = [...quests, ...dailyQuests(day)];
  if (!hasWeekly) quests = [...quests, ...weeklyQuests(wk)];

  return {
    ...state,
    quests,
    questsRefreshedOn: day,
  };
}

function bumpQuest(q: Quest, amount: number): Quest {
  if (q.claimed) return q;
  return { ...q, progress: Math.min(q.target, q.progress + amount) };
}

export function advanceQuests(state: EngineState, event: EngineEvent, xpEarned: number): EngineState {
  const dayXp = state.xpByDay[todayKey()] ?? 0;
  const quests = state.quests.map((q) => {
    switch (event.type) {
      case "lesson_completed":
        if (q.metric === "lessons") return bumpQuest(q, 1);
        break;
      case "quiz_answered":
        if (q.metric === "quiz_correct" && event.correct) return bumpQuest(q, 1);
        break;
      case "problem_attempted":
        if (q.metric === "problems" && event.accepted) return bumpQuest(q, 1);
        break;
      case "review_graded":
        if (q.metric === "reviews") return bumpQuest(q, 1);
        break;
      case "interview_round":
        if (q.metric === "interview") return bumpQuest(q, 1);
        break;
      default:
        break;
    }
    if (q.metric === "xp") {
      const progress = Math.min(q.target, dayXp);
      if (progress !== q.progress) return { ...q, progress };
    }
    return q;
  });

  return { ...state, quests };
}

export function claimQuest(state: EngineState, questId: string): EngineState {
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest || quest.claimed || quest.progress < quest.target) return state;

  const day = todayKey();
  const bonus = quest.xp;
  return {
    ...state,
    xp: state.xp + bonus,
    xpByDay: { ...state.xpByDay, [day]: (state.xpByDay[day] ?? 0) + bonus },
    quests: state.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
    pendingCelebration: {
      id: `quest_${questId}_${Date.now()}`,
      kind: "quest",
      title: "Quest complete!",
      detail: quest.title,
      xp: bonus,
    },
  };
}
