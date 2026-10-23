import type { DsaLessonContent, QuizQuestion, VisualizerKind } from "../types";

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What is the main idea of this lesson?",
    options: [
      { id: "a", label: "Apply the concept to structured inputs with clear invariants" },
      { id: "b", label: "Memorize syntax without tracing examples" },
      { id: "c", label: "Skip edge cases to save time" },
    ],
    correctOptionId: "a",
    explanation: "DSA fluency comes from invariants, tracing, and edge-case discipline.",
  },
];

export function buildStubLesson(
  moduleSlug: string,
  slug: string,
  title: string,
  minutes: number,
  visualizer: VisualizerKind = "none",
  practiceProblemIds: string[] = []
): DsaLessonContent {
  const id = `${moduleSlug}--${slug}`;
  return {
    id,
    moduleSlug,
    slug,
    title,
    estimatedMinutes: minutes,
    visualizer,
    practiceProblemIds,
    completion: { type: "quiz", quiz: DEFAULT_QUIZ, minQuizScore: 1 },
    learn: {
      hook: `Why does "${title}" matter in real programs and interviews?`,
      objectives: [
        `Explain ${title.toLowerCase()} in your own words.`,
        "Trace a small example by hand.",
        "State when the technique applies and when it does not.",
      ],
      whenUseful: "Use this when the problem structure matches the lesson pattern and constraints allow it.",
      mentalModel: "Treat the algorithm as maintaining a clear invariant while you transform the input.",
      terminology: [
        { term: "Invariant", definition: "A condition that stays true while the algorithm progresses." },
        { term: "Trace", definition: "Step through a tiny input and record variable changes." },
      ],
      commonMistakes: [
        "Jumping to code before tracing a minimal example.",
        "Ignoring empty or single-element inputs.",
      ],
      summary: `${title}: know the pattern, trace once, then implement carefully.`,
    },
    examples: {
      title: "Mini trace",
      input: "Small handcrafted input (see lesson narrative).",
      steps: ["Initialize variables.", "Apply the core operation once per step.", "Stop when the goal is met."],
      output: "Expected result with a one-line justification.",
      why: "Each step preserves the invariant until the answer is produced.",
    },
    complexity: {
      time: "Depends on input size n (typical lessons: O(n) to O(n log n)).",
      auxiliarySpace: "Often O(1) to O(n) extra structures.",
      explanation: "Count dominant operations and extra memory allocated beyond the input.",
      measured: "Auxiliary space excludes the input itself unless stated otherwise.",
    },
    practice: {
      warmup: "Predict the output of a 3-element trace before coding.",
      conceptCheck: "Write the invariant in one sentence.",
      linkedProblemIds: practiceProblemIds,
      difficultyLabel: practiceProblemIds.length ? "easy–medium" : "conceptual",
    },
    review: {
      takeaways: [`${title} is a reusable pattern, not a one-off trick.`],
      misconceptions: ["Bigger inputs do not forgive missing base cases."],
    },
  };
}
