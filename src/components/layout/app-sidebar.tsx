"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { CompanionAvatar } from "@/components/companion";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV, isActive, type NavItem } from "./nav-items";
import { useReviewsDue } from "./use-shell-data";

function SidebarLink({ item, active, badge }: { item: NavItem; active: boolean; badge?: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        active
          ? "bg-indigo-50/90 text-indigo-700 font-semibold ring-1 ring-indigo-200/70"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span
          className="min-w-5 rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums text-white"
          aria-label={`${badge} reviews due`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
      {item.chord && !badge ? (
        <span className="hidden font-mono text-[10px] text-slate-300 group-hover:text-slate-400 xl:inline" aria-hidden>
          g {item.chord}
        </span>
      ) : null}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useApp();
  const due = useReviewsDue();
  const name = state.user.displayName || state.user.name || "Student";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex"
      aria-label="Sidebar"
    >
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Logo href="/dashboard" size="sm" />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3.5 py-4">
        <nav aria-label="Main" className="space-y-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Learn</p>
          {PRIMARY_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              badge={item.href === "/review" ? due : undefined}
            />
          ))}
        </nav>
        <nav aria-label="More" className="space-y-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">You</p>
          {SECONDARY_NAV.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-3.5">
          <div className="flex items-center gap-2.5">
            <CompanionAvatar mood="idle" size={28} />
            <p className="text-[11px] leading-snug text-slate-600">
              Stuck? Press{" "}
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-500">Ctrl K</kbd>{" "}
              and ask Kip.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-3.5">
        <Link
          href="/profile"
          className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-xs font-semibold text-white ring-2 ring-indigo-100">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600">{name}</span>
            <span className="truncate text-[11px] text-slate-500">View profile</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
