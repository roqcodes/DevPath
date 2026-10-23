import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { EngineState } from "@/lib/engine/types";
import { mergeEngineStates } from "./merge";

function state(patch: Partial<EngineState> = {}): EngineState {
  return {
    version: 1,
    xp: 0,
    xpByDay: {},
    dailyGoalXp: 30,
    streak: { current: 0, longest: 0, lastActiveDate: "", freezes: 1, frozenDates: [], activeDates: [] },
    achievements: [],
    quests: [],
    questsRefreshedOn: "",
    reviewQueue: [],
    activity: [],
    companion: { weakSpots: {}, wins: [], personality: "playful", nudgesMuted: false },
    pendingCelebration: null,
    ...patch,
  };
}

const card = (id: string, dueAt: string) => ({
  id,
  front: id,
  back: "",
  topic: "arrays",
  ease: 2.5,
  intervalDays: 1,
  dueAt,
  reps: 1,
  lapses: 0,
});

describe("mergeEngineStates", () => {
  it("returns the other side when one is null", () => {
    const s = state({ xp: 5 });
    assert.equal(mergeEngineStates(null, s), s);
    assert.equal(mergeEngineStates(s, null), s);
    assert.equal(mergeEngineStates(null, null), null);
  });

  it("takes max xp and per-day max", () => {
    const m = mergeEngineStates(
      state({ xp: 120, xpByDay: { "2026-10-20": 50, "2026-10-21": 10 } }),
      state({ xp: 300, xpByDay: { "2026-10-20": 20, "2026-10-19": 40 } })
    )!;
    assert.equal(m.xp, 300);
    assert.deepEqual(m.xpByDay, { "2026-10-19": 40, "2026-10-20": 50, "2026-10-21": 10 });
  });

  it("unions achievements by id keeping the earliest unlock", () => {
    const m = mergeEngineStates(
      state({ achievements: [{ id: "a", title: "A", description: "", icon: "x", unlockedAt: "2026-10-02" }] }),
      state({
        achievements: [
          { id: "a", title: "A", description: "", icon: "x", unlockedAt: "2026-10-01" },
          { id: "b", title: "B", description: "", icon: "x", unlockedAt: "2026-10-03" },
        ],
      })
    )!;
    assert.deepEqual(m.achievements.map((a) => a.id).sort(), ["a", "b"]);
    assert.equal(m.achievements.find((a) => a.id === "a")!.unlockedAt, "2026-10-01");
  });

  it("unions active dates and keeps the streak with the later lastActiveDate", () => {
    const m = mergeEngineStates(
      state({
        streak: { current: 9, longest: 9, lastActiveDate: "2026-10-18", freezes: 0, frozenDates: [], activeDates: ["2026-10-18"] },
      }),
      state({
        streak: { current: 2, longest: 4, lastActiveDate: "2026-10-21", freezes: 2, frozenDates: [], activeDates: ["2026-10-20", "2026-10-21"] },
      })
    )!;
    assert.equal(m.streak.current, 2);
    assert.equal(m.streak.longest, 9);
    assert.equal(m.streak.freezes, 2);
    assert.deepEqual(m.streak.activeDates, ["2026-10-18", "2026-10-20", "2026-10-21"]);
  });

  it("unions review cards preferring the later dueAt", () => {
    const m = mergeEngineStates(
      state({ reviewQueue: [card("x", "2026-10-25T00:00:00Z"), card("y", "2026-10-22T00:00:00Z")] }),
      state({ reviewQueue: [card("x", "2026-10-23T00:00:00Z"), card("z", "2026-10-24T00:00:00Z")] })
    )!;
    const byId = Object.fromEntries(m.reviewQueue.map((c) => [c.id, c.dueAt]));
    assert.deepEqual(byId, {
      x: "2026-10-25T00:00:00Z",
      y: "2026-10-22T00:00:00Z",
      z: "2026-10-24T00:00:00Z",
    });
  });

  it("merges companion memory: max weak spots, union wins, local goal wins", () => {
    const m = mergeEngineStates(
      state({ companion: { goal: "faang", weakSpots: { dp: 1, graphs: 3 }, wins: ["w1"], personality: "playful", nudgesMuted: false } }),
      state({
        companion: {
          goal: "placement",
          level: "beginner",
          weakSpots: { dp: 4 },
          wins: ["w2"],
          personality: "concise",
          nudgesMuted: true,
          lastSeenAt: "2026-10-21T00:00:00Z",
        },
      })
    )!;
    assert.equal(m.companion.goal, "faang");
    assert.equal(m.companion.level, "beginner");
    assert.deepEqual(m.companion.weakSpots, { dp: 4, graphs: 3 });
    assert.deepEqual([...m.companion.wins].sort(), ["w1", "w2"]);
    assert.equal(m.companion.personality, "concise");
    assert.equal(m.companion.nudgesMuted, true);
  });
});
