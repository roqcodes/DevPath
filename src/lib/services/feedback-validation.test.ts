import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateFeedbackInput } from "./feedback-service";

describe("validateFeedbackInput", () => {
  it("requires minimum message length", () => {
    assert.equal(validateFeedbackInput({ category: "bug", message: "short" }), "Message must be at least 10 characters");
  });

  it("accepts valid feedback", () => {
    assert.equal(
      validateFeedbackInput({ category: "judge", message: "Submit timed out on array-sum." }),
      null
    );
  });

  it("rejects unknown category", () => {
    assert.equal(validateFeedbackInput({ category: "spam", message: "1234567890" }), "Invalid category");
  });
});
