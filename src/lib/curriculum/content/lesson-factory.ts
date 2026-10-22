import type {
  DsaLessonContent,
  LessonComplexityContent,
  LessonExampleContent,
  LessonLearnContent,
  LessonPracticeContent,
  LessonReviewContent,
  QuizQuestion,
  VisualizerKind,
} from "../types";

export function quizOne(
  prompt: string,
  correct: string,
  wrong: [string, string],
  explanation: string
): { type: "quiz"; minQuizScore: number; quiz: QuizQuestion[] } {
  return {
    type: "quiz",
    minQuizScore: 1,
    quiz: [
      {
        id: "q1",
        prompt,
        options: [
          { id: "a", label: correct },
          { id: "b", label: wrong[0] },
          { id: "c", label: wrong[1] },
        ],
        correctOptionId: "a",
        explanation,
      },
    ],
  };
}

export interface LessonSpec {
  title: string;
  minutes: number;
  visualizer?: VisualizerKind;
  practiceProblemIds?: string[];
  learn: Omit<LessonLearnContent, "summary"> & { summary: string };
  examples: LessonExampleContent;
  complexity: LessonComplexityContent;
  practice: Omit<LessonPracticeContent, "linkedProblemIds">;
  review: LessonReviewContent;
  completion:
    | ReturnType<typeof quizOne>
    | { type: "checkpoint"; checkpointPrompt: string };
}

export function defineLesson(moduleSlug: string, slug: string, spec: LessonSpec): DsaLessonContent {
  const learn: LessonLearnContent = {
    ...spec.learn,
    tradeoffs: spec.learn.tradeoffs ?? "Choose this technique when its invariants match the problem; otherwise prefer a simpler or more appropriate pattern.",
  };
  const practiceProblemIds = spec.practiceProblemIds ?? [];
  return {
    id: `${moduleSlug}--${slug}`,
    moduleSlug,
    slug,
    title: spec.title,
    estimatedMinutes: spec.minutes,
    visualizer: spec.visualizer ?? "none",
    practiceProblemIds,
    completion: spec.completion,
    learn,
    examples: spec.examples,
    complexity: spec.complexity,
    practice: {
      ...spec.practice,
      linkedProblemIds: practiceProblemIds,
    },
    review: spec.review,
  };
}
