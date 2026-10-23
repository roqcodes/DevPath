import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAuthoritativeAcceptance } from "./submission-semantics";

describe("Run vs Submit semantics", () => {
  it("public test pass on run does not count as accepted", () => {
    assert.equal(isAuthoritativeAcceptance("accepted", true), false);
  });

  it("full submit accept counts as accepted", () => {
    assert.equal(isAuthoritativeAcceptance("accepted", false), true);
  });

  it("wrong answer never accepted", () => {
    assert.equal(isAuthoritativeAcceptance("wrong_answer", false), false);
  });

  it("judge unavailable never accepted", () => {
    assert.equal(isAuthoritativeAcceptance("judge_unavailable", false), false);
  });
});
