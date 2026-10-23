import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  lessonMasteryIdempotencyKey,
  problemSolvedIdempotencyKey,
  SCORING_POLICY,
} from "./scoring-policy";

describe("scoring policy v1", () => {
  it("uses stable idempotency keys per problem", () => {
    assert.equal(problemSolvedIdempotencyKey("two-sum"), "problem_solved:two-sum");
    assert.equal(
      problemSolvedIdempotencyKey("two-sum"),
      problemSolvedIdempotencyKey("two-sum")
    );
  });

  it("uses stable idempotency keys per lesson", () => {
    assert.equal(lessonMasteryIdempotencyKey("intro-arrays"), "lesson_mastery:intro-arrays");
  });

  it("documents bounded lesson reward", () => {
    assert.ok(SCORING_POLICY.lessonMasteryPoints > 0);
    assert.equal(SCORING_POLICY.version, "v1");
  });
});
