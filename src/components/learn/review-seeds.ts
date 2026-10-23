import type { ReviewCard } from "@/lib/engine";

const SEED_CARDS: Omit<ReviewCard, "dueAt">[] = [
  {
    id: "seed:binary-search-complexity",
    front: "Time complexity of binary search on n elements?",
    back: "O(log n) — each step halves the search interval.",
    topic: "search-sort",
    sourceHref: "/learn/search-sort/binary-search-intuition",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
  {
    id: "seed:hash-lookup",
    front: "Average-case lookup in a hash map?",
    back: "O(1) expected; O(n) worst case with many collisions.",
    topic: "hashing",
    sourceHref: "/learn/hashing/hash-maps-sets",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
  {
    id: "seed:two-pointers",
    front: "When do two pointers on a sorted array shine?",
    back: "Pair-sum, in-place partitioning, and removing duplicates in O(n).",
    topic: "arrays-strings",
    sourceHref: "/learn/arrays-strings/two-pointers",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
  {
    id: "seed:bfs-vs-dfs",
    front: "BFS vs DFS on unweighted graphs — shortest path?",
    back: "BFS finds fewest edges; DFS does not guarantee shortest path.",
    topic: "graphs",
    sourceHref: "/learn/graphs/graph-bfs",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
  {
    id: "seed:stack-lifo",
    front: "What does LIFO mean for a stack?",
    back: "Last In, First Out — push/pop at the top.",
    topic: "stacks-queues",
    sourceHref: "/learn/stacks-queues/stack-fundamentals",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
  {
    id: "seed:dp-overlap",
    front: "When is dynamic programming appropriate?",
    back: "Overlapping subproblems + optimal substructure.",
    topic: "dynamic-programming",
    sourceHref: "/learn/dynamic-programming/overlapping-subproblems",
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
  },
];

export function foundationSeedCards(now = new Date()): ReviewCard[] {
  const dueAt = now.toISOString();
  return SEED_CARDS.map((c) => ({ ...c, dueAt }));
}
