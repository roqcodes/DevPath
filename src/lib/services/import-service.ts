import type { ProblemBankItem } from "@/lib/types/sait";
import { detectDuplicateIds, validateProblemJson } from "@/lib/problems/validate-problem";
import { listPublishedPackages } from "@/lib/questions/published-meta";

export interface ImportReport {
  accepted: string[];
  skippedDuplicates: string[];
  rejected: { file: string; issues: string[] }[];
  idempotent: string[];
}

/** @deprecated Use import-pipeline previewImport for v2 packages */
export function validateImportPayload(
  files: { name: string; content: unknown }[],
  existingIds: Set<string> = new Set(listPublishedPackages().map((p) => p.id))
): ImportReport {
  const report: ImportReport = {
    accepted: [],
    skippedDuplicates: [],
    rejected: [],
    idempotent: [],
  };

  const batchProblems: ProblemBankItem[] = [];
  for (const file of files) {
    const { valid, issues, problem } = validateProblemJson(file.content);
    if (!valid || !problem) {
      report.rejected.push({
        file: file.name,
        issues: issues.map((i) => `${i.path}: ${i.message}`),
      });
      continue;
    }
    batchProblems.push(problem);
  }

  const dupesInBatch = detectDuplicateIds(batchProblems);
  if (dupesInBatch.length) {
    report.rejected.push({
      file: "batch",
      issues: dupesInBatch.map((id) => `Duplicate id in import: ${id}`),
    });
    return report;
  }

  for (const problem of batchProblems) {
    if (existingIds.has(problem.id)) {
      report.skippedDuplicates.push(problem.id);
      continue;
    }
    report.accepted.push(problem.id);
    existingIds.add(problem.id);
  }

  return report;
}
