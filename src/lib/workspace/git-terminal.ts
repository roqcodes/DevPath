import type { WorkspaceGitState } from "@/lib/types/app";

export interface GitCommandResult {
  lines: string[];
  gitState: WorkspaceGitState;
  challengePassed?: boolean;
}

function cloneState(state: WorkspaceGitState): WorkspaceGitState {
  return {
    branches: [...state.branches],
    currentBranch: state.currentBranch,
    commits: { ...state.commits },
  };
}

function formatBranchList(state: WorkspaceGitState): string[] {
  return state.branches.map((branch) => {
    const marker = branch === state.currentBranch ? "* " : "  ";
    return `${marker}${branch}`;
  });
}

function formatStatus(state: WorkspaceGitState): string[] {
  return [
    `On branch ${state.currentBranch}`,
    state.currentBranch === "main"
      ? "Your branch is up to date with 'origin/main'."
      : "nothing to commit, working tree clean",
  ];
}

function formatLogGraph(state: WorkspaceGitState): string[] {
  const lines: string[] = [];
  const mainCommits = state.commits.main ?? 2;
  const featureCommits = state.commits[state.currentBranch] ?? 1;

  if (state.branches.includes("main")) {
    lines.push(`* ${"a1b2c3d".slice(0, 7)} (main) Initial project setup`);
    if (mainCommits > 1) {
      lines.push(`* ${"d4e5f6a".slice(0, 7)} Add base layout`);
    }
  }

  for (const branch of state.branches) {
    if (branch === "main") continue;
    const head = branch === state.currentBranch ? ` (HEAD -> ${branch})` : ` (${branch})`;
    const hash = branch.replace(/\//g, "").slice(0, 7).padEnd(7, "0");
    lines.unshift(`* ${hash}${head} Work on ${branch.split("/").pop()}`);
    if (featureCommits > 1) {
      lines.unshift(`* ${(hash + "1").slice(0, 7)} Refine ${branch.split("/").pop()}`);
    }
  }

  return lines.length ? lines : ["* a1b2c3d (main) Initial commit"];
}

export function runGitCommand(
  command: string,
  state: WorkspaceGitState,
  expectedCommand?: string
): GitCommandResult {
  const next = cloneState(state);
  const trimmed = command.trim();
  const parts = trimmed.split(/\s+/);
  const sub = parts[1] ?? "";

  if (trimmed === expectedCommand) {
    const branchName = parts[3] ?? "feature/navbar";
    if (!next.branches.includes(branchName)) {
      next.branches.push(branchName);
    }
    next.currentBranch = branchName;
    next.commits[branchName] = 1;
    return {
      lines: [
        `Switched to a new branch '${branchName}'`,
        "✓ Branch created successfully",
      ],
      gitState: next,
      challengePassed: true,
    };
  }

  if (parts[0] !== "git") {
    return {
      lines: [`command not found: ${parts[0]}`],
      gitState: next,
    };
  }

  if (sub === "status") {
    return { lines: formatStatus(next), gitState: next };
  }

  if (sub === "branch") {
    if (parts[2] === "-a") {
      return {
        lines: [
          ...next.branches.map((b) => `  ${b}`),
          ...next.branches.map((b) => `  remotes/origin/${b}`),
        ],
        gitState: next,
      };
    }
    return { lines: formatBranchList(next), gitState: next };
  }

  if (sub === "checkout") {
    const target = parts[2] === "-b" ? parts[3] : parts[2];
    if (!target) {
      return { lines: ["error: pathspec required"], gitState: next };
    }
    if (parts[2] === "-b") {
      if (next.branches.includes(target)) {
        return { lines: [`fatal: A branch named '${target}' already exists.`], gitState: next };
      }
      next.branches.push(target);
      next.currentBranch = target;
      next.commits[target] = 1;
      return { lines: [`Switched to a new branch '${target}'`], gitState: next };
    }
    if (!next.branches.includes(target)) {
      return { lines: [`error: pathspec '${target}' did not match any file(s) known to git`], gitState: next };
    }
    next.currentBranch = target;
    return { lines: [`Switched to branch '${target}'`], gitState: next };
  }

  if (sub === "log" && parts.includes("--oneline")) {
    return { lines: formatLogGraph(next), gitState: next };
  }

  if (sub === "merge") {
    const source = parts[2];
    if (!source || !next.branches.includes(source)) {
      return { lines: [`merge: ${source ?? "?"} - not something we can merge`], gitState: next };
    }
    return {
      lines: [
        `Merge made by the 'ort' strategy.`,
        ` ${source} | 12 +++++++++---`,
        ` 1 file changed, 12 insertions(+), 4 deletions(-)`,
      ],
      gitState: next,
    };
  }

  return {
    lines: [`git: '${sub}' — try git status, git branch, or git checkout -b <name>`],
    gitState: next,
  };
}
