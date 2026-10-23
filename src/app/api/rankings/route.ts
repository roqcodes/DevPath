import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { fetchLeaderboard } from "@/lib/services/ranking-query-service";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get("scope") ?? "batch") as "batch" | "department" | "cohort" | "college";
  const period = (searchParams.get("period") ?? "weekly") as "weekly" | "monthly" | "all-time";
  const category = (searchParams.get("category") ?? "practice_points") as
    | "practice_points"
    | "unique_solved"
    | "consistency";

  const result = await fetchLeaderboard(user.id, scope, period, category);
  return NextResponse.json(result);
}
