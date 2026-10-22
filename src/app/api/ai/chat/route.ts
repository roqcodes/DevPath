import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { runLessonTutorChat } from "@/lib/ai/chat-service";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const context = String(body.context ?? "");
    if (context !== "lesson") {
      return NextResponse.json({ error: "Unsupported context" }, { status: 400 });
    }

    const lessonId = String(body.lessonId ?? "");
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const parsed: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") continue;
      const row = m as { role?: string; content?: string };
      const role = row.role === "assistant" ? "assistant" : "user";
      parsed.push({ role, content: String(row.content ?? "") });
    }

    const result = await runLessonTutorChat(user.id, { lessonId, messages: parsed });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ content: result.content, model: result.model });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
