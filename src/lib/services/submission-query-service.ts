import { createClient } from "@/lib/supabase/server";

export interface SubmissionHistoryRow {
  id: string;
  problemId: string;
  language: string;
  verdict: string;
  passedTests: number;
  totalTests: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
  sourceCode: string;
}

export async function listSubmissionHistory(
  userId: string,
  options?: { problemId?: string; limit?: number }
): Promise<SubmissionHistoryRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const limit = Math.min(options?.limit ?? 20, 50);
  let query = supabase
    .from("submissions")
    .select(
      "id, problem_id, language, verdict, passed_tests, total_tests, runtime_ms, memory_kb, created_at, source_code"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.problemId) {
    query = query.eq("problem_id", options.problemId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    problemId: row.problem_id,
    language: row.language,
    verdict: row.verdict,
    passedTests: row.passed_tests,
    totalTests: row.total_tests,
    runtimeMs: row.runtime_ms,
    memoryKb: row.memory_kb,
    createdAt: row.created_at,
    sourceCode: row.source_code,
  }));
}
