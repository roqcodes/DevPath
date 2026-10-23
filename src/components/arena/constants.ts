export interface ArenaBoss {
  id: string;
  roundId: string;
  name: string;
  title: string;
  topic: string;
  tagline: string;
  accent: "indigo" | "cyan" | "amber";
}

export const ARENA_BOSSES: ArenaBoss[] = [
  {
    id: "array-sentinel",
    roundId: "arena-r1-arrays",
    name: "Array Sentinel",
    title: "Gatekeeper of Index Zero",
    topic: "Arrays & Hashing",
    tagline: "Two pointers or a hash map — pick your weapon.",
    accent: "indigo",
  },
  {
    id: "graph-warden",
    roundId: "arena-r2-graphs",
    name: "Graph Warden",
    title: "Keeper of the Adjacency List",
    topic: "Graphs (BFS/DFS)",
    tagline: "Every edge has a story. Tell me how you traverse it.",
    accent: "cyan",
  },
  {
    id: "dp-dragon",
    roundId: "arena-r3-dp",
    name: "DP Dragon",
    title: "Hoarder of Overlapping Subproblems",
    topic: "Dynamic Programming",
    tagline: "State, transition, base case — in that order.",
    accent: "amber",
  },
];

export const MAX_ROUND_SCORE = 10;
