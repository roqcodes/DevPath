import type { WorkspaceCheckpoint, QuizQuestion } from "@/lib/types/app";

const WORKSPACES: Record<string, WorkspaceCheckpoint> = {
  "git-branching": {
    id: "cp-branches-merging",
    moduleSlug: "git-branching",
    moduleTitle: "Branching & Merging",
    domain: "git",
    title: "Creating Feature Branches",
    checkpointIndex: 3,
    totalCheckpoints: 8,
    type: "practice",
    lesson: {
      content:
        "Branches let you work on changes independently from the main codebase. Each branch is a separate line of development that can be merged back when ready.",
      diagram: `main
 |
 |---- feature/login
 |
 |---- feature/navbar`,
    },
    codeExample: `# Create and switch to a new branch
git checkout -b feature/navbar

# Verify current branch
git branch`,
    terminalOutput: `$ git status

On branch feature/login
nothing to commit, working tree clean`,
    challenge: {
      instruction: "Create a feature branch called feature/navbar and switch to it.",
      expectedCommand: "git checkout -b feature/navbar",
      successMessage: "Branch created successfully.",
    },
  },
  "git-foundations": {
    id: "cp-git-foundations",
    moduleSlug: "git-foundations",
    moduleTitle: "Git Foundations",
    domain: "git",
    title: "Repository Basics",
    checkpointIndex: 1,
    totalCheckpoints: 8,
    type: "lesson",
    lesson: {
      content:
        "A Git repository tracks changes to your project over time. The basic workflow involves modifying files, staging changes, and committing snapshots.",
    },
    codeExample: `git init
git add .
git commit -m "Initial commit"`,
    terminalOutput: `$ git init
Initialized empty Git repository in /project/.git/`,
  },
  "cicd-quiz": {
    id: "cp-cicd-quiz",
    moduleSlug: "cicd-quiz",
    moduleTitle: "CI/CD",
    domain: "ci_cd",
    title: "Checkpoint Quiz",
    checkpointIndex: 5,
    totalCheckpoints: 8,
    type: "quiz",
    lesson: { content: "Test your CI/CD knowledge with this checkpoint quiz." },
  },
  "testing-quiz": {
    id: "cp-testing-quiz",
    moduleSlug: "testing-quiz",
    moduleTitle: "Testing",
    domain: "testing",
    title: "Checkpoint Quiz",
    checkpointIndex: 6,
    totalCheckpoints: 8,
    type: "quiz",
    lesson: { content: "Test your testing knowledge with this checkpoint quiz." },
  },
};

const QUIZZES: Record<string, QuizQuestion[]> = {
  "cicd-quiz": [
    {
      id: "cq1",
      question: "What triggers a CI pipeline?",
      options: ["Manual deployment only", "Code changes pushed to the repository", "Server restart", "Database migration"],
      correctIndex: 1,
      explanation: "CI pipelines are typically triggered automatically when code is pushed or a pull request is opened.",
    },
    {
      id: "cq2",
      question: "What is the main benefit of automated testing in CI?",
      options: ["Faster manual reviews", "Early detection of bugs before deployment", "Reduced code size", "Elimination of staging"],
      correctIndex: 1,
      explanation: "Automated tests catch regressions early in the development cycle.",
    },
    {
      id: "cq3",
      question: "Which file commonly defines GitHub Actions workflows?",
      options: [".github/workflows/*.yml", "docker-compose.yml", "package.json", ".env"],
      correctIndex: 0,
      explanation: "GitHub Actions workflows are defined in YAML files under .github/workflows/.",
    },
    {
      id: "cq4",
      question: "What does CD stand for in CI/CD?",
      options: ["Code Development", "Continuous Delivery/Deployment", "Container Distribution", "Central Database"],
      correctIndex: 1,
      explanation: "CD refers to Continuous Delivery or Continuous Deployment — automating releases to production.",
    },
    {
      id: "cq5",
      question: "Why use environment secrets in CI pipelines?",
      options: ["To speed up builds", "To securely store credentials and API keys", "To reduce test coverage", "To skip code review"],
      correctIndex: 1,
      explanation: "Secrets management keeps sensitive credentials out of source code.",
    },
  ],
  "testing-quiz": [
    {
      id: "tq1",
      question: "What does a unit test verify?",
      options: ["Full user workflows", "Individual functions in isolation", "Network configuration", "Database backups"],
      correctIndex: 1,
      explanation: "Unit tests focus on the smallest testable parts of an application.",
    },
    {
      id: "tq2",
      question: "Integration tests check:",
      options: ["Single functions only", "Interactions between components", "UI colors", "Git history"],
      correctIndex: 1,
      explanation: "Integration tests verify that multiple components work together correctly.",
    },
    {
      id: "tq3",
      question: "Test coverage measures:",
      options: ["Lines of code written", "Percentage of code executed by tests", "Number of developers", "Deployment frequency"],
      correctIndex: 1,
      explanation: "Coverage indicates how much of your codebase is exercised by your test suite.",
    },
    {
      id: "tq4",
      question: "TDD stands for:",
      options: ["Total Data Deployment", "Test-Driven Development", "Type Definition Design", "Team Development Dashboard"],
      correctIndex: 1,
      explanation: "TDD is a practice where you write tests before implementing features.",
    },
    {
      id: "tq5",
      question: "Mocking in tests is used to:",
      options: ["Replace real dependencies with controlled substitutes", "Delete test files", "Skip assertions", "Deploy to production"],
      correctIndex: 0,
      explanation: "Mocks isolate the code under test by simulating external dependencies.",
    },
  ],
  "git-branching-quiz": [
    {
      id: "gq1",
      question: "What does git branch show?",
      options: ["Remote URLs", "List of branches", "Commit messages", "File differences"],
      correctIndex: 1,
      explanation: "git branch lists all local branches in the repository.",
    },
    {
      id: "gq2",
      question: "Which command merges branch-a into the current branch?",
      options: ["git merge branch-a", "git pull branch-a", "git stash branch-a", "git log branch-a"],
      correctIndex: 0,
      explanation: "git merge integrates changes from the specified branch into your current branch.",
    },
    {
      id: "gq3",
      question: "A fast-forward merge occurs when:",
      options: ["Branches have diverged", "The target branch has no unique commits", "You force push", "You delete a branch"],
      correctIndex: 1,
      explanation: "Fast-forward happens when there are no divergent commits on the target branch.",
    },
    {
      id: "gq4",
      question: "git checkout -b creates:",
      options: ["A remote repository", "A new branch and switches to it", "A merge commit", "A tag"],
      correctIndex: 1,
      explanation: "The -b flag creates a new branch and immediately checks it out.",
    },
    {
      id: "gq5",
      question: "The main branch is typically called:",
      options: ["develop", "main or master", "feature", "release"],
      correctIndex: 1,
      explanation: "Most repositories use 'main' or 'master' as the default primary branch.",
    },
  ],
};

export function getMockModule(slug: string): WorkspaceCheckpoint | null {
  return WORKSPACES[slug] ?? WORKSPACES["git-branching"];
}

export function getMockQuiz(slug: string): QuizQuestion[] {
  return QUIZZES[slug] ?? QUIZZES["git-branching-quiz"];
}

export function getDefaultWorkspaceSlug(): string {
  return "git-branching";
}
