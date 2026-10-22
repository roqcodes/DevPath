import type { BatchId, DailyGoalState, DepartmentId, SubmissionRecord } from "@/lib/types/sait";

export interface UserData {
  name: string;
  displayName?: string;
  email: string;
  phone?: string;
  department: DepartmentId | "";
  admissionCohort: string;
  academicYear: string;
  batch: BatchId | "";
  studentId?: string;
  profilePublic: boolean;
  weeklyGoalProblems: number;
  preferredLanguage: string;
  dsaExperience?: string;
}

export interface AppProgress {
  onboardingComplete: boolean;
  completedLessons: string[];
  viewedLessons: string[];
  lessonQuizPassed: Record<string, boolean>;
  lessonCheckpointDone: Record<string, boolean>;
  lastVisitedLesson?: { moduleSlug: string; lessonSlug: string };
  lessonMastery: Record<string, boolean>;
  solvedProblems: string[];
  attemptedProblems: string[];
  bookmarks: string[];
  hintsRevealed: Record<string, number>;
  submissions: SubmissionRecord[];
  lastActiveProblemId?: string;
  streak: number;
  lastPracticeDate: string;
  activeMinutesThisWeek: number;
  activeMinutesLast30Days: number;
  dailyGoal: DailyGoalState;
  achievements: string[];
  rankingScore: number;
}

export interface AppState {
  user: UserData;
  progress: AppProgress;
}
