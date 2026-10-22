import { createHash } from "crypto";
import type { QuestionPackage } from "./types";

/** Canonical hash for idempotent imports (excludes status so draft→published does not change hash). */
export function hashQuestionContent(pkg: QuestionPackage): string {
  const clone = { ...pkg, status: "published" as const };
  const json = JSON.stringify(clone, Object.keys(clone).sort());
  return createHash("sha256").update(json).digest("hex");
}
