"use client";

import { useSyncExternalStore } from "react";
import { useEngine } from "@/lib/engine";

const noop = () => () => {};

/** False during SSR + hydration, true afterwards. Use to guard clock/localStorage-derived numbers. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}

/** Review cards due now. 0 until mounted so SSR and first client render agree. */
export function useReviewsDue(): number {
  const engine = useEngine();
  const mounted = useMounted();
  if (!mounted) return 0;
  const now = Date.now();
  return engine.reviewQueue.filter((c) => {
    const t = Date.parse(c.dueAt);
    return Number.isFinite(t) && t <= now;
  }).length;
}

export const COMMAND_OPEN_EVENT = "devpath:command-open";
export const SHORTCUTS_OPEN_EVENT = "devpath:shortcuts-open";

export function openCommandPalette() {
  window.dispatchEvent(new Event(COMMAND_OPEN_EVENT));
}

export function openShortcutsHelp() {
  window.dispatchEvent(new Event(SHORTCUTS_OPEN_EVENT));
}
