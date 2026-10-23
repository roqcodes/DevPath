import type { ProblemBankItem } from "@/lib/types/sait";

const REQUIRED = [
  "schema_version",
  "id",
  "title",
  "difficulty",
  "topics",
  "statement",
  "examples",
  "constraints",
  "execution",
  "test_cases",
  "hints",
  "review_status",
] as const;

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validateProblemJson(data: unknown): { valid: boolean; issues: ValidationIssue[]; problem?: ProblemBankItem } {
  const issues: ValidationIssue[] = [];
  if (!data || typeof data !== "object") {
    return { valid: false, issues: [{ path: "", message: "Root must be an object" }] };
  }
  const obj = data as Record<string, unknown>;

  for (const key of REQUIRED) {
    if (obj[key] === undefined || obj[key] === null) {
      issues.push({ path: key, message: "Required field missing" });
    }
  }

  if (typeof obj.id === "string" && !/^[a-z0-9-]+$/.test(obj.id)) {
    issues.push({ path: "id", message: "id must be lowercase alphanumeric with hyphens" });
  }

  if (obj.difficulty && !["easy", "medium", "hard"].includes(String(obj.difficulty))) {
    issues.push({ path: "difficulty", message: "Invalid difficulty" });
  }

  const testCases = obj.test_cases;
  if (!Array.isArray(testCases) || testCases.length === 0) {
    issues.push({ path: "test_cases", message: "At least one test case required" });
  } else {
    const ids = new Set<string>();
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i] as Record<string, unknown>;
      if (!tc?.id) issues.push({ path: `test_cases[${i}].id`, message: "Missing id" });
      else if (ids.has(String(tc.id))) issues.push({ path: `test_cases[${i}].id`, message: "Duplicate test case id" });
      else ids.add(String(tc.id));
    }
  }

  const execution = obj.execution as Record<string, unknown> | undefined;
  if (execution) {
    if (!Array.isArray(execution.supported_languages) || execution.supported_languages.length === 0) {
      issues.push({ path: "execution.supported_languages", message: "At least one language required" });
    }
  }

  if (issues.length > 0) return { valid: false, issues };

  return { valid: true, issues: [], problem: obj as unknown as ProblemBankItem };
}

export function detectDuplicateIds(problems: ProblemBankItem[]): string[] {
  const seen = new Map<string, number>();
  const dupes: string[] = [];
  for (const p of problems) {
    seen.set(p.id, (seen.get(p.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) dupes.push(id);
  }
  return dupes;
}
