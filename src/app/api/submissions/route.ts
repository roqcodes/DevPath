import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { processStudentSubmission } from "@/lib/services/submission-service";
import { listSubmissionHistory } from "@/lib/services/submission-query-service";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problemId") ?? undefined;
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const submissions = await listSubmissionHistory(user.id, { problemId, limit });
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { problemId, language, sourceCode, mode } = body as {
      problemId?: string;
      language?: string;
      sourceCode?: string;
      mode?: "run" | "submit";
    };

    if (!problemId || !language || typeof sourceCode !== "string") {
      return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
    }

    if (sourceCode.length > 100_000) {
      return NextResponse.json({ error: "Source code too large" }, { status: 400 });
    }

    const runMode = mode === "run" ? "run" : "submit";

    const result = await processStudentSubmission(user, problemId, language, sourceCode, {
      publicTestsOnly: runMode === "run",
      mode: runMode,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
