import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "supabase", "migrations");

function readMigration(name: string): string {
  return readFileSync(join(root, name), "utf8");
}

describe("RLS policy snapshot (static review)", () => {
  it("submissions are scoped to owning user", () => {
    const sql = readMigration("20251017100000_sait_dsa_schema.sql");
    assert.match(sql, /Users view own submissions/);
    assert.match(sql, /auth\.uid\(\) = user_id/);
  });

  it("score events cannot be inserted by end users", () => {
    const sql = readMigration("20251017300000_phase3_multiuser.sql");
    assert.match(sql, /Users read own score events/);
    assert.doesNotMatch(sql, /score_events FOR INSERT[\s\S]*auth\.uid/);
  });

  it("beta feedback is private per user", () => {
    const sql = readMigration("20251017400000_phase7_beta_feedback.sql");
    assert.match(sql, /Users insert own beta feedback/);
    assert.match(sql, /Users read own beta feedback/);
  });

  it("score idempotency prevents duplicate awards", () => {
    const sql = readMigration("20251017300000_phase3_multiuser.sql");
    assert.match(sql, /UNIQUE \(user_id, idempotency_key\)/);
  });
});
