"use client";

/**
 * Owner: Agent S (Data). Mounted once. Hydrates from local + remote, merges,
 * dispatches `app_opened`, and debounces Supabase sync on engine changes.
 */

import { useEffect } from "react";
import { isDemoMode } from "@/lib/auth/demo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mergeEngineStates } from "@/lib/persistence/merge";
import { fetchRemoteEngine, pushRemoteEngine } from "@/lib/persistence/remote-adapter";
import { dispatchEngine, getEngineState, onEngineEvent, setEngineState } from "./store";

const SYNC_DEBOUNCE_MS = 800;

function shouldSyncRemote(): boolean {
  return isSupabaseConfigured() && !isDemoMode();
}

export function EngineBridge() {
  useEffect(() => {
    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    async function hydrate() {
      if (shouldSyncRemote()) {
        const res = await fetchRemoteEngine();
        if (!cancelled && res.mode === "supabase") {
          const merged = mergeEngineStates(getEngineState(), res.state);
          if (merged) setEngineState(merged);
        }
      }

      if (!cancelled) dispatchEngine({ type: "app_opened" });
    }

    void hydrate();

    const unsub = onEngineEvent(() => {
      if (!shouldSyncRemote()) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void pushRemoteEngine(getEngineState());
      }, SYNC_DEBOUNCE_MS);
    });

    const flush = () => {
      if (shouldSyncRemote()) void pushRemoteEngine(getEngineState(), { keepalive: true });
    };
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      unsub();
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
