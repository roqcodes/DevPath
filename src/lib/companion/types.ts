/** Shared Kip / AI contract types. Safe to import from client and server. */

export interface CompanionContext {
  /** where the learner is, e.g. "dashboard", "lesson", "quiz", "path", "review", "interview" */
  surface: string;
  /** human-readable subject, e.g. lesson title or problem name */
  subject?: string;
  /** any extra text the AI should know (lesson body excerpt, wrong answer, etc.) */
  detail?: string;
}

export type CompanionMood = "idle" | "thinking" | "excited" | "proud" | "concerned" | "sleepy" | "focused";

export type Personality = "concise" | "playful";

export const AI_MODES = [
  "explain",
  "eli5",
  "deeper",
  "example",
  "quiz",
  "socratic",
  "hint",
  "review",
  "briefing",
  "interview",
  "chat",
] as const;
export type AiMode = (typeof AI_MODES)[number];

export const GENERATE_KINDS = ["quiz", "path", "interview_round", "interview_grade"] as const;
export type GenerateKind = (typeof GENERATE_KINDS)[number];

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiMemory {
  goal?: string;
  weakSpots?: string[];
  wins?: string[];
}

export interface AiStreamRequest {
  mode: AiMode;
  context: CompanionContext;
  messages?: AiMessage[];
  personality?: Personality;
  memory?: AiMemory;
}

export interface AiGenerateRequest {
  kind: GenerateKind;
  context: CompanionContext;
  input?: unknown;
}

export type AiSource = "live" | "demo";

export interface QuizQuestion {
  prompt: string;
  choices: [string, string, string, string];
  answerIndex: number;
  explanation: string;
}
export interface QuizData {
  questions: QuizQuestion[];
}
export interface PathData {
  title: string;
  summary: string;
  steps: { title: string; why: string; minutes: number }[];
}
export interface InterviewRoundData {
  question: string;
  rubric: string[];
}
export interface InterviewGradeInput {
  question: string;
  answer: string;
  rubric: string[];
}
export interface InterviewGradeData {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
}

export interface GenerateDataMap {
  quiz: QuizData;
  path: PathData;
  interview_round: InterviewRoundData;
  interview_grade: InterviewGradeData;
}

export interface AiGenerateResponse<K extends GenerateKind = GenerateKind> {
  source: AiSource;
  data: GenerateDataMap[K];
}
