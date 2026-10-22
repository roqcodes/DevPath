import type { RankingScope } from "@/lib/types/rankings";

export interface ScopeProfileFields {
  department_id: string | null;
  batch: string | null;
  admission_cohort: string | null;
}

export function matchesRankingScope(
  row: ScopeProfileFields,
  viewer: ScopeProfileFields,
  scope: RankingScope
): boolean {
  if (scope === "college") return true;
  if (scope === "department") return row.department_id === viewer.department_id;
  if (scope === "cohort") return row.admission_cohort === viewer.admission_cohort;
  return (
    row.department_id === viewer.department_id &&
    row.batch === viewer.batch &&
    row.admission_cohort === viewer.admission_cohort
  );
}

export interface RankableRow {
  userId: string;
  score: number;
  displayName: string;
}

/** Stable sort: higher score first; ties broken alphabetically by display name. */
export function assignRanks(rows: RankableRow[]): { userId: string; rank: number; score: number }[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.displayName.localeCompare(b.displayName);
  });
  return sorted.map((r, i) => ({ userId: r.userId, rank: i + 1, score: r.score }));
}
