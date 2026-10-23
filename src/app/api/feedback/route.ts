import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { submitBetaFeedback } from "@/lib/services/feedback-service";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const result = await submitBetaFeedback(user, {
      category: String(body.category ?? ""),
      message: String(body.message ?? ""),
      contextPath: body.contextPath ? String(body.contextPath) : undefined,
      lessonId: body.lessonId ? String(body.lessonId) : undefined,
      problemId: body.problemId ? String(body.problemId) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
