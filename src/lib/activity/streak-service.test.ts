import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeStreakFromDates } from "./streak-service";

describe("computeStreakFromDates", () => {
  it("returns zero for empty dates", () => {
    assert.deepEqual(computeStreakFromDates([]), { current: 0, longest: 0 });
  });

  it("computes longest streak across gaps", () => {
    const { longest } = computeStreakFromDates([
      "2025-10-01",
      "2025-10-02",
      "2025-10-03",
      "2025-10-10",
      "2025-10-11",
    ]);
    assert.equal(longest, 3);
  });
});
