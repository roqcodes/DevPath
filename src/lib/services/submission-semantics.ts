import type { NormalizedVerdict } from "@/lib/questions/types";

/** True only when the judge passed all tests on a full Submit (not Run-only). */
export function isAuthoritativeAcceptance(verdict: NormalizedVerdict, runOnly: boolean): boolean {
  return verdict === "accepted" && !runOnly;
}
