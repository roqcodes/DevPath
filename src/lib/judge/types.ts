import type { ExecutionComparison, SupportedLanguage } from "@/lib/questions/types";
import type { NormalizedVerdict } from "@/lib/questions/types";

export interface JudgeTestCase {
  id: string;
  input: string;
  expected_output: string;
}

export interface JudgeRunOptions {
  sourceCode: string;
  language: SupportedLanguage;
  timeLimitMs: number;
  memoryLimitKb: number;
  comparison: ExecutionComparison;
}

export interface SingleTestResult {
  testId: string;
  passed: boolean;
  verdict: NormalizedVerdict;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  runtimeMs?: number;
  memoryKb?: number;
}

export interface JudgeBatchResult {
  verdict: NormalizedVerdict;
  passedTests: number;
  totalTests: number;
  tests: SingleTestResult[];
  judgeError?: string;
  provider: string;
}

export interface JudgeProvider {
  readonly name: string;
  isConfigured(): boolean;
  runTest(
    options: JudgeRunOptions,
    test: JudgeTestCase
  ): Promise<SingleTestResult>;
}
