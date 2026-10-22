import type {
  AiGenerateRequest,
  AiGenerateResponse,
  GenerateKind,
  InterviewGradeData,
  InterviewGradeInput,
  InterviewRoundData,
} from "@/lib/companion/types";
import type { ArenaBoss } from "./constants";

const ROUND_FALLBACK: Record<string, InterviewRoundData> = {
  "array-sentinel": {
    question:
      "Given an integer array nums and an integer target, return indices of the two numbers that add up to target. You may assume each input has exactly one solution. Walk through your approach and complexity.",
    rubric: [
      "Mentions hash map (or sorting + two pointers) as the core idea",
      "States O(n) time for the hash-map approach",
      "Handles duplicate values correctly",
      "Returns indices, not values",
      "Mentions a single-pass vs two-pass tradeoff",
    ],
  },
  "graph-warden": {
    question:
      "You are given an undirected graph. How would you detect if it contains a cycle? Explain BFS and DFS options and when you would pick each.",
    rubric: [
      "Tracks visited nodes and parent/depth to detect back edges",
      "DFS recursion or explicit stack described clearly",
      "BFS with parent pointers or coloring mentioned",
      "States O(V + E) time and space",
      "Notes disconnected components need iteration over all nodes",
    ],
  },
  "dp-dragon": {
    question:
      "Explain how you would solve the classic coin change problem (minimum coins to make amount) with dynamic programming. Define state, transition, and base cases.",
    rubric: [
      "Defines dp[amount] or similar state meaning",
      "Iterates amounts and coins with min transition",
      "Base case dp[0] = 0 (or equivalent)",
      "Returns -1 or sentinel when impossible",
      "States pseudo-polynomial time O(amount × coins)",
    ],
  },
};

export function localInterviewRound(
  boss: ArenaBoss,
  _context: AiGenerateRequest["context"],
): InterviewRoundData {
  return ROUND_FALLBACK[boss.id] ?? {
    question: `Mock interview on ${boss.topic}: explain your favorite problem in this area and how you'd optimize it.`,
    rubric: [
      "Clear problem restatement",
      "Correct high-level algorithm",
      "Time complexity stated",
      "Space complexity stated",
      "Mentions at least one edge case",
    ],
  };
}

export function localInterviewGrade(input: InterviewGradeInput): InterviewGradeData {
  const answer = (input.answer ?? "").trim();
  const lower = answer.toLowerCase();
  let hits = 0;
  for (const point of input.rubric) {
    const tokens = point
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 4)
      .slice(0, 4);
    const matched = tokens.some((t) => lower.includes(t));
    if (matched || (answer.length > 120 && hits < input.rubric.length)) hits += 1;
  }
  if (answer.length < 40) hits = Math.min(hits, 1);
  const score = Math.max(1, Math.min(10, Math.round((hits / Math.max(1, input.rubric.length)) * 10)));
  const verdict =
    score >= 8
      ? "Strong answer — you'd advance this round."
      : score >= 5
        ? "Solid structure; tighten complexity and edge cases."
        : "Needs more depth — hit each rubric point explicitly.";
  return {
    score,
    verdict,
    strengths: score >= 6 ? ["You engaged with the core idea."] : ["You attempted the problem framing."],
    improvements:
      score >= 8
        ? ["Add one concrete example walkthrough."]
        : ["Map each rubric bullet to a sentence in your answer.", "State time and space complexity aloud."],
  };
}

export function localGenerate<K extends GenerateKind>(
  req: AiGenerateRequest,
  boss?: ArenaBoss,
): AiGenerateResponse<K> {
  if (req.kind === "interview_round" && boss) {
    return {
      source: "demo",
      data: localInterviewRound(boss, req.context),
    } as AiGenerateResponse<K>;
  }
  if (req.kind === "interview_grade") {
    const input = (req.input ?? {}) as InterviewGradeInput;
    return {
      source: "demo",
      data: localInterviewGrade(input),
    } as AiGenerateResponse<K>;
  }
  throw new Error(`Unsupported local generate kind: ${req.kind}`);
}
