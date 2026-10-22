/**
 * @deprecated Prefer API / file-loader on server. Kept for client fallbacks during hydration.
 */
import type { ProblemBankItem } from "@/lib/types/sait";
import { listPublishedPackages, getPublishedPackage } from "@/lib/questions/published-meta";
import { toPublicView } from "@/lib/questions/public-view";
import type { QuestionPackage } from "@/lib/questions/types";

function toLegacyItem(q: QuestionPackage): ProblemBankItem {
  const legacyDifficulty =
    q.difficulty.label === "beginner" || q.difficulty.label === "easy"
      ? "easy"
      : q.difficulty.label === "intermediate"
        ? "medium"
        : "hard";
  return {
    schema_version: q.schema_version,
    id: q.id,
    title: q.title,
    difficulty: legacyDifficulty,
    topics: q.topics,
    prerequisites: q.prerequisites,
    statement: q.statement,
    examples: q.examples,
    constraints: q.constraints,
    execution: {
      time_limit_ms: q.execution.time_limit_ms,
      memory_limit_kb: q.execution.memory_limit_kb,
      supported_languages: q.execution.languages,
      comparison: q.execution.comparison === "trimmed_lines" ? "trimmed" : q.execution.comparison,
    },
    test_cases: q.test_cases,
    hints: q.hints,
    editorial: q.editorial,
    provenance: q.provenance,
    review_status: q.status,
    reference_solutions: q.reference_solutions as Record<string, string>,
  };
}

export function listPublishedProblems(): ProblemBankItem[] {
  return listPublishedPackages().map(toLegacyItem);
}

export function getProblemById(id: string): ProblemBankItem | undefined {
  const q = getPublishedPackage(id);
  return q ? toLegacyItem(q) : undefined;
}

export function getPublicProblem(id: string) {
  const q = getPublishedPackage(id);
  if (!q || q.status !== "published") return undefined;
  const view = toPublicView(q);
  const { reference_solutions: _r, ...legacy } = toLegacyItem(q);
  return {
    ...legacy,
    difficulty: q.difficulty,
    io_format: view.io_format,
    estimated_minutes: view.estimated_minutes,
    revision: view.revision,
    complexity: view.complexity,
    test_cases: q.test_cases.filter((t) => t.is_public),
  };
}
