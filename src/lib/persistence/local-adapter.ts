import type { EngineState } from "@/lib/engine/types";
import { ENGINE_STORAGE_KEY, type EngineAdapter } from "./adapter";

/** Raw localStorage access under the same key the engine store uses. */
export const localAdapter: EngineAdapter = {
  kind: "local",
  async load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(ENGINE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as EngineState) : null;
    } catch {
      return null;
    }
  },
  async save(state) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode */
    }
  },
};
