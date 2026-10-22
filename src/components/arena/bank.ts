/** Arena boss roster + local interview question bank. Owner: Agent B. */

export type BossId = "warden" | "hydra" | "oracle";
export type RoundKind = "concept" | "complexity" | "approach";

export interface RubricPoint {
  /** Human-readable rubric line (sent to the AI grader as-is). */
  point: string;
  /** Lowercase keyword alternatives used by the local grader. */
  keys: string[];
}

export interface ArenaQuestion {
  id: string;
  kind: RoundKind;
  prompt: string;
  rubric: RubricPoint[];
}

export interface Boss {
  id: BossId;
  name: string;
  epithet: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hp: number;
  /** Tailwind gradient for the boss portrait */
  tint: string;
  taunt: string;
  defeatLine: string;
  study: string[];
  questions: Record<RoundKind, ArenaQuestion[]>;
}

export const ROUND_META: Record<RoundKind, { label: string; hint: string }> = {
  concept: { label: "Concept", hint: "Define it, then say why it matters." },
  complexity: { label: "Complexity & trade-offs", hint: "Name the Big-O, then the cost you pay for it." },
  approach: { label: "Approach a problem", hint: "Brute force first, then optimise. Walk an example." },
};

export const ROUND_ORDER: RoundKind[] = ["concept", "complexity", "approach"];

export const BOSSES: Boss[] = [
  {
    id: "warden",
    name: "The Array Warden",
    epithet: "Keeper of contiguous memory",
    topic: "Arrays & Hashing",
    difficulty: "Easy",
    hp: 200,
    tint: "from-cyan-400 to-sky-600",
    taunt: "Every index is guarded. Show me you know what lives at each one.",
    defeatLine: "The Warden keeps the keys for now.",
    study: ["Hash map internals and collisions", "Two-pointer and sliding-window patterns", "Prefix sums"],
    questions: {
      concept: [
        {
          id: "w-c1",
          kind: "concept",
          prompt: "How does a hash map achieve average O(1) lookup, and what happens when two keys collide?",
          rubric: [
            { point: "Hash function maps key to a bucket index", keys: ["hash function", "bucket", "index", "modulo", "%"] },
            { point: "Collision handling: chaining or open addressing", keys: ["chaining", "linked list", "open addressing", "probing", "linear probe"] },
            { point: "Load factor triggers resize / rehash", keys: ["load factor", "resize", "rehash", "double"] },
            { point: "Worst case degrades to O(n)", keys: ["worst", "o(n)", "degrade", "all collide"] },
          ],
        },
        {
          id: "w-c2",
          kind: "concept",
          prompt: "What is the difference between a static array and a dynamic array (like ArrayList or Python list)?",
          rubric: [
            { point: "Static arrays have fixed size set at allocation", keys: ["fixed", "allocation", "static"] },
            { point: "Dynamic arrays grow by allocating a bigger block and copying", keys: ["copy", "grow", "double", "reallocate", "resize"] },
            { point: "Append is amortized O(1)", keys: ["amortized", "amortised"] },
            { point: "Both give O(1) random access via contiguous memory", keys: ["contiguous", "random access", "o(1) access", "index"] },
          ],
        },
        {
          id: "w-c3",
          kind: "concept",
          prompt: "Explain the sliding window technique and when you would reach for it.",
          rubric: [
            { point: "Maintain a window over a contiguous subarray/substring", keys: ["window", "contiguous", "subarray", "substring"] },
            { point: "Expand right, shrink left while a condition holds", keys: ["shrink", "expand", "left", "right pointer", "two pointer"] },
            { point: "Turns O(n^2) or O(n*k) into O(n)", keys: ["o(n)", "linear", "instead of"] },
            { point: "Concrete example (longest substring, max sum of k)", keys: ["longest", "maximum sum", "k elements", "substring without"] },
          ],
        },
      ],
      complexity: [
        {
          id: "w-x1",
          kind: "complexity",
          prompt: "Two Sum: compare the brute-force, sort + two pointers, and hash map approaches in time and space.",
          rubric: [
            { point: "Brute force is O(n^2) time, O(1) space", keys: ["o(n^2)", "o(n2)", "nested", "quadratic"] },
            { point: "Sorting + two pointers is O(n log n), loses original indices", keys: ["n log n", "nlogn", "sort", "indices"] },
            { point: "Hash map is O(n) time, O(n) space", keys: ["o(n) space", "hash", "map", "extra space"] },
            { point: "States the trade-off: memory for speed", keys: ["trade", "memory", "space for time", "cost"] },
          ],
        },
        {
          id: "w-x2",
          kind: "complexity",
          prompt: "Why is inserting at the front of an array O(n) while appending is amortized O(1)? When would you choose a linked list instead?",
          rubric: [
            { point: "Front insert shifts every element", keys: ["shift", "move every", "each element"] },
            { point: "Append amortized via geometric growth", keys: ["amortized", "amortised", "double", "occasional"] },
            { point: "Linked list gives O(1) insert at known node", keys: ["linked list", "pointer", "o(1) insert", "node"] },
            { point: "Trade-off: cache locality and O(n) access for lists", keys: ["cache", "locality", "random access", "o(n) access"] },
          ],
        },
        {
          id: "w-x3",
          kind: "complexity",
          prompt: "Prefix sums: what do they cost to build, what do they buy you, and when are they the wrong tool?",
          rubric: [
            { point: "O(n) build, O(n) extra space", keys: ["o(n)", "build", "extra"] },
            { point: "O(1) range-sum queries via prefix[r] - prefix[l-1]", keys: ["range", "o(1)", "subtract", "prefix[r]"] },
            { point: "Bad fit with frequent updates (use Fenwick/segment tree)", keys: ["update", "fenwick", "segment tree", "bit"] },
          ],
        },
      ],
      approach: [
        {
          id: "w-a1",
          kind: "approach",
          prompt: "Given an array of strings, group the anagrams together. Explain your approach.",
          rubric: [
            { point: "Canonical key: sorted string or 26-count signature", keys: ["sort", "sorted", "count", "frequency", "signature", "key"] },
            { point: "Hash map from key to list of words", keys: ["hash", "map", "dictionary", "group"] },
            { point: "Complexity O(n * k log k) or O(n * k)", keys: ["k log k", "n * k", "n*k", "o(nk"] },
            { point: "Walks an example or edge case (empty string)", keys: ["example", "eat", "empty", "e.g"] },
          ],
        },
        {
          id: "w-a2",
          kind: "approach",
          prompt: "Find the length of the longest substring without repeating characters.",
          rubric: [
            { point: "Sliding window with left/right pointers", keys: ["window", "left", "right", "two pointer"] },
            { point: "Set or last-seen index map to detect repeats", keys: ["set", "last seen", "map", "index"] },
            { point: "Jump/shrink left past the duplicate", keys: ["shrink", "move left", "jump", "max(left"] },
            { point: "O(n) time, O(min(n, charset)) space", keys: ["o(n)", "linear", "charset", "alphabet"] },
          ],
        },
        {
          id: "w-a3",
          kind: "approach",
          prompt: "Return the k most frequent elements of an integer array, better than O(n log n).",
          rubric: [
            { point: "Count frequencies with a hash map", keys: ["count", "frequency", "hash", "map"] },
            { point: "Min-heap of size k or bucket sort by frequency", keys: ["heap", "bucket", "priority queue"] },
            { point: "Complexity O(n log k) or O(n)", keys: ["n log k", "o(n)", "linear"] },
            { point: "Mentions ties or k == number of unique values", keys: ["tie", "unique", "edge"] },
          ],
        },
      ],
    },
  },
  {
    id: "hydra",
    name: "The Recursion Hydra",
    epithet: "Cut one call, two more return",
    topic: "Recursion & Trees",
    difficulty: "Medium",
    hp: 200,
    tint: "from-emerald-400 to-teal-700",
    taunt: "Every head is a subproblem. Forget the base case and I grow forever.",
    defeatLine: "The Hydra lives to fight another day.",
    study: ["Base cases and the call stack", "DFS vs BFS on trees", "BST invariants and balancing"],
    questions: {
      concept: [
        {
          id: "h-c1",
          kind: "concept",
          prompt: "What makes a recursive function correct? Talk about base cases and the call stack.",
          rubric: [
            { point: "Base case that stops recursion", keys: ["base case", "stop", "terminate"] },
            { point: "Each call makes progress toward the base case", keys: ["smaller", "progress", "reduce", "subproblem"] },
            { point: "Call stack frames hold local state", keys: ["call stack", "stack frame", "frame", "stack"] },
            { point: "Risk of stack overflow on deep recursion", keys: ["overflow", "depth", "too deep", "recursion limit"] },
          ],
        },
        {
          id: "h-c2",
          kind: "concept",
          prompt: "Explain the three depth-first traversals of a binary tree and when each is useful.",
          rubric: [
            { point: "Preorder: node, left, right (copy/serialize)", keys: ["preorder", "pre-order", "serialize", "copy"] },
            { point: "Inorder: left, node, right (sorted order in BST)", keys: ["inorder", "in-order", "sorted"] },
            { point: "Postorder: left, right, node (delete/evaluate)", keys: ["postorder", "post-order", "delete", "evaluate", "height"] },
            { point: "Recursive or explicit-stack implementation", keys: ["stack", "iterative", "recursive"] },
          ],
        },
        {
          id: "h-c3",
          kind: "concept",
          prompt: "What is the BST property, and why does balance matter?",
          rubric: [
            { point: "Left subtree < node < right subtree", keys: ["left", "smaller", "less than", "greater"] },
            { point: "Search/insert is O(h)", keys: ["o(h)", "height"] },
            { point: "Unbalanced degrades to O(n) (like a linked list)", keys: ["o(n)", "linked list", "skewed", "degenerate"] },
            { point: "Self-balancing trees keep O(log n) (AVL, red-black)", keys: ["avl", "red-black", "red black", "log n", "balanced"] },
          ],
        },
      ],
      complexity: [
        {
          id: "h-x1",
          kind: "complexity",
          prompt: "Naive recursive Fibonacci: what is its time complexity, why, and how do you fix it?",
          rubric: [
            { point: "Exponential O(2^n) / O(phi^n)", keys: ["2^n", "exponential", "phi"] },
            { point: "Overlapping subproblems recomputed", keys: ["overlap", "recompute", "same subproblem", "repeated"] },
            { point: "Memoization or bottom-up gives O(n)", keys: ["memo", "cache", "bottom-up", "o(n)", "tabulation"] },
            { point: "Space: O(n) stack, or O(1) with two variables", keys: ["o(1)", "two variables", "stack space", "space"] },
          ],
        },
        {
          id: "h-x2",
          kind: "complexity",
          prompt: "BFS vs DFS on a tree: compare time and space, and when you'd pick each.",
          rubric: [
            { point: "Both O(n) time", keys: ["o(n)", "every node", "linear"] },
            { point: "DFS space O(h); BFS space O(w) (widest level)", keys: ["o(h)", "height", "width", "o(w)", "level"] },
            { point: "BFS for shortest path / level-order", keys: ["shortest", "level order", "level-order", "nearest"] },
            { point: "DFS for path problems / exhaustive search", keys: ["path", "backtrack", "exhaustive", "all paths"] },
          ],
        },
        {
          id: "h-x3",
          kind: "complexity",
          prompt: "Generating all subsets of n elements: what's the complexity, and why can't you beat it?",
          rubric: [
            { point: "2^n subsets", keys: ["2^n", "2 ^ n", "power set", "exponential"] },
            { point: "O(n * 2^n) including copying each subset", keys: ["n * 2^n", "n*2^n", "copy", "n 2^n"] },
            { point: "Output size is a lower bound", keys: ["output", "lower bound", "must produce", "can't beat", "cannot"] },
            { point: "Include/exclude decision per element", keys: ["include", "exclude", "choice", "backtrack"] },
          ],
        },
      ],
      approach: [
        {
          id: "h-a1",
          kind: "approach",
          prompt: "Find the lowest common ancestor of two nodes in a binary tree (not a BST).",
          rubric: [
            { point: "Recursive DFS returning found node or null", keys: ["recurs", "dfs", "return", "null"] },
            { point: "If both sides return non-null, current node is LCA", keys: ["both", "left and right", "non-null", "current node"] },
            { point: "Base case: null or node equals p or q", keys: ["base case", "equals", "== p", "is p"] },
            { point: "O(n) time, O(h) space", keys: ["o(n)", "o(h)"] },
          ],
        },
        {
          id: "h-a2",
          kind: "approach",
          prompt: "Validate whether a binary tree is a valid BST.",
          rubric: [
            { point: "Pass min/max bounds down the recursion", keys: ["bound", "min", "max", "range", "low", "high"] },
            { point: "Or inorder traversal must be strictly increasing", keys: ["inorder", "in-order", "increasing", "sorted"] },
            { point: "Pitfall: only checking immediate children is wrong", keys: ["children", "only parent", "pitfall", "not enough", "subtree"] },
            { point: "O(n) time, O(h) space", keys: ["o(n)", "o(h)"] },
          ],
        },
        {
          id: "h-a3",
          kind: "approach",
          prompt: "Generate all valid combinations of n pairs of parentheses.",
          rubric: [
            { point: "Backtracking building the string char by char", keys: ["backtrack", "recurs", "build"] },
            { point: "Add '(' while open < n; add ')' while close < open", keys: ["open < n", "close < open", "open", "close"] },
            { point: "Base case: length 2n", keys: ["2n", "length", "base case"] },
            { point: "Complexity relates to Catalan numbers", keys: ["catalan", "4^n"] },
          ],
        },
      ],
    },
  },
  {
    id: "oracle",
    name: "The DP Oracle",
    epithet: "Remembers every answer you forgot",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    hp: 200,
    tint: "from-amber-400 to-rose-600",
    taunt: "I have seen this subproblem before. Have you?",
    defeatLine: "The Oracle keeps its secrets, for now.",
    study: ["Defining state and transitions", "Top-down memo vs bottom-up tables", "Classic patterns: knapsack, LIS, LCS"],
    questions: {
      concept: [
        {
          id: "o-c1",
          kind: "concept",
          prompt: "What two properties must a problem have for dynamic programming to apply?",
          rubric: [
            { point: "Optimal substructure", keys: ["optimal substructure", "substructure"] },
            { point: "Overlapping subproblems", keys: ["overlapping", "overlap", "repeated subproblem"] },
            { point: "Contrast with divide and conquer (no overlap)", keys: ["divide and conquer", "merge sort", "no overlap"] },
            { point: "Concrete example", keys: ["fibonacci", "knapsack", "coin", "example", "e.g"] },
          ],
        },
        {
          id: "o-c2",
          kind: "concept",
          prompt: "Compare top-down memoization with bottom-up tabulation.",
          rubric: [
            { point: "Top-down: recursion + cache, computes only needed states", keys: ["recurs", "cache", "memo", "only needed", "lazy"] },
            { point: "Bottom-up: iterate states in dependency order", keys: ["iterat", "table", "order", "bottom-up", "loop"] },
            { point: "Bottom-up avoids stack overflow, enables space optimisation", keys: ["stack", "overflow", "rolling", "space optim"] },
            { point: "Same asymptotic time in most cases", keys: ["same time", "same complexity", "both o(", "asymptotic"] },
          ],
        },
        {
          id: "o-c3",
          kind: "concept",
          prompt: "How do you define the state for a DP problem? Use an example.",
          rubric: [
            { point: "State = minimal info to describe a subproblem", keys: ["state", "subproblem", "dp[i]", "parameters"] },
            { point: "Transition / recurrence between states", keys: ["transition", "recurrence", "depends on", "dp[i-1]"] },
            { point: "Base cases", keys: ["base case", "dp[0]", "initial"] },
            { point: "Worked example", keys: ["example", "e.g", "climbing", "coin", "knapsack"] },
          ],
        },
      ],
      complexity: [
        {
          id: "o-x1",
          kind: "complexity",
          prompt: "0/1 knapsack: time and space of the standard DP, and how you'd cut the space.",
          rubric: [
            { point: "O(n * W) time", keys: ["n * w", "n*w", "nw", "o(n w"] },
            { point: "O(n * W) table, reducible to O(W)", keys: ["o(w)", "1d", "one row", "rolling"] },
            { point: "Iterate capacity backwards in the 1D version", keys: ["backward", "reverse", "right to left", "descending"] },
            { point: "Pseudo-polynomial: depends on W's value", keys: ["pseudo", "value of w", "polynomial"] },
          ],
        },
        {
          id: "o-x2",
          kind: "complexity",
          prompt: "Longest increasing subsequence: compare the O(n^2) DP with the O(n log n) approach.",
          rubric: [
            { point: "O(n^2): dp[i] = 1 + max dp[j] for j < i, a[j] < a[i]", keys: ["n^2", "dp[j]", "j < i", "quadratic"] },
            { point: "O(n log n): tails array + binary search", keys: ["binary search", "tails", "n log n", "patience"] },
            { point: "Tails array is not the actual subsequence", keys: ["not the actual", "not the subsequence", "reconstruct", "parent"] },
            { point: "Trade-off: simplicity vs speed", keys: ["simpler", "trade", "easier"] },
          ],
        },
        {
          id: "o-x3",
          kind: "complexity",
          prompt: "Coin change (fewest coins): why does greedy fail, and what does the DP cost?",
          rubric: [
            { point: "Greedy fails for non-canonical coins (e.g. 1,3,4 for 6)", keys: ["greedy", "1, 3, 4", "1,3,4", "counter", "fail"] },
            { point: "dp[a] = 1 + min dp[a - c]", keys: ["min", "dp[a", "dp[amount", "dp[i - c", "dp[i-c"] },
            { point: "O(amount * coins) time, O(amount) space", keys: ["amount *", "o(a", "amount", "o(n * m)"] },
            { point: "Handles unreachable amounts (infinity / -1)", keys: ["infinity", "-1", "unreachable", "impossible"] },
          ],
        },
      ],
      approach: [
        {
          id: "o-a1",
          kind: "approach",
          prompt: "House Robber: maximise loot from houses in a row without robbing two adjacent ones.",
          rubric: [
            { point: "State dp[i] = best up to house i", keys: ["dp[i]", "best up to", "max up to", "state"] },
            { point: "dp[i] = max(dp[i-1], dp[i-2] + nums[i])", keys: ["max(", "i-2", "i - 2", "skip"] },
            { point: "Space optimised to two variables", keys: ["two variables", "o(1)", "prev"] },
            { point: "Edge cases: 0 or 1 house", keys: ["empty", "one house", "edge", "single"] },
          ],
        },
        {
          id: "o-a2",
          kind: "approach",
          prompt: "Edit distance between two strings: explain the DP.",
          rubric: [
            { point: "dp[i][j] = cost to convert prefixes", keys: ["dp[i][j]", "prefix", "first i"] },
            { point: "Insert, delete, replace transitions", keys: ["insert", "delete", "replace", "substitut"] },
            { point: "Base row/column = i or j", keys: ["base", "dp[0]", "row", "column"] },
            { point: "O(m * n) time; O(min(m, n)) space possible", keys: ["m * n", "m*n", "o(mn", "two rows", "o(min"] },
          ],
        },
        {
          id: "o-a3",
          kind: "approach",
          prompt: "Word Break: can a string be segmented into words from a dictionary?",
          rubric: [
            { point: "dp[i] = prefix of length i is segmentable", keys: ["dp[i]", "prefix", "segment"] },
            { point: "Check dp[j] && s[j:i] in dict", keys: ["dp[j]", "in dict", "substring", "set"] },
            { point: "Use a hash set for dictionary lookups", keys: ["hash set", "set", "lookup"] },
            { point: "O(n^2) checks (times substring cost)", keys: ["n^2", "o(n2", "quadratic", "n * l"] },
          ],
        },
      ],
    },
  },
];

export function getBoss(id: BossId): Boss {
  return BOSSES.find((b) => b.id === id) ?? BOSSES[0];
}

/** Pick one question per round, avoiding the last set where possible. */
export function pickRounds(boss: Boss, avoid: string[] = []): ArenaQuestion[] {
  return ROUND_ORDER.map((kind) => {
    const pool = boss.questions[kind];
    const fresh = pool.filter((q) => !avoid.includes(q.id));
    const from = fresh.length ? fresh : pool;
    return from[Math.floor(Math.random() * from.length)];
  });
}
