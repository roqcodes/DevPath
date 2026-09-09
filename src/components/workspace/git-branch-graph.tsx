import { GitBranch } from "lucide-react";
import type { WorkspaceGitState } from "@/lib/types/app";
import { cn } from "@/lib/utils";

interface GitBranchGraphProps {
  gitState: WorkspaceGitState;
  completed?: boolean;
}

export function GitBranchGraph({ gitState, completed }: GitBranchGraphProps) {
  const featureBranches = gitState.branches.filter((b) => b !== "main");

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Live repository state
          </p>
          <h3 className="text-sm font-semibold mt-0.5">Branch graph</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs">
          <GitBranch className="h-3.5 w-3.5 text-accent" aria-hidden />
          <span className="font-mono">{gitState.currentBranch}</span>
          <span className="text-muted-foreground">HEAD</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-5 font-mono text-sm overflow-x-auto">
        <div className="min-w-[280px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-accent">main</span>
            <span className="text-muted-foreground">────●────●</span>
            {gitState.currentBranch === "main" && (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">HEAD</span>
            )}
          </div>

          {featureBranches.map((branch, i) => {
            const isHead = gitState.currentBranch === branch;
            const indent = i % 2 === 0 ? "ml-8" : "ml-14";

            return (
              <div key={branch} className={cn("flex items-center gap-2", indent)}>
                <span className="text-muted-foreground">\</span>
                <span className={cn(isHead ? "text-accent" : "text-foreground/80")}>{branch}</span>
                <span className="text-muted-foreground">──●</span>
                {isHead && (
                  <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">HEAD</span>
                )}
                {completed && branch === "feature/navbar" && (
                  <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">new</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            git status
          </p>
          <p className="font-mono text-xs text-foreground/90">On branch {gitState.currentBranch}</p>
          <p className="font-mono text-xs text-muted-foreground mt-1">nothing to commit, working tree clean</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Local branches
          </p>
          <ul className="space-y-1">
            {gitState.branches.map((branch) => (
              <li key={branch} className="font-mono text-xs flex items-center gap-2">
                <span className={branch === gitState.currentBranch ? "text-accent" : "text-muted-foreground"}>
                  {branch === gitState.currentBranch ? "*" : " "}
                </span>
                <span className={branch === gitState.currentBranch ? "text-accent font-medium" : ""}>
                  {branch}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        This view updates as you run commands in the Terminal. Create{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">feature/navbar</code> to
        see a new branch appear here.
      </p>
    </div>
  );
}
