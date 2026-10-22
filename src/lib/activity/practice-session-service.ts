import { createAdminClient } from "@/lib/supabase/admin";
import { recordQualifyingDay } from "./streak-service";

const INACTIVITY_SEC = 120;
const HEARTBEAT_SEC = 30;
const MAX_SESSION_SEC = 4 * 3600;

interface SessionState {
  sessionId: string;
  lastBeat: number;
  accumulatedSec: number;
}

const activeSessions = new Map<string, SessionState>();

export function heartbeatPracticeSession(
  userId: string,
  contextType: "problem" | "lesson",
  contextId: string,
  visible: boolean
): { creditedSeconds: number } {
  if (!visible) return { creditedSeconds: 0 };

  const key = `${userId}:${contextType}:${contextId}`;
  const now = Date.now();
  let state = activeSessions.get(key);

  if (!state) {
    state = { sessionId: crypto.randomUUID(), lastBeat: now, accumulatedSec: 0 };
    activeSessions.set(key, state);
    return { creditedSeconds: 0 };
  }

  const idle = (now - state.lastBeat) / 1000 > INACTIVITY_SEC;
  if (idle) {
    state.lastBeat = now;
    return { creditedSeconds: 0 };
  }

  const delta = Math.min(HEARTBEAT_SEC, MAX_SESSION_SEC - state.accumulatedSec);
  if (delta <= 0) return { creditedSeconds: 0 };

  state.accumulatedSec += delta;
  state.lastBeat = now;
  return { creditedSeconds: delta };
}

export async function persistPracticeSeconds(userId: string, seconds: number): Promise<void> {
  if (seconds <= 0) return;
  const admin = createAdminClient();
  if (!admin) return;

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const { data } = await admin
    .from("student_activity_daily")
    .select("active_seconds")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .maybeSingle();

  await admin.from("student_activity_daily").upsert({
    user_id: userId,
    activity_date: today,
    active_seconds: (data?.active_seconds ?? 0) + seconds,
  });

  if (seconds >= 60) {
    await recordQualifyingDay(userId);
  }
}
