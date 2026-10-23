"use client";

import { useSyncExternalStore } from "react";
import type { EngineEvent, EngineState } from "./types";
import { initialEngineState, reduceEvent } from "./reducer";

/**
 * Client engine store. localStorage-first; a remote adapter (Supabase) can
 * subscribe via `onEngineChange` and push snapshots. Owner: Agent G.
 */

const STORAGE_KEY = "devpath_engine_v1";

type Listener = () => void;
type EventListener = (event: EngineEvent, next: EngineState, prev: EngineState) => void;

let state: EngineState | null = null;
const listeners = new Set<Listener>();
const eventListeners = new Set<EventListener>();

function load(): EngineState {
  if (typeof window === "undefined") return initialEngineState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialEngineState();
    const parsed = JSON.parse(raw) as Partial<EngineState>;
    const base = initialEngineState();
    return {
      ...base,
      ...parsed,
      streak: { ...base.streak, ...parsed.streak },
      companion: { ...base.companion, ...parsed.companion },
    } as EngineState;
  } catch {
    return initialEngineState();
  }
}

export function getEngineState(): EngineState {
  if (state === null) state = load();
  return state;
}

const serverSnapshot = initialEngineState();

export function setEngineState(next: EngineState): void {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }
  listeners.forEach((l) => l());
}

export function updateEngine(patch: (s: EngineState) => EngineState): void {
  setEngineState(patch(getEngineState()));
}

/** Dispatch a learning event. All XP, streaks, quests, achievements and companion memory flow from here. */
export function dispatchEngine(event: EngineEvent): EngineState {
  const prev = getEngineState();
  const next = reduceEvent(prev, event);
  setEngineState(next);
  eventListeners.forEach((l) => l(event, next, prev));
  return next;
}

/** Claim a finished quest and apply its XP bonus. */
export function claimEngineQuest(questId: string): EngineState {
  return dispatchEngine({ type: "custom", name: `quest_claim:${questId}` });
}

export function clearPendingCelebration(): void {
  updateEngine((s) => ({ ...s, pendingCelebration: null }));
}

export function onEngineEvent(listener: EventListener): () => void {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useEngine(): EngineState {
  return useSyncExternalStore(subscribe, getEngineState, () => serverSnapshot);
}

export function useEngineSelector<T>(select: (s: EngineState) => T): T {
  const s = useEngine();
  return select(s);
}
