/**
 * Versioned scoring policy — single source of truth for ranking points.
 * v1: first unique accepted problem awards difficulty-based points; repeats award 0.
 */
export const SCORING_POLICY_VERSION = "v1";

export const SCORING_POLICY = {
  version: SCORING_POLICY_VERSION,
  description:
    "Practice points reward the first accepted solution per problem. Lesson checkpoints award a small bounded bonus once.",
  rules: [
    "First accepted solution per problem: points from problem difficulty metadata.",
    "Repeat accepts on the same problem: 0 additional practice points.",
    "Lesson checkpoint (mastery): +15 points once per lesson.",
    "Consistency boards use qualifying active days, not raw open time.",
  ],
  lessonMasteryPoints: 15,
};

export function problemSolvedIdempotencyKey(problemId: string): string {
  return `problem_solved:${problemId}`;
}

export function lessonMasteryIdempotencyKey(lessonId: string): string {
  return `lesson_mastery:${lessonId}`;
}
