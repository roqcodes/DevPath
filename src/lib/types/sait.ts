export type DepartmentId = "IT" | "AI";
export type BatchId = "A" | "B";
export type ProblemDifficulty = "easy" | "medium" | "hard";
export type ProblemStatus = "unsolved" | "attempted" | "solved";
export type ReviewStatus = "draft" | "review" | "published" | "archived";
export type SubmissionVerdict =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit"
  | "compile_error"
  | "judge_unavailable"
  | "pending";

export interface StudentOnboardingData {
  fullName: string;
  email: string;
  phone?: string;
  department: DepartmentId;
  academicYear: string;
  batch: BatchId;
  studentId?: string;
}

export interface LessonSection {
  type: "concept" | "example" | "walkthrough" | "complexity" | "guided" | "practice" | "checkpoint";
  title: string;
  body: string;
}

export interface SyllabusLesson {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  practiceProblemIds: string[];
}

export interface SyllabusModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  prerequisiteModuleIds: string[];
  difficultyRange: [ProblemDifficulty, ProblemDifficulty];
  estimatedHours: number;
  lessons: SyllabusLesson[];
  topicTags: string[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemExecution {
  time_limit_ms: number;
  memory_limit_kb: number;
  supported_languages: string[];
  stdin_mode?: "single" | "lines";
  comparison?: "exact" | "trimmed";
}

export interface ProblemHint {
  order: number;
  text: string;
}

export interface ProblemTestCase {
  id: string;
  is_public: boolean;
  input: string;
  expected_output: string;
}

export interface ProblemBankItem {
  schema_version: string;
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  topics: string[];
  prerequisites?: string[];
  statement: string;
  examples: ProblemExample[];
  constraints: string[];
  execution: ProblemExecution;
  test_cases: ProblemTestCase[];
  hints: ProblemHint[];
  editorial?: string;
  provenance?: Record<string, unknown>;
  review_status: ReviewStatus;
  reference_solutions?: Record<string, string>;
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemRevision: number;
  language: string;
  verdict: SubmissionVerdict;
  passedTests: number;
  totalTests: number;
  runtimeMs?: number;
  createdAt: string;
}

export interface DailyGoalState {
  date: string;
  targetLessons: number;
  targetProblems: number;
  completedLessons: number;
  completedProblems: number;
  reviewDone: boolean;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  department: DepartmentId;
  academicYear: string;
  batch: BatchId;
  score: number;
  uniqueSolved: number;
  change?: number;
  isDemo?: boolean;
}

export interface RankingRules {
  description: string;
  scoreFormula: string;
}
