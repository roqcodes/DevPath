import type { QuestionPackage, PublicProblemView } from "./types";

export function toPublicView(q: QuestionPackage): PublicProblemView {
  return {
    id: q.id,
    slug: q.slug,
    title: q.title,
    difficulty: q.difficulty,
    topics: q.topics,
    prerequisites: q.prerequisites ?? [],
    estimated_minutes: q.estimated_minutes,
    revision: q.revision,
    statement: q.statement,
    io_format: q.io_format,
    constraints: q.constraints,
    examples: q.examples,
    execution: q.execution,
    hints: q.hints,
    editorial: q.editorial,
    complexity: q.complexity,
    public_test_count: q.test_cases.filter((t) => t.is_public).length,
  };
}
