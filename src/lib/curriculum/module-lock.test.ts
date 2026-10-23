import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isModuleLocked, getModule } from "./index";

describe("module prerequisites", () => {
  it("locks module until all prerequisite module lessons are complete", () => {
    const foundations = getModule("foundations");
    assert.ok(foundations);
    const allFoundationIds = foundations!.lessons.map((l) => l.id);
    assert.equal(isModuleLocked("arrays-strings", []), true);
    assert.equal(isModuleLocked("arrays-strings", allFoundationIds), false);
  });

  it("foundations module is never locked", () => {
    assert.equal(isModuleLocked("foundations", []), false);
  });
});
