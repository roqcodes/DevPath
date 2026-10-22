import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyLessonVisit,
  lessonVisitProgressPatch,
  shouldCompleteLessonFromQuiz,
} from "./lesson-progress-semantics";

describe("lesson visit semantics", () => {
  it("records view without completing", () => {
    const result = applyLessonVisit([], "foundations--arrays-indexing");
    assert.equal(result.completesLesson, false);
    assert.deepEqual(result.viewedLessons, ["foundations--arrays-indexing"]);
  });

  it("does not duplicate viewed ids", () => {
    const result = applyLessonVisit(["foundations--arrays-indexing"], "foundations--arrays-indexing");
    assert.equal(result.viewedLessons.length, 1);
  });

  it("lessonVisitProgressPatch is null when visit already recorded", () => {
    const patch = lessonVisitProgressPatch(
      {
        viewedLessons: ["lesson-a"],
        lastVisitedLesson: { moduleSlug: "foundations", lessonSlug: "arrays" },
      },
      "foundations",
      "arrays",
      "lesson-a"
    );
    assert.equal(patch, null);
  });

  it("lessonVisitProgressPatch updates last visited when lesson already viewed", () => {
    const patch = lessonVisitProgressPatch(
      {
        viewedLessons: ["lesson-a"],
        lastVisitedLesson: { moduleSlug: "foundations", lessonSlug: "other" },
      },
      "foundations",
      "arrays",
      "lesson-a"
    );
    assert.ok(patch);
    assert.equal(patch?.lastVisitedLesson.lessonSlug, "arrays");
    assert.equal(patch?.viewedLessons.length, 1);
  });
});

describe("lesson completion semantics", () => {
  it("quiz pass completes only when not already done", () => {
    assert.equal(shouldCompleteLessonFromQuiz(true, false), true);
    assert.equal(shouldCompleteLessonFromQuiz(true, true), false);
    assert.equal(shouldCompleteLessonFromQuiz(false, false), false);
  });
});
