import type { AILearningPlan, JourneyAIInsight, LearningIntelligence } from "@/lib/types/app";

export function getLearningIntelligence(progress?: {
  readinessScore?: number;
  streak?: number;
  daysRemaining?: number;
  xp?: number;
}, journeyProgress = 42): LearningIntelligence {
  return {
    readinessScore: progress?.readinessScore ?? 72,
    journeyProgress,
    streak: progress?.streak ?? 7,
    daysRemaining: progress?.daysRemaining ?? 12,
    competencyLevel: "Intermediate",
    paceMessage: "You're progressing faster than your planned pace.",
    xp: progress?.xp ?? 420,
  };
}

export function getAILearningPlan(): AILearningPlan {
  return {
    priorities: [
      "Docker fundamentals",
      "CI/CD pipelines",
      "Deployment workflows",
    ],
    insight:
      "Git fundamentals have been accelerated because you already demonstrate strong proficiency.",
  };
}

export function getJourneyAIInsight(): JourneyAIInsight {
  return {
    message:
      "You've mastered Git fundamentals faster than expected. I'm moving Docker fundamentals earlier in your journey.",
    recommendedCheckpointSlug: "git-branching",
    recommendedTitle: "Branches & Merging",
  };
}

export const READINESS_REPORT = {
  overallScore: 91,
  competencies: [
    { domain: "Git", level: "Advanced" },
    { domain: "Docker", level: "Proficient" },
    { domain: "CI/CD", level: "Proficient" },
    { domain: "Testing", level: "Advanced" },
    { domain: "Deployment", level: "Proficient" },
  ],
  projectItems: [
    { label: "Containerized application", completed: true },
    { label: "CI pipeline", completed: true },
    { label: "Automated testing", completed: true },
    { label: "Deployment", completed: true },
  ],
  mentorAssessment:
    "Demonstrated practical understanding across the core DevOps workflow.",
};
