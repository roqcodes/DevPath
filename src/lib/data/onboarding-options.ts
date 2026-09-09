import type {
  DailyCommitment,
  ExperienceLevel,
  LearningDuration,
  LearningGoal,
  SkillRating,
  UserRole,
} from "@/lib/types/profile";

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "software_developer", label: "Software Developer" },
  { value: "backend_developer", label: "Backend Developer" },
  { value: "frontend_developer", label: "Frontend Developer" },
  { value: "devops_engineer", label: "DevOps Engineer" },
  { value: "system_administrator", label: "System Administrator" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE_OPTIONS: {
  value: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "starting_from_zero",
    label: "Starting from zero",
    description: "I'm new to DevOps and want to learn the fundamentals.",
  },
  {
    value: "seen_basics",
    label: "I've seen the basics",
    description: "I've heard of DevOps concepts but haven't used them much.",
  },
  {
    value: "work_with_tools",
    label: "I can work with some tools",
    description: "I've used Git, Docker, or CI/CD in limited contexts.",
  },
  {
    value: "comfortable_workflows",
    label: "I'm comfortable with DevOps workflows",
    description: "I regularly use DevOps tools in my day-to-day work.",
  },
  {
    value: "already_experienced",
    label: "I'm already experienced",
    description: "I have solid DevOps experience and want to deepen my skills.",
  },
];

export const SKILL_RATING_OPTIONS: { value: SkillRating; label: string }[] = [
  { value: 0, label: "Never used" },
  { value: 1, label: "Basic" },
  { value: 2, label: "Comfortable" },
  { value: 3, label: "Advanced" },
];

export const GOAL_OPTIONS: { value: LearningGoal; label: string; description: string }[] = [
  {
    value: "learn_from_scratch",
    label: "Learn DevOps from scratch",
    description: "Build a solid foundation across all core areas.",
  },
  {
    value: "deployment_ready",
    label: "Become deployment-ready",
    description: "Master the skills needed to ship code to production.",
  },
  {
    value: "build_projects",
    label: "Build real projects",
    description: "Apply DevOps practices through hands-on projects.",
  },
  {
    value: "prepare_interviews",
    label: "Prepare for interviews",
    description: "Get interview-ready with practical DevOps knowledge.",
  },
  {
    value: "improve_workflow",
    label: "Improve my development workflow",
    description: "Streamline how you build, test, and deploy software.",
  },
];

export const DURATION_OPTIONS: { value: LearningDuration; label: string }[] = [
  { value: "7_days", label: "7 days" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "2_months", label: "2 months" },
  { value: "3_months", label: "3 months" },
];

export const DAILY_TIME_OPTIONS: { value: DailyCommitment; label: string }[] = [
  { value: "15_minutes", label: "15 minutes" },
  { value: "30_minutes", label: "30 minutes" },
  { value: "1_hour", label: "1 hour" },
  { value: "2_plus_hours", label: "2+ hours" },
];

export const ONBOARDING_STEPS = [
  { id: 1, label: "Profile", key: "profile" },
  { id: 2, label: "Experience", key: "experience" },
  { id: 3, label: "Interests", key: "interests" },
  { id: 4, label: "Goal", key: "goal" },
  { id: 5, label: "Commitment", key: "commitment" },
] as const;
