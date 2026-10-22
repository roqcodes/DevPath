import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLATFORM_TIMEZONE } from "@/lib/config/platform-config";
import type { BatchId, DepartmentId } from "@/lib/types/sait";
import type {
  LeaderboardResult,
  LeaderboardRow,
  RankingCategory,
  RankingPeriod,
  RankingScope,
} from "@/lib/types/rankings";
import { assignRanks, matchesRankingScope } from "./ranking-scope";

export type { LeaderboardResult, LeaderboardRow, RankingCategory, RankingPeriod, RankingScope };

function periodBounds(period: RankingPeriod): { start: string; end: string; label: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: PLATFORM_TIMEZONE });
  if (period === "all-time") {
    return { start: "1970-01-01", end: fmt(now), label: "All time" };
  }
  if (period === "monthly") {
    const parts = fmt(now).split("-");
    const start = `${parts[0]}-${parts[1]}-01`;
    return { start, end: fmt(now), label: "This month" };
  }
  const day = now.toLocaleDateString("en-US", { timeZone: PLATFORM_TIMEZONE, weekday: "short" });
  const offset = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - offset);
  return { start: fmt(startDate), end: fmt(now), label: "This week" };
}

export async function fetchLeaderboard(
  viewerId: string,
  scope: RankingScope,
  period: RankingPeriod,
  category: RankingCategory
): Promise<LeaderboardResult> {
  const admin = createAdminClient();
  const bounds = periodBounds(period);

  if (!admin) {
    return {
      rows: [],
      viewerRank: null,
      periodLabel: bounds.label,
      category,
      scope,
      emptyReason: "Rankings require database configuration.",
    };
  }

  const { data: viewer } = await admin
    .from("profiles")
    .select(
      "id, department_id, batch, admission_cohort, account_status, onboarding_status, onboarding_completed, membership_status, profile_public"
    )
    .eq("id", viewerId)
    .single();

  if (!viewer || viewer.account_status !== "active" || !viewer.onboarding_completed) {
    return {
      rows: [],
      viewerRank: null,
      periodLabel: bounds.label,
      category,
      scope,
      emptyReason: "Account not eligible for rankings.",
    };
  }

  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, full_name, display_name, department_id, academic_year, batch, admission_cohort, ranking_score, unique_solved_count, current_streak, profile_public, account_status, onboarding_status, onboarding_completed"
    )
    .eq("account_status", "active")
    .or("onboarding_status.eq.active,onboarding_completed.eq.true");

  const eligible = (profiles ?? []).filter(
    (p) =>
      matchesRankingScope(p, viewer, scope) &&
      p.profile_public !== false &&
      p.onboarding_completed === true
  );

  if (!eligible.length) {
    return {
      rows: [],
      viewerRank: null,
      periodLabel: bounds.label,
      category,
      scope,
      emptyReason: "No eligible students in this scope yet.",
    };
  }

  let scoreMap = new Map<string, { points: number; unique: number }>();

  if (period === "all-time") {
    for (const p of eligible) {
      scoreMap.set(p.id, {
        points: p.ranking_score ?? 0,
        unique: p.unique_solved_count ?? 0,
      });
    }
  } else {
    const ids = eligible.map((p) => p.id);
    const { data: events } = await admin
      .from("score_events")
      .select("user_id, points, event_type")
      .in("user_id", ids)
      .gte("period_date", bounds.start)
      .lte("period_date", bounds.end);

    for (const id of ids) scoreMap.set(id, { points: 0, unique: 0 });
    for (const e of events ?? []) {
      const cur = scoreMap.get(e.user_id)!;
      cur.points += e.points ?? 0;
      if (e.event_type === "problem_solved") cur.unique += 1;
      scoreMap.set(e.user_id, cur);
    }
  }

  const rows: LeaderboardRow[] = eligible.map((p) => {
    const s = scoreMap.get(p.id) ?? { points: 0, unique: 0 };
    const display =
      p.profile_public === false
        ? "Private student"
        : p.display_name || p.full_name || "Student";
    return {
      rank: 0,
      userId: p.id,
      displayName: display,
      department: (p.department_id as DepartmentId) ?? "IT",
      academicYear: p.academic_year ?? "—",
      batch: (p.batch as BatchId) ?? "—",
      admissionCohort: p.admission_cohort ?? "—",
      score: category === "unique_solved" ? s.unique : category === "consistency" ? p.current_streak ?? 0 : s.points,
      uniqueSolved: s.unique,
      currentStreak: p.current_streak ?? 0,
      profilePublic: p.profile_public !== false,
    };
  });

  const ranked = assignRanks(
    rows.map((r) => ({ userId: r.userId, score: r.score, displayName: r.displayName }))
  );
  const rankByUser = new Map(ranked.map((r) => [r.userId, r.rank]));
  for (const r of rows) {
    r.rank = rankByUser.get(r.userId) ?? 0;
  }

  const viewerRank = rows.find((r) => r.userId === viewerId)?.rank ?? null;

  return {
    rows: rows.slice(0, 100),
    viewerRank,
    periodLabel: bounds.label,
    category,
    scope,
  };
}
