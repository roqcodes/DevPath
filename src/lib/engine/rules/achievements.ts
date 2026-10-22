import type { Achievement, EngineEvent, EngineState } from "../types";

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlockedAt">[] = [
  { id: "hello_world", title: "Hello, World", description: "Complete your first lesson.", icon: "Sparkles" },
  { id: "path_ready", title: "Path Ready", description: "Finish the DevPath onboarding.", icon: "Map" },
  { id: "off_by_none", title: "Off-by-None", description: "Get 10 quiz answers right.", icon: "CheckCircle2" },
  { id: "recall_machine", title: "Recall Machine", description: "Grade 20 review cards.", icon: "Brain" },
  { id: "week_one", title: "Week One", description: "Reach a 7-day streak.", icon: "Flame" },
  { id: "arena_survivor", title: "Arena Survivor", description: "Finish an interview round.", icon: "Swords" },
  { id: "level_5", title: "Level 5", description: "Reach level 5.", icon: "TrendingUp" },
  { id: "level_10", title: "Level 10", description: "Reach level 10.", icon: "Crown" },
];

export function unlockAchievement(state: Achievement[], id: string): Achievement[] {
  if (state.some((a) => a.id === id && a.unlockedAt)) return state;
  const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
  if (!def) return state;
  const now = new Date().toISOString();
  const without = state.filter((a) => a.id !== id);
  return [...without, { ...def, unlockedAt: now }];
}

export function checkAchievements(state: EngineState, event: EngineEvent, level: number): string[] {
  const unlocked: string[] = [];
  const has = (id: string) => state.achievements.some((a) => a.id === id && a.unlockedAt);

  if (event.type === "lesson_completed" && !has("hello_world")) unlocked.push("hello_world");
  if (event.type === "onboarding_completed" && !has("path_ready")) unlocked.push("path_ready");
  if (event.type === "interview_round" && !has("arena_survivor")) unlocked.push("arena_survivor");

  const quizCorrect = state.activity.filter((a) => a.label.includes("quiz") && a.xp >= 5).length;
  if (quizCorrect >= 10 && !has("off_by_none")) unlocked.push("off_by_none");

  const reviews = state.activity.filter((a) => a.type === "review_graded").length;
  if (reviews >= 20 && !has("recall_machine")) unlocked.push("recall_machine");

  if (state.streak.current >= 7 && !has("week_one")) unlocked.push("week_one");

  if (level >= 5 && !has("level_5")) unlocked.push("level_5");
  if (level >= 10 && !has("level_10")) unlocked.push("level_10");

  return unlocked;
}
