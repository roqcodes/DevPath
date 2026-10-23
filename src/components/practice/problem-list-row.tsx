"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Clock,
  Link2,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { askCompanion } from "@/components/companion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { PublicProblemView } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

function difficultyVariant(label: string): "success" | "warning" | "rose" {
  const lower = label.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner") || lower.includes("foundation")) {
    return "success";
  }
  if (lower.includes("med") || lower.includes("intermediate")) {
    return "warning";
  }
  return "rose";
}

export interface ProblemListRowProps {
  problem: PublicProblemView;
  solved: boolean;
  attempted: boolean;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

export function ProblemListRow({
  problem,
  solved,
  attempted,
  bookmarked,
  onToggleBookmark,
}: ProblemListRowProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const href = `/practice/${problem.id}`;

  const openProblem = useCallback(() => {
    router.push(href);
  }, [router, href]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${href}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", tone: "success" });
    } catch {
      toast({ title: "Clipboard unavailable", tone: "warning" });
    }
    setMenuOpen(false);
  };

  const askKip = () => {
    askCompanion(`Help me approach "${problem.title}"`, {
      surface: "practice",
      subject: problem.title,
      detail: problem.topics.join(", "),
    });
    setMenuOpen(false);
  };

  const statusBadge =
    solved ? (
      <Badge variant="success" dot size="sm">Solved</Badge>
    ) : attempted ? (
      <Badge variant="warning" dot size="sm">Attempted</Badge>
    ) : null;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openProblem}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProblem();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 sm:px-4",
        "transition-colors hover:border-indigo-300 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700 sm:text-base">
            {problem.title}
          </span>
          <Badge variant={difficultyVariant(problem.difficulty.label)} size="sm" className="shrink-0 capitalize">
            {problem.difficulty.label}
          </Badge>
          {statusBadge}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          {problem.topics.slice(0, 3).map((t) => (
            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
              {t}
            </span>
          ))}
          {problem.topics.length > 3 && (
            <span className="text-slate-400">+{problem.topics.length - 3}</span>
          )}
          <span className="inline-flex items-center gap-0.5 text-slate-400">
            <Clock className="h-3 w-3" aria-hidden />
            ~{problem.estimated_minutes}m
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1" onClick={stop}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-indigo-600"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark problem"}
          aria-pressed={bookmarked}
          onClick={onToggleBookmark}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-indigo-600 text-indigo-600")} />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={solved ? "outline" : "default"}
          className="hidden h-8 text-xs font-semibold sm:inline-flex"
          onClick={openProblem}
        >
          {solved ? "Review" : "Solve"}
        </Button>

        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
            aria-label="More actions"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[10.5rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={askKip}
              >
                <MessageCircle className="h-4 w-4 text-indigo-500" />
                Ask Kip
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={copyLink}
              >
                <Link2 className="h-4 w-4 text-slate-500" />
                Copy link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
