/**
 * Registry of lesson code snippets intended to be executable (not illustrative pseudocode).
 * Automated tests may run Python entries when `python` is on PATH; otherwise they are marked static-only.
 */
export interface ExecutableExample {
  id: string;
  lessonId: string;
  language: "python";
  code: string;
  expectedStdout: string;
  notes?: string;
}

export const EXECUTABLE_EXAMPLES: ExecutableExample[] = [
  {
    id: "array-sum-ref",
    lessonId: "foundations--arrays-indexing",
    language: "python",
    code: `import sys
lines = sys.stdin.read().strip().split()
n = int(lines[0])
nums = list(map(int, lines[1:1+n]))
print(sum(nums))
`,
    expectedStdout: "6",
    notes: "Matches published array-sum reference solution shape.",
  },
];

export function listExecutableExamples(): ExecutableExample[] {
  return EXECUTABLE_EXAMPLES;
}
