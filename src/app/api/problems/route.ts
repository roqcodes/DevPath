import { NextResponse } from "next/server";
import { listPublicProblems } from "@/lib/services/problem-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const search = searchParams.get("q") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;
  const sort = (searchParams.get("sort") as "title" | "difficulty" | "newest") ?? "title";

  try {
    const result = await listPublicProblems({ page, limit, search, topic, difficulty, sort });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load problems" }, { status: 500 });
  }
}
