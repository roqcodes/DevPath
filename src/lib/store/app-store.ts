import type { AppProgress, AppState, UserData } from "@/lib/types/app";
import { todayIsoDate } from "@/lib/utils";

const DEFAULT_USER: UserData = {
  name: "",
  displayName: "",
  email: "",
  phone: "",
  department: "",
  admissionCohort: "",
  academicYear: "",
  batch: "",
  studentId: "",
  profilePublic: true,
  weeklyGoalProblems: 5,
  preferredLanguage: "python",
  dsaExperience: "",
};

const STORAGE_KEY = "sait_dsa_app_state";

function defaultDailyGoal() {
  const date = todayIsoDate();
  return {
    date,
    targetLessons: 1,
    targetProblems: 2,
    completedLessons: 0,
    completedProblems: 0,
    reviewDone: false,
  };
}

export const DEFAULT_PROGRESS: AppProgress = {
  onboardingComplete: false,
  completedLessons: [],
  viewedLessons: [],
  lessonQuizPassed: {},
  lessonCheckpointDone: {},
  lessonMastery: {},
  solvedProblems: [],
  attemptedProblems: [],
  bookmarks: [],
  hintsRevealed: {},
  submissions: [],
  streak: 0,
  lastPracticeDate: "",
  activeMinutesThisWeek: 0,
  activeMinutesLast30Days: 0,
  dailyGoal: defaultDailyGoal(),
  achievements: [],
  rankingScore: 0,
};

export function getDefaultState(): AppState {
  return {
    user: { ...DEFAULT_USER },
    progress: { ...DEFAULT_PROGRESS, dailyGoal: defaultDailyGoal() },
  };
}

export function loadAppState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      user: { ...DEFAULT_USER, ...parsed.user },
      progress: {
        ...DEFAULT_PROGRESS,
        ...parsed.progress,
        dailyGoal: { ...defaultDailyGoal(), ...parsed.progress?.dailyGoal },
      },
    };
  } catch {
    return getDefaultState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export type { AppState, AppProgress, UserData };
