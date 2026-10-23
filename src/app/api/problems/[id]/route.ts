import { NextResponse } from "next/server";
import { getPublicProblemById } from "@/lib/services/problem-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const problem = await getPublicProblemById(id);
  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ problem });
}
