import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isProtectedPath, PROTECTED_ROUTE_PREFIXES } from "./protected-routes";

describe("protected routes", () => {
  it("protects learn and practice subtrees", () => {
    assert.equal(isProtectedPath("/learn/foundations/arrays-indexing"), true);
    assert.equal(isProtectedPath("/practice/two-sum"), true);
    assert.equal(isProtectedPath("/rankings"), true);
  });

  it("does not protect login but requires auth for onboarding", () => {
    assert.equal(isProtectedPath("/login"), false);
    assert.equal(isProtectedPath("/onboarding"), true);
  });

  it("documents expected prefix list for middleware parity", () => {
    assert.ok(PROTECTED_ROUTE_PREFIXES.includes("/learn"));
    assert.ok(PROTECTED_ROUTE_PREFIXES.includes("/settings"));
  });
});
