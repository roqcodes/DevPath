import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialEngineState, levelFromXp, reduceEvent } from "../reducer";
import { todayKey } from "./dates";

describe("engine reducer", () => {
  it("awards XP for lesson completion and levels up", () => {
    let s = initialEngineState();
    s = reduceEvent(s, {
      type: "lesson_completed",
      lessonId: "l1",
      moduleSlug: "arrays",
      mastery: true,
    });
    assert.equal(s.xp, 30);
    assert.equal(levelFromXp(s.xp).level, 1);
    assert.ok(s.reviewQueue.some((c) => c.id === "lesson_l1"));
  });

  it("extends streak on qualifying activity", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = todayKey(yesterday);
    let s = initialEngineState();
    s = {
      ...s,
      streak: {
        ...s.streak,
        current: 2,
        longest: 2,
        lastActiveDate: y,
        activeDates: [y],
      },
    };
    s = reduceEvent(s, {
      type: "problem_attempted",
      problemId: "p1",
      accepted: true,
    });
    assert.equal(s.streak.current, 3);
    assert.equal(s.streak.lastActiveDate, todayKey());
  });

  it("unlocks hello_world achievement on first lesson", () => {
    let s = initialEngineState();
    s = reduceEvent(s, {
      type: "lesson_completed",
      lessonId: "intro",
      moduleSlug: "foundations",
    });
    assert.ok(s.achievements.some((a) => a.id === "hello_world"));
  });

  it("refreshes daily quests on app_opened", () => {
    let s = initialEngineState();
    s = reduceEvent(s, { type: "app_opened" });
    const day = todayKey();
    assert.ok(s.quests.some((q) => q.period === "daily" && q.id.includes(day)));
  });

  it("advances and claims a quest", () => {
    let s = initialEngineState();
    s = reduceEvent(s, { type: "app_opened" });
    const quest = s.quests.find((q) => q.metric === "lessons");
    assert.ok(quest);
    s = reduceEvent(s, {
      type: "lesson_completed",
      lessonId: "l2",
      moduleSlug: "arrays",
    });
    const updated = s.quests.find((q) => q.id === quest!.id);
    assert.ok(updated && updated.progress >= 1);
    const beforeXp = s.xp;
    s = reduceEvent(s, { type: "custom", name: `quest_claim:${quest!.id}` });
    assert.ok(s.quests.find((q) => q.id === quest!.id)?.claimed);
    assert.ok(s.xp > beforeXp);
  });

  it("enqueues review card on wrong quiz answer", () => {
    let s = initialEngineState();
    s = reduceEvent(s, {
      type: "quiz_answered",
      itemId: "q1",
      correct: false,
      topic: "Big-O",
      prompt: "What is O(1)?",
    });
    assert.ok(s.reviewQueue.some((c) => c.id === "quiz_q1"));
    assert.ok((s.companion.weakSpots["Big-O"] ?? 0) >= 1);
  });
});
