export type UserRole =
  | "student"
  | "software_developer"
  | "backend_developer"
  | "frontend_developer"
  | "devops_engineer"
  | "system_administrator"
  | "other";

export type ExperienceLevel =
  | "starting_from_zero"
  | "seen_basics"
  | "work_with_tools"
  | "comfortable_workflows"
  | "already_experienced";

export type LearningGoal =
  | "learn_from_scratch"
  | "deployment_ready"
  | "build_projects"
  | "prepare_interviews"
  | "improve_workflow";

export type LearningDuration =
  | "7_days"
  | "2_weeks"
  | "1_month"
  | "2_months"
  | "3_months";

export type DailyCommitment =
  | "15_minutes"
  | "30_minutes"
  | "1_hour"
  | "2_plus_hours";

export type SkillRating = 0 | 1 | 2 | 3;

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole | null;
  experienceLevel: ExperienceLevel | null;
  learningGoal: LearningGoal | null;
  learningDuration: LearningDuration | null;
  dailyTime: DailyCommitment | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillAssessment {
  topic: string;
  selfRating: SkillRating;
}

export interface UserInterest {
  topic: string;
}

export interface OnboardingData {
  fullName: string;
  role: UserRole;
  experienceLevel: ExperienceLevel;
  skillAssessments: SkillAssessment[];
  interests: string[];
  learningGoal: LearningGoal;
  learningDuration: LearningDuration;
  dailyTime: DailyCommitment;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}
