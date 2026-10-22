import type { EngineState } from "@/lib/engine/types";
import type { EngineAdapter, EngineApiResponse } from "./adapter";

export async function fetchRemoteEngine(signal?: AbortSignal): Promise<EngineApiResponse> {
  try {
    const res = await fetch("/api/engine", { cache: "no-store", signal });
    if (!res.ok) return { mode: "local", reason: "error" };
    return (await res.json()) as EngineApiResponse;
  } catch {
    return { mode: "local", reason: "error" };
  }
}

export async function pushRemoteEngine(state: EngineState, opts?: { keepalive?: boolean }): Promise<boolean> {
  try {
    const res = await fetch("/api/engine", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
      keepalive: opts?.keepalive,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const remoteAdapter: EngineAdapter = {
  kind: "supabase",
  async load() {
    const res = await fetchRemoteEngine();
    return res.mode === "supabase" ? res.state : null;
  },
  async save(state) {
    await pushRemoteEngine(state);
  },
};
