/** Configurable difficulty taxonomy — extend labels here without rewriting UI strings everywhere. */
export const DIFFICULTY_LABELS = [
  "beginner",
  "easy",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type DifficultyLabel = (typeof DIFFICULTY_LABELS)[number];

export const DIFFICULTY_LABEL_SET = new Set<string>(DIFFICULTY_LABELS);

export function isDifficultyLabel(value: string): value is DifficultyLabel {
  return DIFFICULTY_LABEL_SET.has(value);
}

export const RANKING_WEIGHT_BY_LABEL: Record<DifficultyLabel, number> = {
  beginner: 50,
  easy: 100,
  intermediate: 200,
  advanced: 350,
  expert: 500,
};
