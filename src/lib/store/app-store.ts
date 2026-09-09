import type { AppState, AppProgress, AssessmentResult, JourneyData, UserData } from "@/lib/types/app";
import { DEFAULT_USER } from "@/lib/mock/user";
import { getMockJourney } from "@/lib/mock/journey";

const STORAGE_KEY = "devpath_app_state";

const DEFAULT_PROGRESS: AppProgress = {
  onboardingComplete: false,
  assessmentComplete: false,
  preferencesComplete: false,
  journeyGenerated: false,
  completedCheckpoints: ["cp-git-foundations"],
  currentCheckpointId: "cp-branches-merging",
  hintsUsed: {},
  quizScores: {},
  projectStagesCompleted: ["stage-git", "stage-testing", "stage-docker"],
  projectComplete: false,
  certificateEarned: false,
};

export function getDefaultState(): AppState {
  return {
    user: { ...DEFAULT_USER },
    assessmentAnswers: {},
    assessmentResult: null,
    journey: null,
    progress: { ...DEFAULT_PROGRESS },
  };
}

export function loadAppState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...getDefaultState(),
      ...parsed,
      user: { ...DEFAULT_USER, ...parsed.user },
      progress: { ...DEFAULT_PROGRESS, ...parsed.progress },
    };
  } catch {
    return getDefaultState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function buildJourneyFromProgress(progress: AppProgress): JourneyData {
  return getMockJourney(progress.completedCheckpoints, progress.currentCheckpointId);
}

export function hydrateJourney(state: AppState): AppState {
  if (!state.progress.journeyGenerated) return state;
  return {
    ...state,
    journey: buildJourneyFromProgress(state.progress),
  };
}

export type { AppState, AppProgress, AssessmentResult, JourneyData, UserData };
