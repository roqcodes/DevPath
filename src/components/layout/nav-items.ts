import {
  BookOpen,
  Code2,
  Gift,
  Layers,
  Map,
  MoreHorizontal,
  Repeat,
  Settings,
  Swords,
  Sun,
  Trophy,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** single-key chord after `g` */
  chord?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: Sun, chord: "d" },
  { href: "/path", label: "Path", icon: Map, chord: "p" },
  { href: "/learn", label: "Learn", icon: BookOpen, chord: "l" },
  { href: "/review", label: "Review", icon: Repeat, chord: "r" },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/arena", label: "Arena", icon: Swords, chord: "a" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/achievements", label: "Trophy room", icon: Trophy },
  { href: "/wrapped", label: "Wrapped", icon: Gift },
  { href: "/rankings", label: "Rankings", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_TABS: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: Sun },
  { href: "/path", label: "Path", icon: Map },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/arena", label: "Arena", icon: Swords },
];

export const MORE_ICON = MoreHorizontal;
export const LEARN_ICON = Layers;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
