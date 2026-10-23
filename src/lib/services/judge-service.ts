import type { ProblemBankItem, SubmissionVerdict } from "@/lib/types/sait";
import { getProblemById } from "@/lib/problems/problem-catalog";

export interface JudgeRunResult {
  verdict: SubmissionVerdict;
  passedTests: number;
  totalTests: number;
  runtimeMs?: number;
  details?: string;
  mode: "judge0" | "unconfigured";
}

function normalizeOutput(output: string, comparison: "exact" | "trimmed" = "trimmed"): string {
  if (comparison === "exact") return output;
  return output.trim().replace(/\r\n/g, "\n");
}

function isJudgeConfigured(): boolean {
  return Boolean(process.env.JUDGE0_API_URL && process.env.JUDGE0_API_KEY);
}

function judgeUnavailable(problem: ProblemBankItem, details: string): JudgeRunResult {
  return {
    verdict: "judge_unavailable",
    passedTests: 0,
    totalTests: problem.test_cases.length,
    mode: "unconfigured",
    details,
  };
}

/**
 * Server-only evaluation. Hidden tests and reference solutions stay on the server.
 */
export async function evaluateSubmission(
  problemId: string,
  language: string,
  _sourceCode: string
): Promise<JudgeRunResult> {
  const problem = getProblemById(problemId);
  if (!problem) {
    return { verdict: "wrong_answer", passedTests: 0, totalTests: 0, mode: "unconfigured", details: "Problem not found" };
  }

  if (!problem.execution.supported_languages.includes(language)) {
    return {
      verdict: "compile_error",
      passedTests: 0,
      totalTests: problem.test_cases.length,
      mode: "unconfigured",
      details: "Language not supported for this problem",
    };
  }

  const tests = problem.test_cases;

  if (!isJudgeConfigured()) {
    return judgeUnavailable(
      problem,
      "Judge service is not configured. Set JUDGE0_API_URL and JUDGE0_API_KEY on the server."
    );
  }

  try {
    const url = process.env.JUDGE0_API_URL!;
    const res = await fetch(`${url}/submissions?base64_encoded=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.JUDGE0_API_KEY!,
      },
      body: JSON.stringify({
        language_id: mapLanguageToJudge0(language),
        source_code: _sourceCode,
        stdin: tests[0]?.input ?? "",
      }),
    });
    if (!res.ok) {
      return judgeUnavailable(problem, "Judge service request failed. Check JUDGE0_API_URL and JUDGE0_API_KEY.");
    }
    return {
      verdict: "pending",
      passedTests: 0,
      totalTests: tests.length,
      mode: "judge0",
      details: "Submission queued to Judge0",
    };
  } catch {
    return judgeUnavailable(problem, "Unable to reach the judge service.");
  }
}

function mapLanguageToJudge0(language: string): number {
  const map: Record<string, number> = { python: 71, javascript: 63, cpp: 54 };
  return map[language] ?? 71;
}

export function compareOutputs(actual: string, expected: string, comparison: "exact" | "trimmed" = "trimmed"): boolean {
  return normalizeOutput(actual, comparison) === normalizeOutput(expected, comparison);
}
