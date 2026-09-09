import {
  BookOpen,
  Code2,
  GitBranch,
  Target,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { SkillDomain } from "@/lib/types/app";

export interface WorkspaceTab {
  id: "lesson" | "code" | "terminal" | "challenge" | "output";
  label: string;
  icon: LucideIcon;
  hint: string;
}

const GIT_TABS: WorkspaceTab[] = [
  { id: "lesson", label: "Lesson", icon: BookOpen, hint: "Branch workflow concepts" },
  { id: "code", label: "Reference", icon: Code2, hint: "Command cheat sheet" },
  { id: "terminal", label: "Terminal", icon: Terminal, hint: "Run Git commands" },
  { id: "challenge", label: "Challenge", icon: Target, hint: "Your task brief" },
  { id: "output", label: "Branch Graph", icon: GitBranch, hint: "Live repo state" },
];

const DEFAULT_TABS: WorkspaceTab[] = [
  { id: "lesson", label: "Lesson", icon: BookOpen, hint: "Learn the concept" },
  { id: "code", label: "Code", icon: Code2, hint: "Example code" },
  { id: "terminal", label: "Terminal", icon: Terminal, hint: "Practice commands" },
  { id: "challenge", label: "Challenge", icon: Target, hint: "Complete the task" },
];

export function getWorkspaceTabs(domain: SkillDomain, hasChallenge: boolean): WorkspaceTab[] {
  if (domain === "git" && hasChallenge) return GIT_TABS;
  return DEFAULT_TABS.filter((tab) => tab.id !== "challenge" || hasChallenge);
}
