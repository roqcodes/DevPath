import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Code2,
  GitBranch,
  LayoutDashboard,
  Medal,
  RotateCcw,
  Settings,
  Sparkles,
  Swords,
  Trophy,
  User,
} from "lucide-react";

export interface CommandAction {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
  shortcut?: string;
  group: "Navigate" | "Study" | "Account";
}

/** Single source of truth for ⌘K / Ctrl+K palette entries and shortcut cheatsheet. */
export const COMMAND_ACTIONS: CommandAction[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home workspace", shortcut: "G D", group: "Navigate" },
  { id: "path", label: "Learning path", href: "/path", icon: GitBranch, keywords: "roadmap map nodes", shortcut: "G P", group: "Navigate" },
  { id: "learn", label: "Learn curriculum", href: "/learn", icon: BookOpen, keywords: "lessons syllabus modules", shortcut: "G L", group: "Study" },
  { id: "practice", label: "Problem bank", href: "/practice", icon: Code2, keywords: "judge code problems", shortcut: "G B", group: "Study" },
  { id: "review", label: "Spaced review", href: "/review", icon: RotateCcw, keywords: "flashcards srs", shortcut: "G R", group: "Study" },
  { id: "arena", label: "Interview arena", href: "/arena", icon: Swords, keywords: "mock interview", group: "Study" },
  { id: "achievements", label: "Achievements", href: "/achievements", icon: Medal, keywords: "badges trophies", group: "Navigate" },
  { id: "wrapped", label: "Year wrapped", href: "/wrapped", icon: Sparkles, keywords: "recap stats share", group: "Navigate" },
  { id: "rankings", label: "Rankings", href: "/rankings", icon: Trophy, keywords: "leaderboard batch", group: "Navigate" },
  { id: "profile", label: "Profile", href: "/profile", icon: User, group: "Account" },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, group: "Account" },
];

export const GLOBAL_SHORTCUTS = [
  { keys: "⌘K / Ctrl+K", description: "Open command palette" },
  { keys: "G then D", description: "Go to dashboard" },
  { keys: "G then P", description: "Go to learning path" },
  { keys: "G then L", description: "Go to learn" },
  { keys: "G then B", description: "Go to problem bank" },
  { keys: "G then R", description: "Go to review queue" },
  { keys: "Esc", description: "Close palette / dialogs" },
] as const;
