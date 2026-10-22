import type { SingleTestResult } from "./types";
import type { QuestionPackage, NormalizedVerdict } from "@/lib/questions/types";

export interface ClientTestFeedback {
  testId: string;
  passed: boolean;
  hidden?: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
  compileOutput?: string;
  runtimeMs?: number;
  memoryKb?: number;
}

export interface ClientJudgePayload {
  mode: "run" | "submit";
  runOnly: boolean;
  verdict: NormalizedVerdict;
  accepted: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs?: number;
  memoryKb?: number;
  message?: string;
  tests: ClientTestFeedback[];
  debugHint?: string;
}

export function buildClientTestFeedback(
  results: SingleTestResult[],
  executedTests: QuestionPackage["test_cases"],
  publicTestsOnly: boolean
): ClientTestFeedback[] {
  const byId = new Map(executedTests.map((t) => [t.id, t]));

  return results.map((r) => {
    const tc = byId.get(r.testId);
    const isPublic = tc?.is_public ?? publicTestsOnly;

    if (!isPublic && !publicTestsOnly) {
      return {
        testId: "hidden",
        passed: r.passed,
        hidden: true,
      };
    }

    return {
      testId: r.testId,
      passed: r.passed,
      input: tc?.input,
      expectedOutput: tc?.expected_output,
      actualOutput: r.stdout,
      stderr: r.stderr,
      compileOutput: r.compileOutput,
      runtimeMs: r.runtimeMs,
      memoryKb: r.memoryKb,
    };
  });
}

export function debugHintForVerdict(
  verdict: NormalizedVerdict,
  feedback: ClientTestFeedback[]
): string | undefined {
  if (verdict === "accepted") {
    return "All tests passed. On Submit, hidden tests must pass too before the problem counts as solved.";
  }
  if (verdict === "judge_unavailable") {
    return "The judge service is unavailable. Your code was not lost — try again later.";
  }
  if (verdict === "internal_error") {
    return "Something went wrong on our side. Retry in a moment; if it persists, contact support.";
  }
  if (verdict === "compilation_error") {
    const compile = feedback.find((t) => t.compileOutput)?.compileOutput;
    return compile
      ? "Fix compile errors shown above, then run public tests again."
      : "Read the compiler message, fix syntax or imports, then try again.";
  }
  if (verdict === "runtime_error") {
    return "Check bounds, null/empty input, and division by zero. Use the failing sample I/O to reproduce.";
  }
  if (verdict === "time_limit_exceeded") {
    return "Your solution is too slow for the limits — look for nested loops or redundant work.";
  }
  if (verdict === "memory_limit_exceeded") {
    return "Reduce extra storage — avoid copying entire inputs when a stream or single pass works.";
  }
  if (verdict === "wrong_answer") {
    const fail = feedback.find((t) => !t.passed && !t.hidden);
    if (fail?.input) {
      return "Compare your output to the expected value for the failing sample; trace edge cases from constraints.";
    }
    return "A hidden test failed — recheck edge cases and output format without expecting hidden I/O.";
  }
  return undefined;
}
