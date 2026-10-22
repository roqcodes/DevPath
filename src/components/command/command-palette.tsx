"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, CornerDownLeft, Layers, Play, Repeat, Search, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { askCompanion } from "@/components/companion";
import { Kbd } from "@/components/ui/kbd";
import { useApp } from "@/lib/context/app-context";
import { DSA_SYLLABUS, getNextIncompleteLesson } from "@/lib/data/dsa-syllabus";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/components/layout/nav-items";
import { COMMAND_OPEN_EVENT, SHORTCUTS_OPEN_EVENT } from "@/components/layout/use-shell-data";

type Group = "Actions" | "Go to" | "Modules" | "Lessons";

interface CommandItem {
  id: string;
  label: string;
  group: Group;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  href?: string;
  run?: (query: string) => void;
}

const GROUP_ORDER: Group[] = ["Actions", "Go to", "Modules", "Lessons"];

/** Subsequence fuzzy score: higher is better, -1 = no match. Rewards contiguous runs and word starts. */
function fuzzyScore(text: string, query: string): number {
  if (!query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const direct = t.indexOf(q);
  if (direct >= 0) return 1000 - direct + (direct === 0 || t[direct - 1] === " " ? 200 : 0);
  let score = 0;
  let ti = 0;
  let run = 0;
  for (const ch of q) {
    if (ch === " ") continue;
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    run = found === ti ? run + 1 : 0;
    score += 10 + run * 5 + (found === 0 || t[found - 1] === " " ? 15 : 0) - (found - ti);
    ti = found + 1;
  }
  return score;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["g", "d"], label: "Go to Today" },
  { keys: ["g", "p"], label: "Go to Path" },
  { keys: ["g", "l"], label: "Go to Learn" },
  { keys: ["g", "r"], label: "Go to Review" },
  { keys: ["g", "a"], label: "Go to Arena" },
  { keys: ["↑", "↓"], label: "Move through results" },
  { keys: ["Enter"], label: "Open selected result" },
  { keys: ["Esc"], label: "Close dialog" },
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || !!el.closest("[role=textbox],.cm-editor,.monaco-editor");
}

export function CommandPalette() {
  const router = useRouter();
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const listId = useId();
  const chordAt = useRef(0);

  const openPalette = useCallback(() => {
    returnFocus.current = (document.activeElement as HTMLElement) ?? null;
    setHelpOpen(false);
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const openHelp = useCallback(() => {
    returnFocus.current = (document.activeElement as HTMLElement) ?? null;
    setOpen(false);
    setHelpOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setOpen(false);
    setHelpOpen(false);
    const el = returnFocus.current;
    returnFocus.current = null;
    if (el && document.contains(el)) requestAnimationFrame(() => el.focus());
  }, []);

  const continueHref = useMemo(() => {
    const last = state.progress.lastVisitedLesson;
    const next = last ?? getNextIncompleteLesson(state.progress.completedLessons);
    return next ? `/learn/${next.moduleSlug}/${next.lessonSlug}` : "/learn";
  }, [state.progress.lastVisitedLesson, state.progress.completedLessons]);

  const items = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [
      {
        id: "ask-kip",
        label: "Ask Kip…",
        group: "Actions",
        icon: Sparkles,
        hint: "Type a question, then Enter",
        keywords: "ai help explain companion tutor question",
        run: (q) => askCompanion(q.trim() || "What should I study next?", { surface: "command", detail: q }),
      },
      { id: "continue", label: "Continue where I left off", group: "Actions", icon: Play, href: continueHref, keywords: "resume lesson next" },
      { id: "start-review", label: "Start review", group: "Actions", icon: Repeat, href: "/review", keywords: "spaced repetition flashcards cards due" },
    ];
    const routes: CommandItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV, { href: "/profile", label: "Profile", icon: BookOpen }].map((n) => ({
      id: `route:${n.href}`,
      label: n.label,
      group: "Go to" as const,
      icon: n.icon,
      href: n.href,
      hint: n.chord ? `g ${n.chord}` : undefined,
    }));
    const modules: CommandItem[] = DSA_SYLLABUS.map((m) => ({
      id: `mod:${m.slug}`,
      label: m.title,
      group: "Modules" as const,
      icon: Layers,
      href: `/learn/${m.slug}`,
      hint: `${m.lessons.length} lessons`,
      keywords: m.description,
    }));
    const lessons: CommandItem[] = DSA_SYLLABUS.flatMap((m) =>
      m.lessons.map((l) => ({
        id: `les:${l.id}`,
        label: l.title,
        group: "Lessons" as const,
        icon: BookOpen,
        href: `/learn/${m.slug}/${l.slug}`,
        hint: m.title,
        keywords: m.title,
      }))
    );
    return [...actions, ...routes, ...modules, ...lessons];
  }, [continueHref]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return items.filter((i) => i.group === "Actions" || i.group === "Go to");
    const scored = items
      .map((item) => {
        const s = Math.max(fuzzyScore(item.label, q), fuzzyScore(item.keywords ?? "", q) - 300);
        return { item, s: item.id === "ask-kip" ? Math.max(s, 1) : s };
      })
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.item);
    return GROUP_ORDER.flatMap((g) => scored.filter((i) => i.group === g));
  }, [items, query]);

  const run = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      closeAll();
      if (item.run) item.run(query);
      else if (item.href) router.push(item.href);
    },
    [closeAll, query, router]
  );

  useEffect(() => {
    const onOpen = () => openPalette();
    const onHelp = () => openHelp();
    window.addEventListener(COMMAND_OPEN_EVENT, onOpen);
    window.addEventListener(SHORTCUTS_OPEN_EVENT, onHelp);

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closeAll();
        else openPalette();
        return;
      }
      if (open || helpOpen || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      if (e.key === "?") {
        e.preventDefault();
        openHelp();
        return;
      }
      const now = Date.now();
      if (e.key === "g") {
        chordAt.current = now;
        return;
      }
      if (now - chordAt.current < 1200) {
        chordAt.current = 0;
        const target = PRIMARY_NAV.find((n) => n.chord === e.key.toLowerCase());
        if (target) {
          e.preventDefault();
          router.push(target.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(COMMAND_OPEN_EVENT, onOpen);
      window.removeEventListener(SHORTCUTS_OPEN_EVENT, onHelp);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, helpOpen, openPalette, openHelp, closeAll, router]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (helpOpen) helpRef.current?.focus();
  }, [helpOpen]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAll();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  if (!open && !helpOpen) return null;

  if (helpOpen) {
    return (
      <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeAll} aria-hidden />
        <div
          ref={helpRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeAll();
            if (e.key === "Tab") e.preventDefault();
          }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl focus:outline-none motion-safe:animate-fade-in"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="shortcuts-title" className="text-sm font-bold text-slate-900">
              Keyboard shortcuts
            </h2>
            <Kbd>Esc</Kbd>
          </div>
          <ul className="divide-y divide-slate-100">
            {SHORTCUTS.map((s) => (
              <li key={s.label} className="flex items-center justify-between py-2 text-xs text-slate-600">
                <span>{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k, i) => (
                    <span key={k + i} className="flex items-center gap-1">
                      {i > 0 && s.keys[0] === "g" && <span className="text-[10px] text-slate-400">then</span>}
                      <Kbd>{k}</Kbd>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const activeId = results[active] ? `${listId}-${active}` : undefined;
  let lastGroup: Group | null = null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[10vh] sm:px-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={closeAll} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl motion-safe:animate-fade-in"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search pages, lessons and actions"
            placeholder="Search lessons, pages, or ask Kip…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            className="h-12 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        <ul ref={listRef} id={listId} role="listbox" aria-label="Results" className="flex-1 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-xs text-slate-500" role="presentation">
              Nothing matches &ldquo;{query}&rdquo;. Try a topic like &ldquo;binary search&rdquo;.
            </li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const Icon = item.icon;
            const selected = i === active;
            return (
              <li key={item.id} role="presentation">
                {header && (
                  <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400" aria-hidden>
                    {header}
                  </p>
                )}
                <div
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                    selected ? "bg-indigo-50 text-indigo-900" : "text-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.id === "ask-kip" && query.trim() ? `Ask Kip: “${query.trim()}”` : item.label}
                  </span>
                  {item.hint && <span className="hidden shrink-0 truncate text-[11px] text-slate-400 sm:block sm:max-w-40">{item.hint}</span>}
                  {selected && (item.href ? <ArrowRight className="h-3.5 w-3.5 text-indigo-500" aria-hidden /> : <CornerDownLeft className="h-3.5 w-3.5 text-indigo-500" aria-hidden />)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
          <span className="flex items-center gap-1"><Kbd>Enter</Kbd> open</span>
          <button
            type="button"
            onClick={openHelp}
            className="ml-auto hidden items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex"
          >
            All shortcuts
          </button>
        </div>
      </div>
    </div>
  );
}
