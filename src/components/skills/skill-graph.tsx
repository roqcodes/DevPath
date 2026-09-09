"use client";

import { getMockSkillGraph } from "@/lib/mock/skills";
import type { SkillNode, SkillLevel } from "@/lib/types/app";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SkillLevel, { dot: string; label: string; text: string }> = {
  mastered: { dot: "bg-success", label: "Mastered", text: "text-success" },
  learning: { dot: "bg-accent", label: "Learning", text: "text-accent" },
  needs_practice: { dot: "bg-warning", label: "Needs practice", text: "text-warning" },
  locked: { dot: "bg-zinc-600", label: "Locked", text: "text-muted-foreground" },
};

function SkillTreeNode({ node, depth = 0 }: { node: SkillNode; depth?: number }) {
  const style = STATUS_STYLES[node.status];
  return (
    <div className={cn(depth > 0 && "ml-6 border-l border-border pl-4")}>
      <div className="flex items-center gap-3 py-2 group">
        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", style.dot)} />
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-medium", node.status === "locked" ? "text-muted-foreground" : "")}>
            {node.label}
          </span>
        </div>
        <span className={cn("text-[10px] font-medium uppercase tracking-wider", style.text)}>
          {style.label}
        </span>
      </div>
      {node.children?.map((child) => (
        <SkillTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function SkillGraph() {
  const graph = getMockSkillGraph();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {graph.map((domain) => (
        <div
          key={domain.id}
          className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/20"
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
            <div className={cn("h-3 w-3 rounded-full", STATUS_STYLES[domain.status].dot)} />
            <h3 className="font-semibold">{domain.label}</h3>
            <span className={cn("ml-auto text-xs font-medium", STATUS_STYLES[domain.status].text)}>
              {STATUS_STYLES[domain.status].label}
            </span>
          </div>
          {domain.children?.map((child) => (
            <SkillTreeNode key={child.id} node={child} depth={1} />
          ))}
        </div>
      ))}
    </div>
  );
}
