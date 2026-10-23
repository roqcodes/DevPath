import type { QuestionPackage } from "@/lib/questions/types";
import { hashQuestionContent } from "@/lib/questions/content-hash";
import { detectDuplicateQuestionIds, validateQuestionPackage } from "@/lib/questions/validate";
import { verifyReferenceSolution } from "@/lib/judge/orchestrator";
import { getExistingContentHashes } from "./content-hashes";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ImportFileInput {
  name: string;
  content: unknown;
}

export interface ImportPreviewItem {
  id: string;
  file: string;
  status: "valid" | "invalid" | "duplicate_in_batch" | "idempotent" | "changed" | "new";
  issues?: string[];
  contentHash?: string;
  referenceVerified?: boolean;
  referenceError?: string;
}

export interface ImportPreviewReport {
  batchId: string;
  items: ImportPreviewItem[];
  summary: {
    valid: number;
    invalid: number;
    new: number;
    idempotent: number;
    changed: number;
    rejectedInBatch: number;
  };
  verifyReferences: boolean;
}

const MAX_FILES = 200;
const MAX_FILE_BYTES = 512_000;

export async function previewImport(
  files: ImportFileInput[],
  options: { verifyReferences?: boolean; actorUserId?: string } = {}
): Promise<ImportPreviewReport> {
  const batchId = crypto.randomUUID();
  const existingHashes = await getExistingContentHashes();
  const items: ImportPreviewItem[] = [];
  const validPackages: QuestionPackage[] = [];

  if (files.length > MAX_FILES) {
    return {
      batchId,
      items: [{ id: "-", file: "batch", status: "invalid", issues: [`Max ${MAX_FILES} files per import`] }],
      summary: { valid: 0, invalid: 1, new: 0, idempotent: 0, changed: 0, rejectedInBatch: 0 },
      verifyReferences: false,
    };
  }

  for (const file of files) {
    if (file.name.includes("..") || file.name.includes("\\")) {
      items.push({ id: "-", file: file.name, status: "invalid", issues: ["Invalid path"] });
      continue;
    }
    const size = JSON.stringify(file.content).length;
    if (size > MAX_FILE_BYTES) {
      items.push({ id: "-", file: file.name, status: "invalid", issues: ["File too large"] });
      continue;
    }

    const { valid, issues, question } = validateQuestionPackage(file.content);
    if (!valid || !question) {
      items.push({
        id: "-",
        file: file.name,
        status: "invalid",
        issues: issues.map((i) => `${i.path}: ${i.message}`),
      });
      continue;
    }

    validPackages.push(question);
  }

  const dupesInBatch = detectDuplicateQuestionIds(validPackages);
  const dupeSet = new Set(dupesInBatch);

  for (const question of validPackages) {
    const file = files.find((f) => {
      try {
        const q = validateQuestionPackage(f.content).question;
        return q?.id === question.id;
      } catch {
        return false;
      }
    })?.name ?? question.id;

    if (dupeSet.has(question.id)) {
      items.push({ id: question.id, file, status: "duplicate_in_batch" });
      continue;
    }

    const hash = hashQuestionContent(question);
    const prev = existingHashes.get(question.id);

    let status: ImportPreviewItem["status"] = "new";
    if (prev === hash) status = "idempotent";
    else if (prev) status = "changed";

    let referenceVerified: boolean | undefined;
    let referenceError: string | undefined;
    if (options.verifyReferences) {
      const result = await verifyReferenceSolution(question);
      referenceVerified = result.verdict === "accepted";
      if (!referenceVerified) {
        referenceError = result.judgeError ?? `Reference failed: ${result.verdict}`;
      }
    }

    items.push({
      id: question.id,
      file,
      status,
      contentHash: hash,
      referenceVerified,
      referenceError,
    });
  }

  const summary = {
    valid: items.filter((i) => i.status !== "invalid" && i.status !== "duplicate_in_batch").length,
    invalid: items.filter((i) => i.status === "invalid").length,
    new: items.filter((i) => i.status === "new").length,
    idempotent: items.filter((i) => i.status === "idempotent").length,
    changed: items.filter((i) => i.status === "changed").length,
    rejectedInBatch: items.filter((i) => i.status === "duplicate_in_batch").length,
  };

  const admin = createAdminClient();
  if (admin) {
    await admin.from("question_import_batches").insert({
      id: batchId,
      actor_user_id: options.actorUserId ?? null,
      status: "preview",
      report_json: { items, summary },
    });
  }

  return {
    batchId,
    items,
    summary,
    verifyReferences: Boolean(options.verifyReferences),
  };
}

export async function publishImportItems(
  batchId: string,
  approvedIds: string[],
  packages: QuestionPackage[]
): Promise<{ published: string[]; failed: { id: string; error: string }[] }> {
  const { publishQuestionToDatabase } = await import("./problem-repository.server");
  const published: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of approvedIds) {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) {
      failed.push({ id, error: "Package not found in batch" });
      continue;
    }
    if (pkg.status !== "published" && pkg.status !== "review") {
      failed.push({ id, error: "Question must be review or published status to import" });
      continue;
    }
    const toPublish = { ...pkg, status: "published" as const };
    const res = await publishQuestionToDatabase(toPublish, batchId);
    if (res.ok) published.push(id);
    else failed.push({ id, error: res.error ?? "Unknown error" });
  }

  return { published, failed };
}
