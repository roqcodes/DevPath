import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateQuestionPackage, detectDuplicateQuestionIds } from "./validate";
import { readFileSync } from "fs";
import { join } from "path";

describe("validateQuestionPackage", () => {
  it("accepts pilot array-sum", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "question-bank/arrays/beginner/array-sum.json"), "utf8")
    );
    const { valid, issues } = validateQuestionPackage(raw);
    assert.equal(valid, true, issues.map((i) => i.message).join("; "));
  });

  it("rejects missing required field", () => {
    const { valid, issues } = validateQuestionPackage({ id: "x" });
    assert.equal(valid, false);
    assert.ok(issues.length > 0);
  });

  it("detects duplicate ids in batch", () => {
    const dupes = detectDuplicateQuestionIds([
      { id: "a", slug: "a" } as never,
      { id: "a", slug: "a" } as never,
    ]);
    assert.deepEqual(dupes, ["a"]);
  });
});
