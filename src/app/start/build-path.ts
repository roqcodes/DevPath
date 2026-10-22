import { DSA_SYLLABUS } from "@/lib/data/dsa-syllabus";

export type Goal = "placement" | "coursework" | "competitive" | "general";
export type Level = "new" | "basics" | "comfortable";
export type Language = "python" | "java" | "cpp" | "javascript";

export interface StartAnswers {
  goal: Goal;
  level: Level;
  minutesPerDay: number;
  language: Language;
}

export interface PathStep {
  moduleSlug: string;
  title: string;
  why: string;
  minutes: number;
  href: string;
  lessonTitle: string;
}

export interface PersonalPath {
  title: string;
  summary: string;
  steps: PathStep[];
  firstLessonHref: string;
  firstLessonTitle: string;
}

const BASE: Record<Level, string[]> = {
  new: ["foundations", "arrays-strings", "hashing", "search-sort", "stacks-queues", "linked-lists", "recursion-backtracking"],
  basics: ["arrays-strings", "hashing", "search-sort", "stacks-queues", "recursion-backtracking", "trees-heaps", "dynamic-programming"],
  comfortable: ["hashing", "recursion-backtracking", "trees-heaps", "graphs", "greedy", "dynamic-programming"],
};

const GOAL_TAIL: Record<Goal, string[]> = {
  placement: ["interview-prep"],
  coursework: ["linked-lists", "trees-heaps"],
  competitive: ["graphs", "greedy", "dynamic-programming"],
  general: ["trees-heaps"],
};

const WHY: Record<string, Partial<Record<Goal | "default", string>>> = {
  foundations: { default: "Loops, arrays and Big-O in plain language, so nothing later feels like magic." },
  "arrays-strings": {
    default: "Most problems are arrays in disguise. Two pointers and sliding windows start here.",
    placement: "Two pointers and sliding windows show up in a huge share of interview rounds.",
  },
  hashing: {
    default: "Turns O(n²) searches into O(n). The single most reusable trick you'll learn.",
    placement: "Two Sum-style questions are the classic phone-screen opener.",
  },
  "search-sort": { default: "Binary search invariants are where off-by-one bugs go to die." },
  "stacks-queues": { default: "Parentheses, monotonic stacks, BFS queues: small structures, big payoff." },
  "linked-lists": {
    default: "Pointer manipulation builds the mental model trees and graphs depend on.",
    coursework: "A staple of DSA exams: reversal, cycles, merging.",
  },
  "recursion-backtracking": { default: "Learn to trust the call stack. Subsets and permutations follow naturally." },
  "trees-heaps": {
    default: "DFS/BFS on trees plus heaps for top-K: core for every exam and interview.",
    coursework: "Traversals and BSTs are near-guaranteed exam questions.",
  },
  graphs: {
    default: "BFS, DFS, topological sort and Dijkstra unlock a whole class of problems.",
    competitive: "Graphs dominate contest mid-tier problems. Union-find is a cheat code.",
  },
  greedy: { default: "Know when the locally best choice is globally right, and how to prove it." },
  "dynamic-programming": {
    default: "States and transitions, from 1-D to knapsack. The topic that separates levels.",
    competitive: "DP is the contest skill ceiling. We build it from recurrences up.",
    placement: "Expect at least one DP question in on-site rounds.",
  },
  "interview-prep": { default: "Pattern recognition and timed rounds, then a mock with the Arena boss." },
};

function stepMinutes(lessons: { estimatedMinutes: number }[]): number {
  return lessons.reduce((n, l) => n + l.estimatedMinutes, 0);
}

export function buildPath(a: StartAnswers): PersonalPath {
  const order: string[] = [];
  for (const slug of [...BASE[a.level], ...GOAL_TAIL[a.goal]]) if (!order.includes(slug)) order.push(slug);
  const picked = order.slice(0, a.goal === "placement" ? 7 : 8);
  if (a.goal === "placement" && !picked.includes("interview-prep")) picked[picked.length - 1] = "interview-prep";

  const steps: PathStep[] = picked
    .map((slug) => DSA_SYLLABUS.find((m) => m.slug === slug))
    .filter((m): m is (typeof DSA_SYLLABUS)[number] => !!m && m.lessons.length > 0)
    .slice(0, 8)
    .map((m) => {
      const why = WHY[m.slug]?.[a.goal] ?? WHY[m.slug]?.default ?? m.description;
      return {
        moduleSlug: m.slug,
        title: m.title,
        why,
        minutes: stepMinutes(m.lessons),
        href: `/learn/${m.slug}/${m.lessons[0].slug}`,
        lessonTitle: m.lessons[0].title,
      };
    });

  const goalLine: Record<Goal, string> = {
    placement: "Placement-ready",
    coursework: "Coursework mastery",
    competitive: "Contest track",
    general: "Problem-solver",
  };
  const totalMin = steps.reduce((n, s) => n + s.minutes, 0);
  const days = Math.max(1, Math.round(totalMin / Math.max(5, a.minutesPerDay)));
  const weeks = Math.max(1, Math.round(days / 7));

  return {
    title: `${goalLine[a.goal]} path`,
    summary: `${steps.length} stops, about ${weeks} week${weeks === 1 ? "" : "s"} at ${a.minutesPerDay} minutes a day. Kip adapts it as you go.`,
    steps,
    firstLessonHref: steps[0]?.href ?? "/learn",
    firstLessonTitle: steps[0]?.lessonTitle ?? "First lesson",
  };
}
