import type { RankingRules } from "@/lib/types/sait";
import { RANKING_WEIGHT_BY_LABEL, type DifficultyLabel } from "@/lib/questions/difficulty-config";
import { DIFFICULTY_BY_PROBLEM_ID } from "@/lib/questions/published-meta";

export const RANKING_RULES: RankingRules = {
  description:
    "Rankings use server-side aggregates. Score rewards unique accepted problems with difficulty weighting; repeats do not add points.",
  scoreFormula:
    "score = sum of per-label weights (beginner 50 … expert 500) on first acceptance only",
};

export function computeRankingScore(solvedProblemIds: string[]): number {
  let score = 0;
  const seen = new Set<string>();
  for (const id of solvedProblemIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const meta = DIFFICULTY_BY_PROBLEM_ID[id];
    const label = (meta?.label ?? "easy") as DifficultyLabel;
    score += meta?.score ?? RANKING_WEIGHT_BY_LABEL[label];
  }
  return score;
}
