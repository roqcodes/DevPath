import {
  getJudge0Config,
  mapJudge0StatusId,
  mapLanguageToJudge0,
  runJudge0Submission,
} from "@/lib/services/judge0-client";
import { outputsMatch } from "@/lib/questions/compare-output";
import type { JudgeProvider, JudgeRunOptions, JudgeTestCase, SingleTestResult } from "./types";
import type { NormalizedVerdict } from "@/lib/questions/types";

function normalizeVerdict(statusId: number): NormalizedVerdict {
  const mapped = mapJudge0StatusId(statusId);
  switch (mapped.verdict) {
    case "accepted":
      return "accepted";
    case "wrong_answer":
      return "wrong_answer";
    case "compile_error":
      return "compilation_error";
    case "time_limit":
      return "time_limit_exceeded";
    case "runtime_error":
      return "runtime_error";
    default:
      return "internal_error";
  }
}

export class Judge0Provider implements JudgeProvider {
  readonly name = "judge0";

  isConfigured(): boolean {
    return getJudge0Config() !== null;
  }

  async runTest(options: JudgeRunOptions, test: JudgeTestCase): Promise<SingleTestResult> {
    const config = getJudge0Config();
    if (!config) {
      return {
        testId: test.id,
        passed: false,
        verdict: "judge_unavailable",
      };
    }

    try {
      const cpuSec = Math.max(0.1, options.timeLimitMs / 1000);
      const result = await runJudge0Submission(config, {
        sourceCode: options.sourceCode,
        languageId: mapLanguageToJudge0(options.language),
        stdin: test.input,
        expectedOutput: test.expected_output,
        cpuTimeLimitSec: cpuSec,
        memoryLimitKb: options.memoryLimitKb,
      });

      const statusId = result.status?.id ?? 0;
      let verdict = normalizeVerdict(statusId);

      const stdout = result.stdout ?? "";
      if (statusId === 3) {
        const matches = outputsMatch(stdout, test.expected_output, options.comparison);
        if (!matches) verdict = "wrong_answer";
      }

      return {
        testId: test.id,
        passed: verdict === "accepted",
        verdict,
        stdout: stdout.slice(0, 500),
        stderr: (result.stderr ?? "").slice(0, 500),
        compileOutput: (result.compile_output ?? "").slice(0, 500),
        runtimeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : undefined,
        memoryKb: result.memory ?? undefined,
      };
    } catch (e) {
      return {
        testId: test.id,
        passed: false,
        verdict: "internal_error",
        stderr: e instanceof Error ? e.message.slice(0, 200) : "Judge error",
      };
    }
  }
}
