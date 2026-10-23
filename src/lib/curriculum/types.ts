import type { ProblemDifficulty } from "@/lib/types/sait";

export type VisualizerKind =
  | "array-cells"
  | "two-pointers"
  | "sliding-window"
  | "binary-search"
  | "hash-map"
  | "linked-list"
  | "stack-queue"
  | "recursion-stack"
  | "tree-traversal"
  | "graph-bfs"
  | "dp-table"
  | "none";

export type WorkspaceTabId =
  | "learn"
  | "visualize"
  | "examples"
  | "complexity"
  | "practice"
  | "review";

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonLearnContent {
  hook: string;
  objectives: string[];
  whenUseful: string;
  mentalModel: string;
  terminology: { term: string; definition: string }[];
  commonMistakes: string[];
  tradeoffs?: string;
  summary: string;
}

export interface LessonExampleContent {
  title: string;
  input: string;
  steps: string[];
  output: string;
  why: string;
  codeSnippet?: { language: string; code: string };
  analogy?: string;
}

export interface LessonComplexityContent {
  time: string;
  auxiliarySpace: string;
  explanation: string;
  naiveComparison?: string;
  measured: string;
}

export interface LessonPracticeContent {
  warmup: string;
  conceptCheck: string;
  linkedProblemIds: string[];
  difficultyLabel: string;
}

export interface LessonReviewContent {
  takeaways: string[];
  misconceptions: string[];
  nextLessonSlug?: string;
}

export interface LessonSandbox {
  samples: { input: string; expectedOutput: string; label?: string }[];
  starterCode: Partial<Record<"python" | "cpp" | "java", string>>;
}

export interface DsaLessonContent {
  id: string;
  moduleSlug: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  visualizer: VisualizerKind;
  practiceProblemIds: string[];
  sandbox?: LessonSandbox;
  completion: {
    type: "quiz" | "checkpoint";
    checkpointPrompt?: string;
    quiz?: QuizQuestion[];
    minQuizScore?: number;
  };
  learn: LessonLearnContent;
  examples: LessonExampleContent;
  complexity: LessonComplexityContent;
  practice: LessonPracticeContent;
  review: LessonReviewContent;
}

export interface CurriculumModuleMeta {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  prerequisiteModuleIds: string[];
  difficultyRange: [ProblemDifficulty, ProblemDifficulty];
  estimatedHours: number;
  topicTags: string[];
  completionPolicy: string;
  lessons: { slug: string; title: string; minutes: number; visualizer?: VisualizerKind }[];
}
