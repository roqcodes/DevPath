import type { MentorContext } from "@/lib/types/app";

const MENTOR_CONTEXTS: Record<string, MentorContext> = {
  "git-branching": {
    moduleTitle: "Branching & Merging",
    checkpointTitle: "Creating Feature Branches",
    task: "Create a feature branch called feature/navbar and switch to it.",
    intro:
      "You're working on Git branches. Create a new branch for the navbar changes without modifying main.",
    hints: [
      { id: 1, text: "Think about the Git command that creates a branch." },
      { id: 2, text: "There's a command that creates and switches to a branch in one step." },
    ],
    solution: "git checkout -b feature/navbar",
  },
  "git-foundations": {
    moduleTitle: "Git Foundations",
    checkpointTitle: "Repository Basics",
    task: "Initialize a new Git repository.",
    intro: "Let's start with the basics. Every Git project begins with initializing a repository.",
    hints: [
      { id: 1, text: "Git needs to be told this folder is a repository first." },
      { id: 2, text: "The init command creates a .git directory." },
    ],
    solution: "git init",
  },
  default: {
    moduleTitle: "DevOps Learning",
    checkpointTitle: "Current Checkpoint",
    task: "Complete the current challenge.",
    intro: "Focus on the checkpoint objective. Apply what you've learned in the lesson.",
    hints: [
      { id: 1, text: "Review the lesson content for guidance." },
      { id: 2, text: "Check the code example tab for reference." },
    ],
    solution: "Refer to the lesson for the solution.",
  },
};

const MENTOR_RESPONSES: Record<string, string[]> = {
  branch: [
    "A branch is an independent line of development. Use `git branch` to list branches and `git checkout -b <name>` to create and switch.",
    "Branches let you work on features without affecting the main codebase. Always create a branch for new work.",
  ],
  merge: [
    "Merging combines changes from one branch into another. Use `git merge <branch-name>` after switching to the target branch.",
  ],
  checkout: [
    "`git checkout` switches between branches. Add `-b` to create a new branch: `git checkout -b feature/name`.",
  ],
  default: [
    "That's a great question. Review the lesson tab for context on this checkpoint.",
    "Think about what command achieves the task described in the challenge. The terminal tab is where you'll practice.",
    "Consider the Git workflow: modify → stage → commit → push. Which step applies here?",
  ],
};

export function getMockMentorContext(moduleSlug: string): MentorContext {
  return MENTOR_CONTEXTS[moduleSlug] ?? MENTOR_CONTEXTS.default;
}

export function getMockMentorResponse(query: string, moduleSlug: string): string {
  const lower = query.toLowerCase();
  if (lower.includes("branch")) return MENTOR_RESPONSES.branch[0];
  if (lower.includes("merge")) return MENTOR_RESPONSES.merge[0];
  if (lower.includes("checkout") || lower.includes("switch")) return MENTOR_RESPONSES.checkout[0];

  const ctx = getMockMentorContext(moduleSlug);
  const responses = MENTOR_RESPONSES.default;
  const idx = query.length % responses.length;
  return `${responses[idx]} For this checkpoint: ${ctx.task}`;
}
