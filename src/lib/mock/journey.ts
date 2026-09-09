import type { JourneyData, JourneyCheckpoint, CheckpointStatus } from "@/lib/types/app";

function cp(
  id: string,
  title: string,
  description: string,
  domain: JourneyCheckpoint["domain"],
  status: CheckpointStatus,
  minutes: number,
  slug: string,
  type: JourneyCheckpoint["type"] = "lesson"
): JourneyCheckpoint {
  return {
    id,
    title,
    description,
    domain,
    status,
    estimatedMinutes: minutes,
    difficulty: status === "locked" ? "intermediate" : "beginner",
    type,
    moduleSlug: slug,
  };
}

export function getMockJourney(completedIds: string[] = [], currentId = "cp-branches-merging"): JourneyData {
  const phases = [
    {
      id: "phase-1",
      number: 1,
      title: "Version Control",
      domain: "git" as const,
      checkpoints: [
        cp("cp-git-foundations", "Git Foundations", "Learn repository basics and commits", "git", completedIds.includes("cp-git-foundations") ? "completed" : "completed", 15, "git-foundations"),
        cp("cp-branches-merging", "Branches & Merging", "Work with branches independently", "git", currentId === "cp-branches-merging" ? "current" : completedIds.includes("cp-branches-merging") ? "completed" : "current", 12, "git-branching"),
        cp("cp-remote-collab", "Remote Collaboration", "Push, pull, and resolve conflicts", "git", completedIds.includes("cp-remote-collab") ? "completed" : "locked", 18, "git-remote"),
      ],
    },
    {
      id: "phase-2",
      number: 2,
      title: "Containers",
      domain: "docker" as const,
      checkpoints: [
        cp("cp-docker-fundamentals", "Docker Fundamentals", "Understand containers and images", "docker", completedIds.includes("cp-docker-fundamentals") ? "completed" : "locked", 20, "docker-fundamentals"),
        cp("cp-images-containers", "Images & Containers", "Build and run container images", "docker", "locked", 25, "docker-images"),
        cp("cp-docker-networking", "Docker Networking", "Connect containers across networks", "docker", "locked", 22, "docker-networking"),
      ],
    },
    {
      id: "phase-3",
      number: 3,
      title: "CI/CD",
      domain: "ci_cd" as const,
      checkpoints: [
        cp("cp-pipeline-basics", "Pipeline Basics", "Understand CI/CD workflows", "ci_cd", "locked", 20, "cicd-basics"),
        cp("cp-github-actions", "GitHub Actions", "Build automated pipelines", "ci_cd", "locked", 30, "cicd-actions"),
        cp("cp-cicd-quiz", "CI/CD Checkpoint Quiz", "Validate pipeline knowledge", "ci_cd", "locked", 10, "cicd-quiz", "quiz"),
      ],
    },
    {
      id: "phase-4",
      number: 4,
      title: "Testing",
      domain: "testing" as const,
      checkpoints: [
        cp("cp-unit-testing", "Unit Testing", "Write and run unit tests", "testing", "locked", 18, "testing-unit"),
        cp("cp-integration-testing", "Integration Testing", "Test service interactions", "testing", "locked", 22, "testing-integration"),
        cp("cp-testing-quiz", "Testing Checkpoint Quiz", "Validate testing knowledge", "testing", "locked", 10, "testing-quiz", "quiz"),
      ],
    },
    {
      id: "phase-5",
      number: 5,
      title: "Deployment",
      domain: "deployment" as const,
      checkpoints: [
        cp("cp-environments", "Environments", "Manage dev, staging, and production", "deployment", "locked", 15, "deploy-environments"),
        cp("cp-deploy-strategies", "Deployment Strategies", "Blue-green and rolling deployments", "deployment", "locked", 20, "deploy-strategies"),
        cp("cp-deploy-quiz", "Deployment Checkpoint Quiz", "Validate deployment knowledge", "deployment", "locked", 10, "deploy-quiz", "quiz"),
      ],
    },
  ];

  const allCheckpoints = phases.flatMap((p) => p.checkpoints);
  const completed = allCheckpoints.filter((c) => c.status === "completed").length;
  const progress = Math.round((completed / allCheckpoints.length) * 100) || 42;

  return {
    title: "Your DevOps Journey",
    durationDays: 21,
    progress: Math.max(progress, completedIds.length > 0 ? progress : 42),
    phases,
    currentCheckpointId: currentId,
    estimatedCompletion: "October 1, 2026",
  };
}
