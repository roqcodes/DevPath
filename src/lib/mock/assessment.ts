import type { AssessmentQuestion, AssessmentResult, SkillDomain } from "@/lib/types/app";

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    question: "What does git pull primarily do?",
    options: [
      "Upload local changes to a remote repository",
      "Fetch and integrate changes from a remote repository",
      "Create a new repository",
      "Delete the current branch",
    ],
    correctIndex: 1,
    domain: "git",
    difficulty: "easy",
  },
  {
    id: "q2",
    question: "Which command creates a new branch and switches to it?",
    options: ["git branch new-feature", "git checkout -b new-feature", "git merge new-feature", "git stash new-feature"],
    correctIndex: 1,
    domain: "git",
    difficulty: "medium",
  },
  {
    id: "q3",
    question: "What is a Docker image?",
    options: [
      "A running instance of an application",
      "A read-only template for creating containers",
      "A network configuration file",
      "A CI/CD pipeline definition",
    ],
    correctIndex: 1,
    domain: "docker",
    difficulty: "easy",
  },
  {
    id: "q4",
    question: "Which Dockerfile instruction sets the base image?",
    options: ["RUN", "COPY", "FROM", "EXPOSE"],
    correctIndex: 2,
    domain: "docker",
    difficulty: "easy",
  },
  {
    id: "q5",
    question: "What is the primary purpose of a CI pipeline?",
    options: [
      "Deploy directly to production without testing",
      "Automatically build and test code on every change",
      "Replace version control systems",
      "Manage user authentication",
    ],
    correctIndex: 1,
    domain: "ci_cd",
    difficulty: "medium",
  },
  {
    id: "q6",
    question: "Which practice ensures code changes don't break existing functionality?",
    options: ["Manual code review only", "Automated testing", "Skipping staging environments", "Disabling linting"],
    correctIndex: 1,
    domain: "testing",
    difficulty: "easy",
  },
  {
    id: "q7",
    question: "What does a unit test typically verify?",
    options: [
      "The entire application end-to-end",
      "A single function or component in isolation",
      "Network latency between services",
      "Production server uptime",
    ],
    correctIndex: 1,
    domain: "testing",
    difficulty: "medium",
  },
  {
    id: "q8",
    question: "What is a blue-green deployment?",
    options: [
      "Deploying only on weekends",
      "Running two identical environments and switching traffic between them",
      "Using only container orchestration",
      "A type of database migration",
    ],
    correctIndex: 1,
    domain: "deployment",
    difficulty: "hard",
  },
  {
    id: "q9",
    question: "Which Git command shows the commit history?",
    options: ["git status", "git log", "git diff", "git remote"],
    correctIndex: 1,
    domain: "git",
    difficulty: "easy",
  },
  {
    id: "q10",
    question: "What does docker-compose primarily help with?",
    options: [
      "Compiling source code",
      "Defining and running multi-container applications",
      "Managing Git branches",
      "Writing unit tests",
    ],
    correctIndex: 1,
    domain: "docker",
    difficulty: "medium",
  },
];

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  git: "Git",
  docker: "Docker",
  ci_cd: "CI/CD",
  testing: "Testing",
  deployment: "Deployment",
};

export function getMockAssessment(): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS;
}

export function calculateAssessmentResult(answers: Record<string, number>): AssessmentResult {
  const domainScores: Record<SkillDomain, { correct: number; total: number }> = {
    git: { correct: 0, total: 0 },
    docker: { correct: 0, total: 0 },
    ci_cd: { correct: 0, total: 0 },
    testing: { correct: 0, total: 0 },
    deployment: { correct: 0, total: 0 },
  };

  for (const q of ASSESSMENT_QUESTIONS) {
    domainScores[q.domain].total++;
    if (answers[q.id] === q.correctIndex) {
      domainScores[q.domain].correct++;
    }
  }

  const baselineScores: Record<SkillDomain, number> = {
    git: 82,
    docker: 41,
    ci_cd: 35,
    testing: 57,
    deployment: 28,
  };

  const skills = (Object.keys(domainScores) as SkillDomain[]).map((domain) => {
    const ratio = domainScores[domain].total > 0
      ? domainScores[domain].correct / domainScores[domain].total
      : 0;
    const adjusted = Math.round(baselineScores[domain] * 0.6 + ratio * 100 * 0.4);
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      score: Math.min(100, Math.max(0, adjusted)),
    };
  });

  const avg = skills.reduce((s, sk) => s + sk.score, 0) / skills.length;
  const overallReadiness = avg >= 60 ? "Intermediate" : avg >= 35 ? "Beginner" : "Beginner";

  return {
    skills,
    overallReadiness,
    summary:
      "You're comfortable with version control fundamentals. Your biggest opportunity is containerization and deployment. Focus on Docker and CI/CD to accelerate your DevOps readiness.",
    completedAt: new Date().toISOString(),
  };
}

export function getMockAssessmentResult(): AssessmentResult {
  return calculateAssessmentResult({
    q1: 1, q2: 1, q3: 1, q4: 0, q5: 1,
    q6: 1, q7: 1, q8: 0, q9: 1, q10: 0,
  });
}
