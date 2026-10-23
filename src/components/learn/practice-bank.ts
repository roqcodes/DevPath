import type { PracticeItem } from "./practice-types";

/** Hand-authored micro-practice keyed by curriculum module slug. */
const BY_MODULE: Record<string, PracticeItem[]> = {
  foundations: [
    {
      id: "foundations-mcq-1",
      kind: "mcq",
      topic: "foundations",
      prompt: "What is the time complexity of scanning an array of n elements once?",
      options: [
        { id: "a", label: "O(1)" },
        { id: "b", label: "O(n)" },
        { id: "c", label: "O(n log n)" },
      ],
      correctOptionId: "b",
      explanation: "A single pass touches each element once → linear time.",
      hint: "Count how many times work grows with n.",
    },
    {
      id: "foundations-predict-1",
      kind: "predict",
      topic: "foundations",
      prompt: "What prints?",
      code: "for i in range(3):\n    print(i)",
      options: [
        { id: "a", label: "0 1 2" },
        { id: "b", label: "1 2 3" },
        { id: "c", label: "3" },
      ],
      correctOptionId: "a",
      explanation: "range(3) yields 0, 1, 2.",
    },
    {
      id: "foundations-fill-1",
      kind: "fill",
      topic: "foundations",
      prompt: "Binary search on a sorted array of n items runs in O(___) time.",
      template: "O(___)",
      blankLabel: "complexity",
      acceptedAnswers: ["log n", "logn", "n log n", "log(n)"],
      explanation: "Each step halves the search space → logarithmic.",
    },
  ],
  "arrays-strings": [
    {
      id: "arrays-mcq-1",
      kind: "mcq",
      topic: "arrays-strings",
      prompt: "Two pointers on a sorted array often help with…",
      options: [
        { id: "a", label: "Pair-sum / in-place partitioning" },
        { id: "b", label: "Hash collision resolution" },
        { id: "c", label: "Tree rotations" },
      ],
      correctOptionId: "a",
      explanation: "Sorted order lets pointers move inward based on sum vs target.",
    },
    {
      id: "arrays-order-1",
      kind: "order",
      topic: "arrays-strings",
      prompt: "Order the sliding-window steps for max sum of size k:",
      steps: [
        "Expand window until size k, track sum",
        "Slide: add entering element, remove leaving",
        "Update best answer when window is valid",
        "Return best",
      ],
      correctOrder: [0, 1, 2, 3],
      explanation: "Initialize, slide with O(1) updates, track max.",
    },
  ],
  hashing: [
    {
      id: "hash-mcq-1",
      kind: "mcq",
      topic: "hashing",
      prompt: "Average-case lookup in a hash map is…",
      options: [
        { id: "a", label: "O(1)" },
        { id: "b", label: "O(log n)" },
        { id: "c", label: "O(n)" },
      ],
      correctOptionId: "a",
      explanation: "With a good hash and load factor, expected constant time.",
    },
    {
      id: "hash-predict-1",
      kind: "predict",
      topic: "hashing",
      prompt: "After this loop, what is freq['a']?",
      code: "freq = {}\nfor ch in 'aba':\n    freq[ch] = freq.get(ch, 0) + 1",
      options: [
        { id: "a", label: "2" },
        { id: "b", label: "1" },
        { id: "c", label: "3" },
      ],
      correctOptionId: "a",
      explanation: "'a' appears twice in 'aba'.",
    },
  ],
  "search-sort": [
    {
      id: "search-mcq-1",
      kind: "mcq",
      topic: "search-sort",
      prompt: "Binary search requires the input to be…",
      options: [
        { id: "a", label: "Sorted" },
        { id: "b", label: "Unique" },
        { id: "c", label: "A power of two length" },
      ],
      correctOptionId: "a",
      explanation: "Monotonic order enables halving the range.",
    },
    {
      id: "search-fill-1",
      kind: "fill",
      topic: "search-sort",
      prompt: "Merge sort time complexity is O(___).",
      template: "O(___)",
      blankLabel: "complexity",
      acceptedAnswers: ["n log n", "nlogn", "n log(n)"],
      explanation: "Divide (log n levels) × merge O(n) per level.",
    },
  ],
  "linked-lists": [
    {
      id: "ll-mcq-1",
      kind: "mcq",
      topic: "linked-lists",
      prompt: "Deleting a known node in a singly linked list (given pointer to it) is…",
      options: [
        { id: "a", label: "O(1) if you have the predecessor" },
        { id: "b", label: "Always O(1) without predecessor" },
        { id: "c", label: "O(log n)" },
      ],
      correctOptionId: "a",
      explanation: "You must rewire the previous node's next pointer.",
    },
  ],
  "stacks-queues": [
    {
      id: "stack-order-1",
      kind: "order",
      topic: "stacks-queues",
      prompt: "Valid parentheses check with a stack:",
      steps: [
        "Push opening brackets",
        "On closing, pop and verify match",
        "If stack empty at end → valid",
        "On mismatch or pop empty → invalid",
      ],
      correctOrder: [0, 1, 3, 2],
      explanation: "Handle invalid cases during scan; empty stack at end means balanced.",
    },
    {
      id: "stack-mcq-1",
      kind: "mcq",
      topic: "stacks-queues",
      prompt: "BFS on a graph typically uses a…",
      options: [
        { id: "a", label: "Queue" },
        { id: "b", label: "Stack only" },
        { id: "c", label: "Priority queue always" },
      ],
      correctOptionId: "a",
      explanation: "FIFO queue processes nodes level by level.",
    },
  ],
  "recursion-backtracking": [
    {
      id: "rec-mcq-1",
      kind: "mcq",
      topic: "recursion-backtracking",
      prompt: "Memoization avoids…",
      options: [
        { id: "a", label: "Repeated subproblems" },
        { id: "b", label: "Base cases" },
        { id: "c", label: "Stack overflow always" },
      ],
      correctOptionId: "a",
      explanation: "Cache results of overlapping recursive calls.",
    },
  ],
  "trees-heaps": [
    {
      id: "tree-mcq-1",
      kind: "mcq",
      topic: "trees-heaps",
      prompt: "In-order traversal of a BST yields…",
      options: [
        { id: "a", label: "Sorted keys (if valid BST)" },
        { id: "b", label: "Level order" },
        { id: "c", label: "Random order" },
      ],
      correctOptionId: "a",
      explanation: "Left → node → right visits keys in ascending order.",
    },
  ],
  graphs: [
    {
      id: "graph-mcq-1",
      kind: "mcq",
      topic: "graphs",
      prompt: "BFS on an unweighted graph finds…",
      options: [
        { id: "a", label: "Shortest path in edge count" },
        { id: "b", label: "Minimum spanning tree" },
        { id: "c", label: "Topological order" },
      ],
      correctOptionId: "a",
      explanation: "First time you reach a node is via fewest edges.",
    },
  ],
  "dynamic-programming": [
    {
      id: "dp-mcq-1",
      kind: "mcq",
      topic: "dynamic-programming",
      prompt: "DP applies when subproblems…",
      options: [
        { id: "a", label: "Overlap and optimal substructure holds" },
        { id: "b", label: "Are always independent" },
        { id: "c", label: "Require sorting first" },
      ],
      correctOptionId: "a",
      explanation: "Reuse optimal solutions to smaller instances.",
    },
    {
      id: "dp-fill-1",
      kind: "fill",
      topic: "dynamic-programming",
      prompt: "1D Kadane's algorithm tracks the best subarray ending at index i in O(___) per step.",
      template: "O(___)",
      blankLabel: "complexity",
      acceptedAnswers: ["1", "constant", "o(1)"],
      explanation: "Only the running best and current sum are needed.",
    },
  ],
  greedy: [
    {
      id: "greedy-mcq-1",
      kind: "mcq",
      topic: "greedy",
      prompt: "A greedy algorithm picks…",
      options: [
        { id: "a", label: "Locally best choice each step" },
        { id: "b", label: "Random choices" },
        { id: "c", label: "Always brute force" },
      ],
      correctOptionId: "a",
      explanation: "Greedy needs a proof that local choices yield global optimum.",
    },
  ],
  "interview-prep": [
    {
      id: "int-mcq-1",
      kind: "mcq",
      topic: "interview-prep",
      prompt: "After a timed solve, the best review focuses on…",
      options: [
        { id: "a", label: "Pattern, missed edges, complexity" },
        { id: "b", label: "Variable names only" },
        { id: "c", label: "Skipping failed tests" },
      ],
      correctOptionId: "a",
      explanation: "Structured post-mortems convert speed into learning.",
    },
  ],
};

const FALLBACK: PracticeItem[] = [
  {
    id: "fallback-mcq-1",
    kind: "mcq",
    topic: "foundations",
    prompt: "Which notation describes growth rate of an algorithm?",
    options: [
      { id: "a", label: "Big-O" },
      { id: "b", label: "HTML" },
      { id: "c", label: "RGB" },
    ],
    correctOptionId: "a",
    explanation: "Asymptotic complexity uses Big-O.",
  },
  {
    id: "fallback-predict-1",
    kind: "predict",
    topic: "foundations",
    prompt: "What is len([1, 2, 3])?",
    code: "len([1, 2, 3])",
    options: [
      { id: "a", label: "3" },
      { id: "b", label: "2" },
      { id: "c", label: "6" },
    ],
    correctOptionId: "a",
    explanation: "Three elements in the list.",
  },
];

/** Two pointers share arrays module — extra deck slice for arrays track. */
const TWO_POINTERS_EXTRA: PracticeItem[] = [
  {
    id: "tp-mcq-1",
    kind: "mcq",
    topic: "arrays-strings",
    prompt: "In a sorted array, two pointers from both ends help find a target sum in…",
    options: [
      { id: "a", label: "O(n) time" },
      { id: "b", label: "O(n²) only" },
      { id: "c", label: "O(log n) only" },
    ],
    correctOptionId: "a",
    explanation: "Move the pointer that fixes the sum vs target.",
  },
];

export function practiceItemsForModule(moduleSlug: string): PracticeItem[] {
  const base = BY_MODULE[moduleSlug] ?? [];
  const items = [...base];
  if (moduleSlug === "arrays-strings") {
    items.push(...TWO_POINTERS_EXTRA);
  }
  if (items.length >= 2) return items.slice(0, 3);
  return [...items, ...FALLBACK].slice(0, 3);
}
