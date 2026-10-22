import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildClientTestFeedback, debugHintForVerdict } from "./public-result";
import type { SingleTestResult } from "./types";

describe("buildClientTestFeedback", () => {
  const cases = [
    { id: "pub-1", is_public: true, input: "1\n2", expected_output: "3" },
    { id: "hid-1", is_public: false, input: "secret", expected_output: "x" },
  ];

  it("exposes public test I/O on run (public only)", () => {
    const results: SingleTestResult[] = [
      { testId: "pub-1", passed: false, verdict: "wrong_answer", stdout: "2" },
    ];
    const feedback = buildClientTestFeedback(results, [cases[0]], true);
    assert.equal(feedback[0].input, "1\n2");
    assert.equal(feedback[0].expectedOutput, "3");
    assert.equal(feedback[0].actualOutput, "2");
  });

  it("redacts hidden failing tests on full submit", () => {
    const results: SingleTestResult[] = [
      { testId: "pub-1", passed: true, verdict: "accepted" },
      { testId: "hid-1", passed: false, verdict: "wrong_answer", stdout: "bad" },
    ];
    const feedback = buildClientTestFeedback(results, cases, false);
    assert.equal(feedback[1].hidden, true);
    assert.equal(feedback[1].input, undefined);
    assert.equal(feedback[1].actualOutput, undefined);
  });
});

describe("debugHintForVerdict", () => {
  it("does not treat judge unavailable as wrong answer guidance", () => {
    const hint = debugHintForVerdict("judge_unavailable", []);
    assert.match(hint ?? "", /unavailable/i);
  });
});
