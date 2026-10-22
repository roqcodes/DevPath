import { createAdminClient } from "@/lib/supabase/admin";
import { getQuestionForJudging } from "./problem-repository";
import { runAllTests } from "@/lib/judge/orchestrator";
import type { SupportedLanguage } from "@/lib/questions/types";
import type { NormalizedVerdict } from "@/lib/questions/types";
import type { SessionUser } from "@/lib/auth/session";
import { RANKING_WEIGHT_BY_LABEL } from "@/lib/questions/difficulty-config";
import { awardScoreEvent } from "@/lib/scoring/score-service";
import { problemSolvedIdempotencyKey } from "@/lib/scoring/scoring-policy";
import { recordQualifyingDay } from "@/lib/activity/streak-service";
import { getStudentProfile, canAccessApp } from "./member-profile-service";
import {
  buildClientTestFeedback,
  debugHintForVerdict,
  type ClientJudgePayload,
  type ClientTestFeedback,
} from "@/lib/judge/public-result";
import { isAuthoritativeAcceptance } from "./submission-semantics";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export interface SubmissionResult {
  submissionId: string;
  verdict: NormalizedVerdict;
  accepted: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs?: number;
  memoryKb?: number;
  message?: string;
  mode: "run" | "submit";
  runOnly: boolean;
  tests: ClientTestFeedback[];
  debugHint?: string;
}

export type { ClientJudgePayload, ClientTestFeedback };

export async function processStudentSubmission(
  user: SessionUser,
  problemId: string,
  language: string,
  sourceCode: string,
  options?: { publicTestsOnly?: boolean; mode?: "run" | "submit" }
): Promise<SubmissionResult> {
  const mode = options?.mode ?? (options?.publicTestsOnly ? "run" : "submit");
  const isRunOnly = mode === "run" || Boolean(options?.publicTestsOnly);
  const profile = await getStudentProfile(user.id);
  if (profile && !canAccessApp(profile)) {
    return emptyResult("internal_error", "Account is restricted.", mode, isRunOnly);
  }

  if (!checkRateLimit(user.id)) {
    return emptyResult("internal_error", "Rate limit exceeded. Try again in a minute.", mode, isRunOnly);
  }

  const question = await getQuestionForJudging(problemId);
  if (!question) {
    return emptyResult("internal_error", "Problem not found or not published.", mode, isRunOnly);
  }

  if (!question.execution.languages.includes(language as SupportedLanguage)) {
    return {
      ...emptyResult("compilation_error", "Language not supported for this problem.", mode, isRunOnly),
      totalTests: question.test_cases.length,
    };
  }

  const tests = options?.publicTestsOnly
    ? question.test_cases.filter((t) => t.is_public)
    : question.test_cases;

  const batch = await runAllTests(
    question,
    language as SupportedLanguage,
    sourceCode,
    tests.length ? tests : question.test_cases.filter((t) => t.is_public)
  );

  const submissionId = crypto.randomUUID();
  const accepted = isAuthoritativeAcceptance(batch.verdict, isRunOnly);
  const clientTests = buildClientTestFeedback(batch.tests, tests, isRunOnly);
  const lastMeasured = [...batch.tests].reverse().find((t) => t.runtimeMs != null);
  const memoryKb = [...batch.tests].reverse().find((t) => t.memoryKb != null)?.memoryKb;

  const admin = createAdminClient();
  if (admin && !isRunOnly) {
    await admin.from("submissions").insert({
      id: submissionId,
      user_id: user.id,
      problem_id: question.id,
      problem_revision: question.revision,
      language,
      source_code: sourceCode,
      verdict: batch.verdict,
      passed_tests: batch.passedTests,
      total_tests: batch.totalTests,
      runtime_ms: lastMeasured?.runtimeMs ?? null,
      memory_kb: memoryKb ?? null,
    });

    const { data: progress } = await admin
      .from("user_problem_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("problem_id", question.id)
      .maybeSingle();

    const attempts = (progress?.attempts ?? 0) + 1;
    const alreadySolved = progress?.status === "solved";

    await admin.from("user_problem_progress").upsert(
      {
        user_id: user.id,
        problem_id: question.id,
        status: accepted || alreadySolved ? "solved" : "attempted",
        attempts,
        best_submission_id: accepted ? submissionId : progress?.best_submission_id,
        solved_at: accepted && !alreadySolved ? new Date().toISOString() : progress?.solved_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,problem_id" }
    );

    if (accepted && !alreadySolved) {
      const weight = RANKING_WEIGHT_BY_LABEL[question.difficulty.label];
      await awardScoreEvent(
        user.id,
        "problem_solved",
        problemSolvedIdempotencyKey(question.id),
        weight,
        { problemId: question.id, difficulty: question.difficulty.label }
      );
      await recordQualifyingDay(user.id);
    }
  }

  const verdict = batch.verdict;
  const message =
    verdict === "judge_unavailable"
      ? batch.judgeError
      : verdict === "accepted" && isRunOnly
        ? "Public tests passed. Submit for full grading (includes hidden tests)."
        : verdict === "accepted"
          ? undefined
          : isRunOnly
            ? `Public tests: failed on sample ${batch.passedTests + 1} of ${batch.totalTests}`
            : `Failed on test ${batch.passedTests + 1} of ${batch.totalTests}`;

  return {
    submissionId: isRunOnly ? "" : submissionId,
    verdict,
    accepted,
    passedTests: batch.passedTests,
    totalTests: batch.totalTests,
    runtimeMs: lastMeasured?.runtimeMs,
    memoryKb,
    message,
    mode,
    runOnly: isRunOnly,
    tests: clientTests,
    debugHint: debugHintForVerdict(verdict, clientTests),
  };
}

function emptyResult(
  verdict: NormalizedVerdict,
  message: string,
  mode: "run" | "submit",
  runOnly: boolean
): SubmissionResult {
  return {
    submissionId: "",
    verdict,
    accepted: false,
    passedTests: 0,
    totalTests: 0,
    message,
    mode,
    runOnly,
    tests: [],
    debugHint: debugHintForVerdict(verdict, []),
  };
}
