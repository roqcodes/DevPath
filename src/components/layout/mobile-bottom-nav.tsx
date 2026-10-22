"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, GitBranch, LayoutDashboard, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/components/command/command-palette";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/path", label: "Path", icon: GitBranch },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/review", label: "Review", icon: RotateCcw },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggle } = useCommandPalette();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors",
                  active ? "text-indigo-700" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-indigo-600")} aria-hidden />
                {tab.label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={toggle}
            className="flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
          >
            <Search className="h-5 w-5" aria-hidden />
            Search
          </button>
        </li>
      </ul>
    </nav>
  );
}
