import type { EngineEvent, EngineState } from "../types";

const MAX_WINS = 12;

export function applyCompanion(state: EngineState, event: EngineEvent, nowIso: string): EngineState {
  let companion = { ...state.companion, weakSpots: { ...state.companion.weakSpots }, wins: [...state.companion.wins] };

  if (event.type === "onboarding_completed") {
    companion = {
      ...companion,
      goal: event.goal,
      level: event.level,
      minutesPerDay: event.minutesPerDay,
    };
  }

  if (event.type === "quiz_answered" && event.topic && !event.correct) {
    const n = (companion.weakSpots[event.topic] ?? 0) + 1;
    companion.weakSpots[event.topic] = n;
  }

  if (event.type === "problem_attempted" && event.accepted) {
    const label = event.title ?? event.problemId;
    companion.wins = [`Solved ${label}`, ...companion.wins].slice(0, MAX_WINS);
  }

  if (event.type === "lesson_completed") {
    const label = event.title ?? event.lessonId;
    companion.wins = [`Finished ${label}`, ...companion.wins].slice(0, MAX_WINS);
  }

  if (event.type === "app_opened") {
    companion.lastSeenAt = nowIso;
  }

  return { ...state, companion };
}
