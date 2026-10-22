import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assignRanks, matchesRankingScope } from "./ranking-scope";

describe("matchesRankingScope", () => {
  const viewer = { department_id: "IT", batch: "A", admission_cohort: "2024" };

  it("batch scope requires department, batch, and cohort match", () => {
    assert.equal(
      matchesRankingScope({ department_id: "IT", batch: "A", admission_cohort: "2024" }, viewer, "batch"),
      true
    );
    assert.equal(
      matchesRankingScope({ department_id: "IT", batch: "B", admission_cohort: "2024" }, viewer, "batch"),
      false
    );
  });

  it("college scope includes all departments", () => {
    assert.equal(
      matchesRankingScope({ department_id: "AI", batch: "Z", admission_cohort: "2020" }, viewer, "college"),
      true
    );
  });

  it("isolates users outside viewer batch from batch leaderboard", () => {
    const otherBatch = { department_id: "IT", batch: "B", admission_cohort: "2024" };
    assert.equal(matchesRankingScope(otherBatch, viewer, "batch"), false);
  });
});

describe("assignRanks", () => {
  it("breaks ties alphabetically by display name", () => {
    const ranked = assignRanks([
      { userId: "a", score: 10, displayName: "Zara" },
      { userId: "b", score: 10, displayName: "Alex" },
      { userId: "c", score: 20, displayName: "Bob" },
    ]);
    assert.deepEqual(ranked, [
      { userId: "c", rank: 1, score: 20 },
      { userId: "b", rank: 2, score: 10 },
      { userId: "a", rank: 3, score: 10 },
    ]);
  });
});
