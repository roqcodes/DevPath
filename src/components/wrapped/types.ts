export interface WrappedStats {
  periodLabel: string;
  xp: number;
  level: number;
  levelTitle: string;
  streakCurrent: number;
  streakLongest: number;
  lessonsCompleted: number;
  problemsSolved: number;
  interviewRounds: number;
  totalXpInPeriod: number;
  activeDays: number;
  persona: string;
  personaBlurb: string;
  bigOAge: string;
  topWin: string;
  headline: string;
}

export interface WrappedSlide {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  metric?: string;
  metricLabel?: string;
  accent: "indigo" | "cyan" | "amber" | "emerald";
}
