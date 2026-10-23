import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppProgress } from "@/lib/types/app";
import type { SubmissionRecord } from "@/lib/types/sait";
import type { SessionUser } from "@/lib/auth/session";
import { recordQualifyingDay } from "@/lib/activity/streak-service";
import { awardScoreEvent } from "@/lib/scoring/score-service";
import { lessonMasteryIdempotencyKey, SCORING_POLICY } from "@/lib/scoring/scoring-policy";

export async function fetchProgressForUser(user: SessionUser): Promise<Partial<AppProgress> | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const [problemProgress, lessonProgress, bookmarks, submissions] = await Promise.all([
    supabase.from("user_problem_progress").select("problem_id, status").eq("user_id", user.id),
    supabase.from("lesson_progress").select("lesson_id, completed, mastery_passed").eq("user_id", user.id),
    supabase.from("bookmarks").select("problem_id").eq("user_id", user.id),
    supabase
      .from("submissions")
      .select("id, problem_id, problem_revision, language, verdict, passed_tests, total_tests, runtime_ms, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const solved = (problemProgress.data ?? [])
    .filter((r) => r.status === "solved")
    .map((r) => r.problem_id as string);
  const attempted = (problemProgress.data ?? [])
    .filter((r) => r.status === "attempted" || r.status === "solved")
    .map((r) => r.problem_id as string);

  const completedLessons = (lessonProgress.data ?? [])
    .filter((r) => r.completed)
    .map((r) => r.lesson_id as string);

  const lessonMastery: Record<string, boolean> = {};
  for (const r of lessonProgress.data ?? []) {
    if (r.mastery_passed) lessonMastery[r.lesson_id as string] = true;
  }

  return {
    solvedProblems: [...new Set(solved)],
    attemptedProblems: [...new Set(attempted)],
    completedLessons,
    lessonMastery,
    bookmarks: (bookmarks.data ?? []).map((b) => b.problem_id as string),
    submissions: (submissions.data ?? []).map((s) => ({
      id: s.id as string,
      problemId: s.problem_id as string,
      problemRevision: s.problem_revision as number,
      language: s.language as string,
      verdict: s.verdict as SubmissionRecord["verdict"],
      passedTests: s.passed_tests as number,
      totalTests: s.total_tests as number,
      runtimeMs: s.runtime_ms as number | undefined,
      createdAt: s.created_at as string,
    })),
  };
}

export async function syncLessonProgress(
  user: SessionUser,
  lessonId: string,
  completed: boolean,
  mastery: boolean
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      mastery_passed: mastery,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (mastery) {
    const idempotencyKey = lessonMasteryIdempotencyKey(lessonId);
    const { error: eventErr } = await admin.from("lesson_completion_events").insert({
      user_id: user.id,
      lesson_id: lessonId,
      mastery_passed: true,
      idempotency_key: idempotencyKey,
    });
    if (!eventErr) {
      await awardScoreEvent(
        user.id,
        "lesson_mastery",
        idempotencyKey,
        SCORING_POLICY.lessonMasteryPoints,
        { lessonId }
      );
    }
  }

  if (completed || mastery) {
    await recordQualifyingDay(user.id);
  }
}

export async function syncBookmark(user: SessionUser, problemId: string, on: boolean): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  if (on) {
    await admin.from("bookmarks").upsert({ user_id: user.id, problem_id: problemId });
  } else {
    await admin.from("bookmarks").delete().eq("user_id", user.id).eq("problem_id", problemId);
  }
}

export async function recordPracticeSeconds(user: SessionUser, seconds: number): Promise<void> {
  if (seconds <= 0) return;
  const admin = createAdminClient();
  if (!admin) return;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("student_activity_daily")
    .select("active_seconds")
    .eq("user_id", user.id)
    .eq("activity_date", today)
    .maybeSingle();
  const active = (data?.active_seconds ?? 0) + seconds;
  await admin.from("student_activity_daily").upsert({
    user_id: user.id,
    activity_date: today,
    active_seconds: active,
  });
}
