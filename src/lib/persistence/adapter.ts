import type { EngineState } from "@/lib/engine/types";

export interface EngineAdapter {
  kind: "local" | "supabase";
  load(): Promise<EngineState | null>;
  save(state: EngineState): Promise<void>;
}

/** Shape returned by GET/PUT `/api/engine`. */
export type EngineApiResponse =
  | { mode: "local"; reason?: "not_configured" | "no_session" | "not_migrated" | "error" }
  | { mode: "supabase"; state: EngineState | null; updatedAt?: string | null };

export const ENGINE_STORAGE_KEY = "devpath_engine_v1";
export const ENGINE_SNAPSHOT_MAX_BYTES = 256 * 1024;
