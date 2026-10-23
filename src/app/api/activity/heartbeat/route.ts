import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  heartbeatPracticeSession,
  persistPracticeSeconds,
} from "@/lib/activity/practice-session-service";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const contextType = body.contextType === "lesson" ? "lesson" : "problem";
  const contextId = String(body.contextId ?? "");
  const visible = Boolean(body.visible);

  const { creditedSeconds } = heartbeatPracticeSession(user.id, contextType, contextId, visible);
  if (creditedSeconds > 0) {
    await persistPracticeSeconds(user.id, creditedSeconds);
  }

  return NextResponse.json({ creditedSeconds });
}
