import type { SkillNode, SkillScore } from "@/lib/types/app";

const SKILL_DETAILS: Record<string, { score: number; checkpoints: number }> = {
  "git-branching": { score: 82, checkpoints: 3 },
  "git-merging": { score: 65, checkpoints: 1 },
  "git-remote": { score: 0, checkpoints: 0 },
  "docker-images": { score: 35, checkpoints: 0 },
  "docker-containers": { score: 28, checkpoints: 0 },
  "docker-networking": { score: 0, checkpoints: 0 },
  "cicd-pipelines": { score: 35, checkpoints: 0 },
  "cicd-automation": { score: 0, checkpoints: 0 },
  "cicd-deploy": { score: 0, checkpoints: 0 },
  "testing-unit": { score: 57, checkpoints: 0 },
  "testing-integration": { score: 42, checkpoints: 0 },
  "testing-automation": { score: 0, checkpoints: 0 },
  "deploy-env": { score: 28, checkpoints: 0 },
  "deploy-config": { score: 0, checkpoints: 0 },
  "deploy-strategies": { score: 0, checkpoints: 0 },
};

export function getMockSkillGraph(): SkillNode[] {
  return [
    {
      id: "git",
      label: "Git",
      domain: "git",
      status: "mastered",
      score: 82,
      children: [
        { id: "git-branching", label: "Branching", domain: "git", status: "learning", score: 82, checkpointsCompleted: 3 },
        { id: "git-merging", label: "Merging", domain: "git", status: "needs_practice", score: 65, checkpointsCompleted: 1 },
        { id: "git-remote", label: "Remote workflows", domain: "git", status: "locked", score: 0, checkpointsCompleted: 0 },
      ],
    },
    {
      id: "docker",
      label: "Docker",
      domain: "docker",
      status: "learning",
      score: 41,
      children: [
        { id: "docker-images", label: "Images", domain: "docker", status: "locked", score: 35, checkpointsCompleted: 0 },
        { id: "docker-containers", label: "Containers", domain: "docker", status: "locked", score: 28, checkpointsCompleted: 0 },
        { id: "docker-networking", label: "Networking", domain: "docker", status: "locked", score: 0, checkpointsCompleted: 0 },
      ],
    },
    {
      id: "cicd",
      label: "CI/CD",
      domain: "ci_cd",
      status: "needs_practice",
      score: 35,
      children: [
        { id: "cicd-pipelines", label: "Pipelines", domain: "ci_cd", status: "locked", score: 35, checkpointsCompleted: 0 },
        { id: "cicd-automation", label: "Automation", domain: "ci_cd", status: "locked", score: 0, checkpointsCompleted: 0 },
        { id: "cicd-deploy", label: "Deployment", domain: "ci_cd", status: "locked", score: 0, checkpointsCompleted: 0 },
      ],
    },
    {
      id: "testing",
      label: "Testing",
      domain: "testing",
      status: "learning",
      score: 57,
      children: [
        { id: "testing-unit", label: "Unit", domain: "testing", status: "locked", score: 57, checkpointsCompleted: 0 },
        { id: "testing-integration", label: "Integration", domain: "testing", status: "locked", score: 42, checkpointsCompleted: 0 },
        { id: "testing-automation", label: "Automation", domain: "testing", status: "locked", score: 0, checkpointsCompleted: 0 },
      ],
    },
    {
      id: "deployment",
      label: "Deployment",
      domain: "deployment",
      status: "needs_practice",
      score: 28,
      children: [
        { id: "deploy-env", label: "Environments", domain: "deployment", status: "locked", score: 28, checkpointsCompleted: 0 },
        { id: "deploy-config", label: "Configuration", domain: "deployment", status: "locked", score: 0, checkpointsCompleted: 0 },
        { id: "deploy-strategies", label: "Deployment strategies", domain: "deployment", status: "locked", score: 0, checkpointsCompleted: 0 },
      ],
    },
  ];
}

export function getSkillHoverDetail(nodeId: string, label: string): string {
  const d = SKILL_DETAILS[nodeId];
  if (!d) return label;
  return `${label} — ${d.score}%\n${d.checkpoints} checkpoints completed`;
}

const STATUS_LABELS: Record<string, string> = {
  mastered: "MASTERED",
  learning: "IN PROGRESS",
  needs_practice: "NEEDS PRACTICE",
  locked: "LOCKED",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
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
