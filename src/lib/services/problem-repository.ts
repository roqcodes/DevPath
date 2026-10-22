import { createAdminClient } from "@/lib/supabase/admin";
import type { QuestionPackage } from "@/lib/questions/types";
import {
  getQuestionFromDisk,
  listPublishedFromDisk,
  loadQuestionBankFromDisk,
  toPublicView,
} from "@/lib/questions/file-loader.server";
import { hashQuestionContent } from "@/lib/questions/content-hash";
import type { PublicProblemView } from "@/lib/questions/types";

export interface ProblemListQuery {
  page: number;
  limit: number;
  search?: string;
  topic?: string;
  difficulty?: string;
  sort?: "title" | "difficulty" | "newest";
}

export interface ProblemListResult {
  items: PublicProblemView[];
  total: number;
  page: number;
  limit: number;
}

function filterAndSort(items: QuestionPackage[], q: ProblemListQuery): QuestionPackage[] {
  let list = items.filter((p) => p.status === "published");
  if (q.search) {
    const s = q.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.id.includes(s) ||
        p.topics.some((t) => t.includes(s))
    );
  }
  if (q.topic) list = list.filter((p) => p.topics.includes(q.topic!));
  if (q.difficulty) list = list.filter((p) => p.difficulty.label === q.difficulty);

  switch (q.sort) {
    case "title":
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "difficulty":
      list.sort((a, b) => a.difficulty.score - b.difficulty.score);
      break;
    default:
      list.sort((a, b) => a.id.localeCompare(b.id));
  }
  return list;
}

export async function listPublicProblems(query: ProblemListQuery): Promise<ProblemListResult> {
  const all = listPublishedFromDisk();
  const filtered = filterAndSort(all, query);
  const total = filtered.length;
  const start = (query.page - 1) * query.limit;
  const slice = filtered.slice(start, start + query.limit).map(toPublicView);
  return { items: slice, total, page: query.page, limit: query.limit };
}

export async function getPublicProblemById(id: string): Promise<PublicProblemView | null> {
  const q = getQuestionFromDisk(id);
  if (!q || q.status !== "published") return null;
  return toPublicView(q);
}

/** Server-only: full package including hidden tests and reference solutions. */
export async function getQuestionForJudging(id: string): Promise<QuestionPackage | null> {
  const admin = createAdminClient();
  if (admin) {
    const { data: row } = await admin
      .from("problems")
      .select("id, review_status, current_revision")
      .eq("id", id)
      .maybeSingle();
    if (row && row.review_status === "published") {
      const disk = getQuestionFromDisk(id);
      if (disk) return disk;
    }
  }
  const disk = getQuestionFromDisk(id);
  if (disk?.status === "published") return disk;
  return null;
}

export async function publishQuestionToDatabase(
  question: QuestionPackage,
  batchId?: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured — questions remain file-backed only." };
  }

  const hash = hashQuestionContent(question);
  const reviewStatus = question.status === "published" ? "published" : "draft";

  const { error: pErr } = await admin.from("problems").upsert(
    {
      id: question.id,
      slug: question.slug,
      title: question.title,
      difficulty: question.difficulty.label,
      difficulty_label: question.difficulty.label,
      difficulty_score: question.difficulty.score,
      topics: question.topics,
      estimated_minutes: question.estimated_minutes,
      review_status: reviewStatus,
      provenance: question.provenance,
      current_revision: question.revision,
      content_hash: hash,
      io_format_json: question.io_format,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (pErr) return { ok: false, error: pErr.message };

  const { error: rErr } = await admin.from("problem_revisions").upsert(
    {
      problem_id: question.id,
      revision: question.revision,
      schema_version: question.schema_version,
      statement: question.statement,
      constraints_text: question.constraints.join("\n"),
      examples_json: question.examples,
      execution_json: question.execution,
      hints_json: question.hints,
      editorial: question.editorial ?? null,
      io_format_json: question.io_format,
      complexity_json: question.complexity ?? null,
      content_hash: hash,
    },
    { onConflict: "problem_id,revision" }
  );
  if (rErr) return { ok: false, error: rErr.message };

  await admin.from("problem_test_cases").delete().eq("problem_id", question.id).eq("revision", question.revision);

  const testRows = question.test_cases.map((tc, i) => ({
    problem_id: question.id,
    revision: question.revision,
    is_public: tc.is_public,
    input_text: tc.input,
    expected_output: tc.expected_output,
    sort_order: i,
  }));
  const { error: tErr } = await admin.from("problem_test_cases").insert(testRows);
  if (tErr) return { ok: false, error: tErr.message };

  await admin.from("reference_solutions").delete().eq("problem_id", question.id).eq("revision", question.revision);

  const solRows = Object.entries(question.reference_solutions).map(([language, source_code]) => ({
    problem_id: question.id,
    revision: question.revision,
    language,
    source_code,
  }));
  if (solRows.length) {
    const { error: sErr } = await admin.from("reference_solutions").insert(solRows);
    if (sErr) return { ok: false, error: sErr.message };
  }

  if (batchId) {
    await admin
      .from("question_import_batches")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", batchId);
  }

  return { ok: true };
}
