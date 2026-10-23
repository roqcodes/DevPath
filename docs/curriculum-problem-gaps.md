# Curriculum ↔ question bank coverage (Phase 5)

Published problem IDs (11 total): `array-sum`, `two-sum`, `reverse-string`, `char-frequency`, `binary-search-index`, `valid-parentheses`, `max-subarray`, `factorial-n`, `simulate-queue`, `sorted-two-sum`, `list-max-value`.

## Lessons with judged practice links

| Problem ID | Lesson(s) |
|------------|-----------|
| `array-sum` | foundations--arrays-indexing, arrays-strings--traversal-mutation |
| `two-sum` | arrays-strings--two-pointers, hashing--pair-sum-patterns, interview-prep--brute-to-optimal |
| `reverse-string` | foundations--strings-characters |
| `char-frequency` | arrays-strings--frequency-counting, hashing--frequency-maps, interview-prep--timed-practice |
| `binary-search-index` | search-sort--binary-search-invariants, interview-prep--timed-practice, interview-prep--edge-discipline (example) |
| `valid-parentheses` | stacks-queues--valid-parentheses, interview-prep--mixed-topics |
| `max-subarray` | arrays-strings--min-max-aggregates, dynamic-programming--one-d-dp, interview-prep--mixed-topics |
| `factorial-n` | recursion-backtracking--base-cases, interview-prep--timed-practice |
| `simulate-queue` | stacks-queues--queue-deque |
| `sorted-two-sum` | search-sort--sorting-problems, interview-prep--mixed-topics |
| `list-max-value` | linked-lists--traversal-insertion |

## Recommended future bank additions (no invented IDs)

Topics with **sandbox / concept checks only** until new problems ship:

- **Linked lists:** reversal, merge, cycle detection (dedicated list node problems)
- **Graphs:** BFS/DFS on grids, shortest path (beyond conceptual lessons)
- **Greedy:** interval scheduling, coin change (arbitrary denominations)
- **DP:** LIS, LCS, knapsack, grid unique paths
- **Trees/heaps:** BST validate, level-order, heap operations
- **Backtracking:** subsets, permutations, N-queens
- **Monotonic stack / NGE** dedicated problems
- **Prefix sums / sliding window** beyond `sorted-two-sum` and array lessons

## Validation

`npm test` runs `src/lib/curriculum/curriculum.test.ts`, which asserts all 89 lessons have non-stub content and all `practiceProblemIds` resolve to the published catalog.
