"use client";

/**
 * Owner: Agent S (Data). Mounted once. Hydrates from local + remote, merges,
 * dispatches `app_opened`, and debounces Supabase sync on engine changes.
 */

import { useEffect } from "react";
import { hasDemoCookie, isDemoEnvEnabled } from "@/lib/auth/demo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mergeEngineStates } from "@/lib/persistence/merge";
import { fetchRemoteEngine, pushRemoteEngine } from "@/lib/persistence/remote-adapter";
import { dispatchEngine, getEngineState, onEngineEvent, setEngineState } from "./store";

const SYNC_DEBOUNCE_MS = 800;

async function shouldSyncRemote(): Promise<boolean> {
  if (!isSupabaseConfigured() || isDemoEnvEnabled()) return false;
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = (await res.json()) as { user?: { id?: string } | null };
    if (data.user?.id) return true;
  } catch {
    /* offline */
  }
  return !hasDemoCookie();
}

export function EngineBridge() {
  useEffect(() => {
    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    let syncEnabled = false;

    async function hydrate() {
      syncEnabled = await shouldSyncRemote();
      if (syncEnabled) {
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
      if (!syncEnabled) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void pushRemoteEngine(getEngineState());
      }, SYNC_DEBOUNCE_MS);
    });

    const flush = () => {
      if (syncEnabled) void pushRemoteEngine(getEngineState(), { keepalive: true });
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
