/**
 * Scripted Kip responses when no API key is configured (demo / local dev).
 */

import type { AiMode, CompanionContext, GenerateKind, GenerateDataMap } from "@/lib/companion/types";
import { defaultUserTurn, kipLine } from "@/lib/companion/persona";

function subjectOf(context: CompanionContext): string {
  return context.subject?.trim() || "this topic";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Yield text in small chunks to mimic streaming. */
export async function* streamDemoText(full: string, chunkSize = 3): AsyncGenerator<string> {
  for (let i = 0; i < full.length; i += chunkSize) {
    yield full.slice(i, i + chunkSize);
    await sleep(12 + (i % 5) * 4);
  }
}

export function demoStreamText(mode: AiMode, context: CompanionContext, userMessage?: string): string {
  const s = subjectOf(context);
  const user = userMessage?.trim();

  switch (mode) {
    case "explain":
      return (
        `**${s}** in one line: you shrink the search space each step instead of scanning everything.\n\n` +
        `Why it works: you keep a **valid range** and discard half that cannot contain the answer.\n` +
        `Typical complexity: **O(log n)** time, **O(1)** extra space.\n\n` +
        `Quick check: what must be true about the input for the "discard half" step to stay correct?`
      );
    case "eli5":
      return (
        `Imagine a sorted stack of numbered plates and you're looking for plate **42**.\n\n` +
        `- Open in the **middle** — too high or too low?\n` +
        `- Throw away the half that can't contain 42.\n` +
        `- Repeat until you find it.\n\n` +
        `That's ${s}: each guess eliminates half the possibilities.`
      );
    case "deeper":
      return (
        `The invariant for ${s}: the answer always lies inside your current bounds.\n\n` +
        `What breaks naive versions: off-by-one on mid, duplicates (need lower/upper bound variants), or overflow on \`mid = (lo+hi)/2\`.\n\n` +
        `Neighbour: two pointers often solve "sorted array" problems when you need **pair** structure, not a single target index.`
      );
    case "example":
      return (
        `Small trace for ${s} — find \`5\` in \`[1,3,5,7,9]\`:\n\n` +
        `1. lo=0, hi=4, mid=2 → arr[2]=5 → found.\n\n` +
        `\`\`\`python\n` +
        `def search(nums, target):\n` +
        `    lo, hi = 0, len(nums) - 1\n` +
        `    while lo <= hi:\n` +
        `        mid = (lo + hi) // 2\n` +
        `        if nums[mid] == target: return mid\n` +
        `        if nums[mid] < target: lo = mid + 1\n` +
        `        else: hi = mid - 1\n` +
        `    return -1\n` +
        `\`\`\`\n\n` +
        `Time **O(log n)**, space **O(1)**.`
      );
    case "quiz":
      return `One question on ${s}:\n\nWhich condition is **required** for standard binary search on an array?\n\n(Answer in your own words — I won't grade you in demo mode.)`;
    case "socratic":
      return user
        ? `You said: "${user.slice(0, 120)}". What's the smallest fact you still need to prove before that step is safe?`
        : `Before we touch ${s}: what property of the data lets you throw away half the search space each time?`;
    case "hint":
      return `Hint for ${s}: write down the **loop invariant** in one sentence — what is always true about \`lo\` and \`hi\`?`;
    case "review":
      return (
        `Review snapshot for ${s}:\n\n` +
        `- Right: you're engaging with the idea instead of memorizing syntax.\n` +
        `- Fix: name the invariant before you code.\n` +
        `- Next: trace one example on paper with lo/hi/mid columns.`
      );
    case "briefing":
      return (
        `You're back on DevPath — no guilt about the gap.\n\n` +
        `Today's challenge: one **review card** or one **easy practice** problem to warm up the graph.\n` +
        `Your streak is a habit meter, not a report card. Want a 4-minute plan?`
      );
    case "interview":
      return `Interview mode on ${s}:\n\nDescribe how you'd find the first and last position of a target in a sorted array with duplicates. What's the complexity?`;
    case "chat":
      return user
        ? `On ${s}: ${user}\n\nIn demo mode I can't reach a live model — this is a scripted nudge. Set **OPENROUTER_API_KEY** or **AI_API_KEY** for real answers.`
        : `Ask me anything about ${s}. (Demo mode — connect an API key for live Kip.)`;
    default:
      return kipLine("idle_hint", "playful");
  }
}

export function demoGenerate<K extends GenerateKind>(kind: K, context: CompanionContext): GenerateDataMap[K] {
  const s = subjectOf(context);
  switch (kind) {
    case "quiz":
      return {
        questions: [
          {
            prompt: `What is the typical time complexity of ${s} on n elements?`,
            choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            answerIndex: 1,
            explanation: "Each step halves the remaining search space.",
          },
          {
            prompt: "Which precondition does classic binary search need?",
            choices: ["Sorted order", "Unique elements only", "Linked structure", "Hashable keys"],
            answerIndex: 0,
            explanation: "Monotonic order lets you discard a half safely.",
          },
          {
            prompt: "What is a common off-by-one bug?",
            choices: ["Using mid = (lo+hi)//2", "lo <= hi vs lo < hi", "Printing debug", "Using recursion"],
            answerIndex: 1,
            explanation: "Loop bounds must match your invariant.",
          },
        ],
      } as GenerateDataMap[K];
    case "path":
      return {
        title: `${s} — warm-up path`,
        summary: "Four focused steps from intuition to one practice problem.",
        steps: [
          { title: "Read the invariant", why: "Know what must stay true each loop.", minutes: 8 },
          { title: "Trace by hand", why: "Paper beats autopilot.", minutes: 12 },
          { title: "Code the template", why: "Muscle memory for interviews.", minutes: 15 },
          { title: "One variant problem", why: "Lower bound / upper bound twist.", minutes: 20 },
        ],
      } as GenerateDataMap[K];
    case "interview_round":
      return {
        question: `Implement ${s} and discuss edge cases (empty input, single element, target missing).`,
        rubric: [
          "States preconditions clearly",
          "Correct loop invariant",
          "O(log n) time argument",
          "Handles empty / single-element cases",
          "Clean, readable code",
        ],
      } as GenerateDataMap[K];
    case "interview_grade":
      return {
        score: 7,
        verdict: "Solid structure; tighten the complexity explanation.",
        strengths: ["Correct overall approach", "Good variable naming"],
        improvements: ["Mention duplicate handling", "Walk through one failing edge case aloud"],
      } as GenerateDataMap[K];
    default:
      throw new Error("unknown_kind");
  }
}

export function demoUserTurn(mode: AiMode, context: CompanionContext): string {
  return defaultUserTurn(mode, context);
}
