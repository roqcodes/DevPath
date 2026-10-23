import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../../question-bank/question.schema.json";
import type { QuestionPackage } from "./types";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validateSchema = ajv.compile(schema);

export interface QuestionValidationIssue {
  path: string;
  message: string;
}

const HTML_PATTERN = /<script|javascript:|on\w+\s*=/i;

export function validateQuestionPackage(data: unknown): {
  valid: boolean;
  issues: QuestionValidationIssue[];
  question?: QuestionPackage;
} {
  const issues: QuestionValidationIssue[] = [];

  if (!validateSchema(data)) {
    for (const err of validateSchema.errors ?? []) {
      issues.push({
        path: err.instancePath || err.schemaPath || "",
        message: err.message ?? "Invalid",
      });
    }
    return { valid: false, issues };
  }

  const q = data as unknown as QuestionPackage;

  if (q.id !== q.slug) {
    issues.push({ path: "slug", message: "slug must match id in v2 packages" });
  }

  const tcIds = new Set<string>();
  let publicCount = 0;
  for (const tc of q.test_cases) {
    if (tcIds.has(tc.id)) {
      issues.push({ path: `test_cases.${tc.id}`, message: "Duplicate test case id" });
    }
    tcIds.add(tc.id);
    if (tc.is_public) publicCount++;
  }
  if (publicCount < 1) {
    issues.push({ path: "test_cases", message: "At least one public test case required" });
  }

  if (HTML_PATTERN.test(q.statement)) {
    issues.push({ path: "statement", message: "Untrusted HTML/script patterns are not allowed" });
  }
  if (q.editorial && HTML_PATTERN.test(q.editorial)) {
    issues.push({ path: "editorial", message: "Untrusted HTML/script patterns are not allowed" });
  }

  const langs = new Set(q.execution.languages);
  for (const lang of Object.keys(q.reference_solutions)) {
    if (!langs.has(lang as QuestionPackage["execution"]["languages"][number])) {
      issues.push({
        path: `reference_solutions.${lang}`,
        message: "Reference solution language must be listed in execution.languages",
      });
    }
  }

  if (issues.length) return { valid: false, issues };
  return { valid: true, issues: [], question: q };
}

export function detectDuplicateQuestionIds(questions: QuestionPackage[]): string[] {
  const seen = new Map<string, number>();
  const dupes: string[] = [];
  for (const q of questions) {
    seen.set(q.id, (seen.get(q.id) ?? 0) + 1);
  }
  for (const [id, n] of seen) {
    if (n > 1) dupes.push(id);
  }
  return dupes;
}
