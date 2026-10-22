import type { QuestionPackage } from "@/lib/questions/types";
import { Judge0Provider } from "./judge0-provider";
import type { JudgeBatchResult, JudgeProvider } from "./types";

let provider: JudgeProvider = new Judge0Provider();

export function setJudgeProvider(p: JudgeProvider): void {
  provider = p;
}

export function getJudgeProvider(): JudgeProvider {
  return provider;
}

export async function runAllTests(
  question: QuestionPackage,
  language: keyof QuestionPackage["reference_solutions"],
  sourceCode: string,
  tests: QuestionPackage["test_cases"]
): Promise<JudgeBatchResult> {
  if (!provider.isConfigured()) {
    return {
      verdict: "judge_unavailable",
      passedTests: 0,
      totalTests: tests.length,
      tests: [],
      judgeError: "Code execution service is not configured. Set JUDGE0_API_KEY or JUDGE0_RAPIDAPI_KEY.",
      provider: provider.name,
    };
  }

  const options = {
    sourceCode,
    language,
    timeLimitMs: question.execution.time_limit_ms,
    memoryLimitKb: question.execution.memory_limit_kb,
    comparison: question.execution.comparison,
  };

  const results = [];
  let passed = 0;
  let finalVerdict = "accepted" as JudgeBatchResult["verdict"];

  for (const tc of tests) {
    const r = await provider.runTest(options, {
      id: tc.id,
      input: tc.input,
      expected_output: tc.expected_output,
    });
    results.push(r);
    if (r.passed) {
      passed++;
    } else {
      finalVerdict = r.verdict === "judge_unavailable" ? "judge_unavailable" : r.verdict;
      break;
    }
  }

  if (passed === tests.length) finalVerdict = "accepted";

  return {
    verdict: finalVerdict,
    passedTests: passed,
    totalTests: tests.length,
    tests: results,
    provider: provider.name,
  };
}

export async function verifyReferenceSolution(question: QuestionPackage): Promise<JudgeBatchResult> {
  const lang = question.execution.languages.find((l) => question.reference_solutions[l]);
  if (!lang) {
    return {
      verdict: "internal_error",
      passedTests: 0,
      totalTests: question.test_cases.length,
      tests: [],
      judgeError: "No reference solution for configured languages",
      provider: provider.name,
    };
  }
  const code = question.reference_solutions[lang]!;
  return runAllTests(question, lang, code, question.test_cases);
}
