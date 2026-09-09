import type { ProjectData } from "@/lib/types/app";

export function getMockProject(completedStageIds: string[] = []): ProjectData {
  const stages = [
    {
      id: "stage-git",
      title: "Git Repository",
      objective: "Set up version control for the application",
      requirements: ["Initialize repository", "Create main branch", "Add .gitignore"],
      completed: completedStageIds.includes("stage-git") || completedStageIds.length >= 1,
    },
    {
      id: "stage-testing",
      title: "Testing",
      objective: "Add automated tests for core functionality",
      requirements: ["Write unit tests", "Achieve 80% coverage", "Tests pass in CI"],
      completed: completedStageIds.includes("stage-testing") || completedStageIds.length >= 2,
    },
    {
      id: "stage-docker",
      title: "Dockerization",
      objective: "Containerize the application",
      requirements: ["Create Dockerfile", "Build image", "Run container locally"],
      completed: completedStageIds.includes("stage-docker") || completedStageIds.length >= 3,
    },
    {
      id: "stage-cicd",
      title: "CI Pipeline",
      objective: "Automate build and test workflow",
      requirements: ["Configure GitHub Actions", "Run tests on push", "Build Docker image"],
      completed: completedStageIds.includes("stage-cicd"),
    },
    {
      id: "stage-deploy",
      title: "Deployment",
      objective: "Deploy to a staging environment",
      requirements: ["Configure deployment target", "Set environment variables", "Verify deployment"],
      completed: completedStageIds.includes("stage-deploy"),
    },
  ];

  const completedStages = stages.filter((s) => s.completed).length;

  return {
    title: "Final Mission",
    description: "Ship a containerized application through a CI/CD pipeline.",
    stages,
    progress: Math.round((completedStages / stages.length) * 100),
    completedStages,
    totalStages: stages.length,
  };
}

export const PROJECT_COMPETENCY = {
  skills: [
    { domain: "Git", level: "Strong" },
    { domain: "Docker", level: "Strong" },
    { domain: "CI/CD", level: "Competent" },
    { domain: "Testing", level: "Strong" },
    { domain: "Deployment", level: "Competent" },
  ],
  score: 91,
};
