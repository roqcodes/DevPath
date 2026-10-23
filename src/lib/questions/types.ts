import type { DifficultyLabel } from "./difficulty-config";

export type QuestionStatus = "draft" | "review" | "published" | "archived";
export type ExecutionComparison = "exact" | "trimmed" | "trimmed_lines";
export type SupportedLanguage = "python" | "cpp" | "java";

export interface QuestionPackage {
  schema_version: string;
  id: string;
  slug: string;
  title: string;
  difficulty: { label: DifficultyLabel; score: number };
  topics: string[];
  prerequisites?: string[];
  status: QuestionStatus;
  revision: number;
  estimated_minutes: number;
  provenance: {
    author: string;
    license: string;
    source?: string;
    attribution?: string;
  };
  statement: string;
  io_format: {
    mode: "stdin_stdout";
    input_description: string;
    output_description: string;
  };
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  execution: {
    time_limit_ms: number;
    memory_limit_kb: number;
    comparison: ExecutionComparison;
    languages: SupportedLanguage[];
  };
  test_cases: {
    id: string;
    is_public: boolean;
    input: string;
    expected_output: string;
    description?: string;
  }[];
  hints: { order: number; text: string }[];
  editorial?: string;
  complexity?: { time?: string; space?: string; analysis?: string };
  reference_solutions: Partial<Record<SupportedLanguage, string>>;
}

export interface PublicProblemView {
  id: string;
  slug: string;
  title: string;
  difficulty: { label: DifficultyLabel; score: number };
  topics: string[];
  prerequisites: string[];
  estimated_minutes: number;
  revision: number;
  statement: string;
  io_format: QuestionPackage["io_format"];
  constraints: string[];
  examples: QuestionPackage["examples"];
  execution: Omit<QuestionPackage["execution"], "languages"> & { languages: SupportedLanguage[] };
  hints: QuestionPackage["hints"];
  editorial?: string;
  complexity?: QuestionPackage["complexity"];
  public_test_count: number;
}

export type NormalizedVerdict =
  | "accepted"
  | "wrong_answer"
  | "compilation_error"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "internal_error"
  | "judge_unavailable";
