import { createAdminClient } from "@/lib/supabase/admin";
import { SCORING_POLICY } from "./scoring-policy";
import { PLATFORM_TIMEZONE } from "@/lib/config/platform-config";

export interface AwardResult {
  awarded: boolean;
  points: number;
  duplicate: boolean;
}

function periodDateInPlatformTz(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: PLATFORM_TIMEZONE });
}

export async function awardScoreEvent(
  userId: string,
  eventType: string,
  idempotencyKey: string,
  points: number,
  metadata: Record<string, unknown> = {}
): Promise<AwardResult> {
  if (points <= 0) {
    return { awarded: false, points: 0, duplicate: false };
  }

  const admin = createAdminClient();
  if (!admin) return { awarded: false, points: 0, duplicate: false };

  const periodDate = periodDateInPlatformTz();

  const { error } = await admin.from("score_events").insert({
    user_id: userId,
    event_type: eventType,
    idempotency_key: idempotencyKey,
    points,
    period_date: periodDate,
    metadata: { ...metadata, policy: SCORING_POLICY.version },
  });

  if (error) {
    if (error.code === "23505") {
      return { awarded: false, points: 0, duplicate: true };
    }
    console.error("[score] award failed", error.message);
    return { awarded: false, points: 0, duplicate: false };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("ranking_score, unique_solved_count")
    .eq("id", userId)
    .single();

  const updates: Record<string, unknown> = {
    ranking_score: (profile?.ranking_score ?? 0) + points,
  };
  if (eventType === "problem_solved") {
    updates.unique_solved_count = (profile?.unique_solved_count ?? 0) + 1;
  }

  await admin.from("profiles").update(updates).eq("id", userId);

  return { awarded: true, points, duplicate: false };
}
