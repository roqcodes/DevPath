import type { EngineEvent } from "../types";

export function xpForEvent(event: EngineEvent): number {
  switch (event.type) {
    case "lesson_viewed":
      return 2;
    case "lesson_completed":
      return event.mastery ? 30 : 20;
    case "quiz_answered":
      return event.correct ? 5 : 1;
    case "quiz_finished":
      return event.correct >= event.total ? 15 : Math.max(5, event.correct * 3);
    case "problem_attempted":
      return event.accepted ? 40 : 2;
    case "review_graded":
      return event.grade === "again" ? 1 : event.grade === "easy" ? 6 : 3;
    case "interview_round":
      return 10 + Math.round((event.score / Math.max(1, event.maxScore)) * 30);
    case "onboarding_completed":
      return 25;
    case "app_opened":
    case "streak_freeze_used":
      return 0;
    case "custom":
      if (event.name.startsWith("quest_claim")) return event.xp ?? 0;
      return event.xp ?? 0;
    default:
      return 0;
  }
}
