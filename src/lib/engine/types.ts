/**
 * DevPath engine contract. Shared by every workstream.
 * Owner: Progression (Agent G). Others import, never edit.
 */

export type EngineEvent =
  | { type: "lesson_viewed"; lessonId: string; moduleSlug: string; lessonSlug: string; title?: string }
  | { type: "lesson_completed"; lessonId: string; moduleSlug: string; title?: string; mastery?: boolean }
  | { type: "quiz_answered"; itemId: string; correct: boolean; topic?: string; prompt?: string }
  | { type: "quiz_finished"; quizId: string; correct: number; total: number; topic?: string }
  | { type: "problem_attempted"; problemId: string; accepted: boolean; title?: string }
  | { type: "review_graded"; cardId: string; grade: ReviewGrade }
  | { type: "interview_round"; roundId: string; score: number; maxScore: number }
  | { type: "onboarding_completed"; goal: string; level: string; minutesPerDay: number }
  | { type: "app_opened" }
  | { type: "streak_freeze_used" }
  | { type: "custom"; name: string; xp?: number };

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface ReviewCard {
  id: string;
  /** Short prompt shown on the card front. */
  front: string;
  /** Answer / explanation. */
  back: string;
  topic: string;
  /** Source lesson/problem id, for "go back" links. */
  sourceHref?: string;
  /** SM-2-lite fields */
  ease: number;
  intervalDays: number;
  dueAt: string; // ISO
  reps: number;
  lapses: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  target: number;
  progress: number;
  xp: number;
  period: "daily" | "weekly";
  /** event type that advances it */
  metric: "lessons" | "quiz_correct" | "problems" | "reviews" | "xp" | "interview";
  claimed: boolean;
}

export interface ActivityEntry {
  at: string; // ISO
  type: EngineEvent["type"];
  label: string;
  xp: number;
}

export interface CompanionMemory {
  goal?: string;
  level?: string;
  minutesPerDay?: number;
  /** topic -> miss count */
  weakSpots: Record<string, number>;
  /** short human-readable wins, newest first */
  wins: string[];
  personality: "concise" | "playful";
  nudgesMuted: boolean;
  lastSeenAt?: string;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezes: number; // banked streak freezes (max 2)
  /** dates covered by a freeze */
  frozenDates: string[];
  /** YYYY-MM-DD dates with activity (last ~120 days) */
  activeDates: string[];
}

export interface EngineState {
  version: 1;
  xp: number;
  /** YYYY-MM-DD -> xp earned that day */
  xpByDay: Record<string, number>;
  dailyGoalXp: number;
  streak: StreakState;
  achievements: Achievement[];
  quests: Quest[];
  questsRefreshedOn: string;
  reviewQueue: ReviewCard[];
  activity: ActivityEntry[];
  companion: CompanionMemory;
  /** last celebration to show (consumed by UI) */
  pendingCelebration?: Celebration | null;
  onboarding?: { goal: string; level: string; minutesPerDay: number; pathReadyAt?: string };
}

export interface Celebration {
  id: string;
  kind: "xp" | "level_up" | "achievement" | "streak" | "quest" | "goal_met";
  title: string;
  detail?: string;
  xp?: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNext: number;
  pct: number;
}
