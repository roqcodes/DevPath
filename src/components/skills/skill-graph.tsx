"use client";

import { useState } from "react";
import { getMockSkillGraph, getSkillHoverDetail, getStatusLabel } from "@/lib/mock/skills";
import type { SkillNode, SkillLevel } from "@/lib/types/app";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SkillLevel, { dot: string; ring: string; label: string; text: string }> = {
  mastered: { dot: "bg-success", ring: "ring-success/30", label: "MASTERED", text: "text-success" },
  learning: { dot: "bg-accent", ring: "ring-accent/30", label: "IN PROGRESS", text: "text-accent" },
  needs_practice: { dot: "bg-warning", ring: "ring-warning/30", label: "NEEDS PRACTICE", text: "text-warning" },
  locked: { dot: "bg-zinc-300", ring: "ring-border", label: "LOCKED", text: "text-muted-foreground" },
};

function SkillTreeNode({ node, depth = 0 }: { node: SkillNode; depth?: number }) {
  const [hovered, setHovered] = useState(false);
  const style = STATUS_STYLES[node.status];
  const detail = getSkillHoverDetail(node.id, node.label);

  return (
    <div className={cn("relative", depth > 0 && "ml-5 pl-4 border-l border-border")}>
      <div
        className="flex items-center gap-3 py-2 group cursor-default"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={cn("h-2 w-2 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-card", style.dot, style.ring)} />
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-medium", node.status === "locked" ? "text-muted-foreground" : "")}>
            {node.label}
          </span>
          {node.score !== undefined && node.score > 0 && (
            <span className="ml-2 text-xs tabular-nums text-muted-foreground">{node.score}%</span>
          )}
        </div>
        <span className={cn("text-[9px] font-semibold uppercase tracking-wider", style.text)}>
          {getStatusLabel(node.status)}
        </span>
      </div>
      {hovered && node.score !== undefined && (
        <div className="absolute left-6 top-full z-10 mt-1 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg animate-fade-in whitespace-pre-line">
          {detail}
        </div>
      )}
      {node.children?.map((child) => (
        <SkillTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function SkillGraph() {
  const graph = getMockSkillGraph();

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-8 bottom-8 w-px bg-border hidden lg:block -translate-x-1/2" />
      <div className="grid gap-5 lg:grid-cols-5">
        {graph.map((domain) => {
          const style = STATUS_STYLES[domain.status];
          return (
            <div
              key={domain.id}
              className="hover-lift rounded-lg border border-border bg-card p-4 transition-all"
            >
              <div className="flex flex-col items-center text-center mb-4 pb-3 border-b border-border">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full ring-4 mb-2",
                  style.ring,
                  domain.status === "mastered" ? "bg-success/10" : domain.status === "learning" ? "bg-accent/10" : "bg-muted"
                )}>
                  <span className="text-lg font-bold tabular-nums">{domain.score ?? 0}</span>
                </div>
                <h3 className="font-semibold text-sm">{domain.label}</h3>
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider mt-1", style.text)}>
                  {getStatusLabel(domain.status)}
                </span>
              </div>
              {domain.children?.map((child) => (
                <SkillTreeNode key={child.id} node={child} depth={0} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
