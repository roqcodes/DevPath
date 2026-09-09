import type { AppState, AppProgress, AssessmentResult, JourneyData, UserData } from "@/lib/types/app";
import { DEFAULT_USER } from "@/lib/mock/user";
import { getMockJourney } from "@/lib/mock/journey";
import { getMockAssessmentResult } from "@/lib/mock/assessment";

const STORAGE_KEY = "devpath_app_state";

export const DEMO_PROGRESS: AppProgress = {
  onboardingComplete: true,
  assessmentComplete: true,
  preferencesComplete: true,
  journeyGenerated: true,
  completedCheckpoints: ["cp-git-foundations"],
  currentCheckpointId: "cp-branches-merging",
  hintsUsed: {},
  quizScores: {},
  projectStagesCompleted: ["stage-git", "stage-testing", "stage-docker"],
  projectComplete: false,
  certificateEarned: false,
  xp: 420,
  readinessScore: 72,
  streak: 7,
  daysRemaining: 12,
};

export function getDefaultState(): AppState {
  const progress = { ...DEMO_PROGRESS };
  return {
    user: { ...DEFAULT_USER, role: "Software Developer" },
    assessmentAnswers: {},
    assessmentResult: getMockAssessmentResult(),
    journey: getMockJourney(progress.completedCheckpoints, progress.currentCheckpointId),
    progress,
  };
}

export function loadAppState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    const progress = { ...DEMO_PROGRESS, ...parsed.progress };
    return {
      ...getDefaultState(),
      ...parsed,
      user: { ...DEFAULT_USER, ...parsed.user },
      progress,
      assessmentResult: parsed.assessmentResult ?? getMockAssessmentResult(),
      journey: parsed.journey ?? getMockJourney(progress.completedCheckpoints, progress.currentCheckpointId),
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
