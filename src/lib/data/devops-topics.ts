export const DEVOPS_TOPICS = [
  "git",
  "docker",
  "ci_cd",
  "testing",
  "deployment",
] as const;

export type DevOpsTopic = (typeof DEVOPS_TOPICS)[number];

export const TOPIC_LABELS: Record<DevOpsTopic, string> = {
  git: "Git",
  docker: "Docker",
  ci_cd: "CI/CD",
  testing: "Testing",
  deployment: "Deployment",
};

export const TOPIC_DESCRIPTIONS: Record<DevOpsTopic, string> = {
  git: "Version control and collaboration",
  docker: "Containerization and images",
  ci_cd: "Continuous integration and delivery",
  testing: "Automated testing strategies",
  deployment: "Production deployment workflows",
};

export const TOPIC_ICONS: Record<DevOpsTopic, string> = {
  git: "⎇",
  docker: "◫",
  ci_cd: "⟳",
  testing: "T",
  deployment: "▲",
};
