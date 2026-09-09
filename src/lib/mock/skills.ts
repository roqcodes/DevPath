import type { SkillNode, SkillScore } from "@/lib/types/app";

export function getMockSkillGraph(): SkillNode[] {
  return [
    {
      id: "git",
      label: "Git",
      domain: "git",
      status: "mastered",
      children: [
        { id: "git-branching", label: "Branching", domain: "git", status: "learning" },
        { id: "git-merging", label: "Merging", domain: "git", status: "needs_practice" },
        { id: "git-remote", label: "Remote workflows", domain: "git", status: "locked" },
      ],
    },
    {
      id: "docker",
      label: "Docker",
      domain: "docker",
      status: "learning",
      children: [
        { id: "docker-images", label: "Images", domain: "docker", status: "locked" },
        { id: "docker-containers", label: "Containers", domain: "docker", status: "locked" },
        { id: "docker-networking", label: "Networking", domain: "docker", status: "locked" },
      ],
    },
    {
      id: "cicd",
      label: "CI/CD",
      domain: "ci_cd",
      status: "needs_practice",
      children: [
        { id: "cicd-pipelines", label: "Pipelines", domain: "ci_cd", status: "locked" },
        { id: "cicd-automation", label: "Automation", domain: "ci_cd", status: "locked" },
        { id: "cicd-deploy", label: "Deployment", domain: "ci_cd", status: "locked" },
      ],
    },
    {
      id: "testing",
      label: "Testing",
      domain: "testing",
      status: "learning",
      children: [
        { id: "testing-unit", label: "Unit", domain: "testing", status: "locked" },
        { id: "testing-integration", label: "Integration", domain: "testing", status: "locked" },
        { id: "testing-automation", label: "Automation", domain: "testing", status: "locked" },
      ],
    },
    {
      id: "deployment",
      label: "Deployment",
      domain: "deployment",
      status: "needs_practice",
      children: [
        { id: "deploy-env", label: "Environments", domain: "deployment", status: "locked" },
        { id: "deploy-config", label: "Configuration", domain: "deployment", status: "locked" },
        { id: "deploy-strategies", label: "Deployment strategies", domain: "deployment", status: "locked" },
      ],
    },
  ];
}

export function getMockSkillScores(): SkillScore[] {
  return [
    { domain: "git", label: "Git", score: 82 },
    { domain: "docker", label: "Docker", score: 41 },
    { domain: "ci_cd", label: "CI/CD", score: 35 },
    { domain: "testing", label: "Testing", score: 57 },
    { domain: "deployment", label: "Deployment", score: 28 },
  ];
}

export const ACHIEVEMENTS = [
  { id: "a1", title: "First Commit", description: "Completed Git Foundations", date: "Sep 5" },
  { id: "a2", title: "Branch Explorer", description: "Created your first feature branch", date: "Sep 7" },
  { id: "a3", title: "Assessment Complete", description: "Finished DevOps baseline assessment", date: "Sep 4" },
];
