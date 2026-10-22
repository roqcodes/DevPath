export type RankingScope = "batch" | "department" | "cohort" | "college";
export type RankingPeriod = "weekly" | "monthly" | "all-time";
export type RankingCategory = "practice_points" | "unique_solved" | "consistency";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  department: string;
  academicYear: string;
  batch: string;
  admissionCohort: string;
  score: number;
  uniqueSolved: number;
  currentStreak: number;
  profilePublic: boolean;
}

export interface LeaderboardResult {
  rows: LeaderboardRow[];
  viewerRank: number | null;
  periodLabel: string;
  category: RankingCategory;
  scope: RankingScope;
  emptyReason?: string;
}
