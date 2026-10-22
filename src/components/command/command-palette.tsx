"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COMMAND_ACTIONS, type CommandAction } from "./shortcuts";
import { cn } from "@/lib/utils";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingGRef = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_ACTIONS;
    return COMMAND_ACTIONS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.href.toLowerCase().includes(q) ||
        a.keywords?.toLowerCase().includes(q)
    );
  }, [query]);

  const go = useCallback(
    (action: CommandAction) => {
      setOpen(false);
      setQuery("");
      router.push(action.href);
    },
    [router]
  );

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
        return;
      }
      if (!open && pendingGRef.current && !mod && !e.altKey) {
        const letter = e.key.toLowerCase();
        const map: Record<string, string> = {
          d: "/dashboard",
          p: "/path",
          l: "/learn",
          b: "/practice",
          r: "/review",
        };
        if (map[letter]) {
          e.preventDefault();
          pendingGRef.current = false;
          router.push(map[letter]);
          return;
        }
        pendingGRef.current = false;
      }
      if (!open && e.key.toLowerCase() === "g" && !mod && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
        pendingGRef.current = true;
        window.setTimeout(() => {
          pendingGRef.current = false;
        }, 1200);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(1, filtered.length));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        go(filtered[activeIndex]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, go, toggle, router]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    for (const a of filtered) {
      (groups[a.group] ??= []).push(a);
    }
    return groups;
  }, [filtered]);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[min(20vh,8rem)]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Close command palette"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg m-sheet"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page or action…"
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
                esc
              </kbd>
            </div>
            <div className="max-h-[min(50vh,320px)] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No matches.</p>
              )}
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group}
                  </p>
                  <ul>
                    {items.map((action) => {
                      const flatIndex = filtered.indexOf(action);
                      const Icon = action.icon;
                      return (
                        <li key={action.id}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                              flatIndex === activeIndex
                                ? "bg-indigo-50 text-indigo-900"
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            onClick={() => go(action)}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg",
                                  flatIndex === activeIndex
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                )}
                              >
                                <Icon className="h-4 w-4" aria-hidden />
                              </span>
                              {action.label}
                            </span>
                            {action.shortcut && (
                              <kbd className="font-mono text-[10px] text-slate-400">{action.shortcut}</kbd>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}
