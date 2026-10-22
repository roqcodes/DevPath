import type { ExecutionComparison } from "./types";

export function normalizeOutput(output: string, mode: ExecutionComparison): string {
  let s = output.replace(/\r\n/g, "\n");
  if (mode === "exact") return s;
  if (mode === "trimmed") return s.trim();
  return s
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string, mode: ExecutionComparison): boolean {
  return normalizeOutput(actual, mode) === normalizeOutput(expected, mode);
}
