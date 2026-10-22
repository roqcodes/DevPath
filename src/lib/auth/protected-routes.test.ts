import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isProtectedPath, PROTECTED_ROUTE_PREFIXES, resolveAccess } from "./protected-routes";

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

  it("protects next-level routes but keeps /start public", () => {
    for (const p of ["/path", "/review", "/achievements", "/arena", "/wrapped/2026"]) {
      assert.equal(isProtectedPath(p), true, p);
    }
    assert.equal(isProtectedPath("/start"), false);
    assert.equal(isProtectedPath("/pathfinder"), false);
  });

  it("documents expected prefix list for proxy parity", () => {
    assert.ok(PROTECTED_ROUTE_PREFIXES.includes("/learn"));
    assert.ok(PROTECTED_ROUTE_PREFIXES.includes("/settings"));
  });
});

describe("resolveAccess (demo mode)", () => {
  const base = { pathname: "/dashboard", supabaseConfigured: true, demoEnv: false, demoCookie: false };

  it("passes everything through when Supabase is not configured", () => {
    assert.equal(resolveAccess({ ...base, supabaseConfigured: false }), "pass");
  });

  it("requires a session when configured and no demo opt-in", () => {
    assert.equal(resolveAccess(base), "check_session");
  });

  it("lets demo env or demo cookie through when configured", () => {
    assert.equal(resolveAccess({ ...base, demoEnv: true }), "pass");
    assert.equal(resolveAccess({ ...base, demoCookie: true }), "pass");
  });

  it("never gates public routes", () => {
    assert.equal(resolveAccess({ ...base, pathname: "/start" }), "pass");
    assert.equal(resolveAccess({ ...base, pathname: "/login" }), "pass");
  });
});
