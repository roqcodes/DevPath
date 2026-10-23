import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { fetchProgressForUser, syncBookmark, syncLessonProgress, recordPracticeSeconds } from "@/lib/services/progress-repository";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ progress: null });
  const progress = await fetchProgressForUser(user);
  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const action = body.action as string;

  switch (action) {
    case "lesson_viewed":
      break;
    case "lesson_complete":
      await syncLessonProgress(user, body.lessonId, true, Boolean(body.mastery));
      break;
    case "bookmark":
      await syncBookmark(user, body.problemId, Boolean(body.on));
      break;
    case "practice_seconds":
      await recordPracticeSeconds(user, Number(body.seconds) || 0);
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
