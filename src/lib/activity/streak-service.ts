import { createAdminClient } from "@/lib/supabase/admin";
import { PLATFORM_TIMEZONE } from "@/lib/config/platform-config";

export function platformDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: PLATFORM_TIMEZONE });
}

function previousDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

export async function recordQualifyingDay(userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const today = platformDateString();
  const { data: profile } = await admin
    .from("profiles")
    .select("last_qualifying_activity_date, current_streak, longest_streak")
    .eq("id", userId)
    .single();

  if (profile?.last_qualifying_activity_date === today) return;

  const last = profile?.last_qualifying_activity_date as string | null;
  let streak = 1;
  if (last === previousDay(today)) {
    streak = (profile?.current_streak ?? 0) + 1;
  }

  const longest = Math.max(streak, profile?.longest_streak ?? 0);

  await admin
    .from("profiles")
    .update({
      last_qualifying_activity_date: today,
      current_streak: streak,
      longest_streak: longest,
    })
    .eq("id", userId);

  await admin.from("student_activity_daily").upsert(
    {
      user_id: userId,
      activity_date: today,
      current_streak: streak,
      longest_streak: longest,
    },
    { onConflict: "user_id,activity_date" }
  );
}

export function computeStreakFromDates(qualifyingDates: string[]): {
  current: number;
  longest: number;
} {
  const sorted = [...new Set(qualifyingDates)].sort();
  if (!sorted.length) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (previousDay(sorted[i]) === sorted[i - 1]) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const today = platformDateString();
  const yesterday = previousDay(today);
  const last = sorted[sorted.length - 1];
  let current = 0;
  if (last === today || last === yesterday) {
    current = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (previousDay(sorted[i + 1]) === sorted[i]) current++;
      else break;
    }
  }

  return { current, longest };
}
