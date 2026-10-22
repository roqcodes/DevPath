import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { outputsMatch } from "./compare-output";

describe("outputsMatch", () => {
  it("trimmed_lines ignores trailing newline differences", () => {
    assert.equal(outputsMatch("1\n2\n", "1\n2", "trimmed_lines"), true);
  });

  it("exact requires full match", () => {
    assert.equal(outputsMatch("a", "a ", "exact"), false);
  });
});
