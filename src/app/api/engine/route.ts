import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { levelFromXp } from "@/lib/engine/reducer";
import type { EngineState } from "@/lib/engine/types";
import type { EngineApiResponse } from "@/lib/persistence/adapter";
import { ENGINE_SNAPSHOT_MAX_BYTES } from "@/lib/persistence/adapter";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function localResponse(reason: NonNullable<Extract<EngineApiResponse, { mode: "local" }>["reason"]>): NextResponse {
  return NextResponse.json({ mode: "local", reason } satisfies EngineApiResponse);
}

function isNotMigratedError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("engine_snapshots") && (msg.includes("does not exist") || msg.includes("not found"));
}

function snapshotRow(userId: string, state: EngineState) {
  const { level } = levelFromXp(state.xp ?? 0);
  return {
    user_id: userId,
    state,
    xp: state.xp ?? 0,
    level,
    streak: state.streak?.current ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return localResponse("not_configured");

  const user = await getSessionUser();
  if (!user) return localResponse("no_session");

  const supabase = await createClient();
  if (!supabase) return localResponse("not_configured");

  const { data, error } = await supabase
    .from("engine_snapshots")
    .select("state, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isNotMigratedError(error)) return localResponse("not_migrated");
    return localResponse("error");
  }

  const body: EngineApiResponse = {
    mode: "supabase",
    state: (data?.state as EngineState | null) ?? null,
    updatedAt: data?.updated_at ?? null,
  };
  return NextResponse.json(body);
}

export async function PUT(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return localResponse("not_configured");

  const user = await getSessionUser();
  if (!user) return localResponse("no_session");

  let body: { state?: EngineState };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ mode: "local", reason: "error" }, { status: 400 });
  }

  const state = body.state;
  if (!state || typeof state !== "object" || state.version !== 1) {
    return NextResponse.json({ mode: "local", reason: "error" }, { status: 400 });
  }

  const bytes = new TextEncoder().encode(JSON.stringify(state)).length;
  if (bytes > ENGINE_SNAPSHOT_MAX_BYTES) {
    return NextResponse.json({ mode: "local", reason: "error" }, { status: 413 });
  }

  const supabase = await createClient();
  if (!supabase) return localResponse("not_configured");

  const row = snapshotRow(user.id, state);
  const { error } = await supabase.from("engine_snapshots").upsert(row, { onConflict: "user_id" });

  if (error) {
    if (isNotMigratedError(error)) return localResponse("not_migrated");
    return localResponse("error");
  }

  return NextResponse.json({
    mode: "supabase",
    state,
    updatedAt: row.updated_at,
  } satisfies EngineApiResponse);
}
