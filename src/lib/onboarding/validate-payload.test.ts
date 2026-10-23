import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateOnboardingPayload } from "./validate-payload";

describe("validateOnboardingPayload", () => {
  const valid = {
    fullName: "Ada Lovelace",
    department: "IT",
    batch: "A",
    academicYear: "2",
    admissionCohort: "2024",
    preferredLanguage: "python",
    weeklyGoalProblems: 5,
  };

  it("accepts valid payload", () => {
    assert.equal(validateOnboardingPayload(valid), null);
  });

  it("rejects missing name", () => {
    assert.equal(validateOnboardingPayload({ ...valid, fullName: "  " }), "Full name is required");
  });

  it("rejects invalid department", () => {
    assert.equal(validateOnboardingPayload({ ...valid, department: "INVALID" }), "Invalid department");
  });

  it("rejects out-of-range weekly goal", () => {
    assert.equal(validateOnboardingPayload({ ...valid, weeklyGoalProblems: 0 }), "Invalid weekly goal");
  });
});
