"use client";

/**
 * Kip — DevPath AI companion. Public API for the rest of the app.
 */

import "./kip-motion.css";

import { useCallback, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { consumeAiStream } from "@/lib/ai/stream-client";
import type { AiMode } from "@/lib/companion/types";
import { cn } from "@/lib/utils";
import { dispatchAskCompanion } from "./companion-events";
import { CompanionBriefingCard } from "./briefing";
import { KipAvatar } from "./kip-avatar";
import { CompanionPresenceDock } from "./presence";

export type CompanionMood =
  | "idle"
  | "thinking"
  | "excited"
  | "proud"
  | "concerned"
  | "sleepy"
  | "focused";

export interface CompanionContext {
  surface: string;
  subject?: string;
  detail?: string;
}

const ASSIST_MODES: { mode: AiMode; label: string }[] = [
  { mode: "explain", label: "Explain" },
  { mode: "eli5", label: "ELI5" },
  { mode: "deeper", label: "Deeper" },
  { mode: "example", label: "Example" },
  { mode: "quiz", label: "Quiz me" },
];

/** Animated SVG avatar. Pure presentation. */
export function CompanionAvatar({
  mood = "idle",
  size = 40,
  className,
}: {
  mood?: CompanionMood;
  size?: number;
  className?: string;
}) {
  return <KipAvatar mood={mood} size={size} className={className} />;
}

/** Inline in-context companion line (speech + optional quick actions). */
export function CompanionNote({
  mood = "idle",
  children,
  actions,
  className,
}: {
  mood?: CompanionMood;
  children: ReactNode;
  actions?: { label: string; onClick: () => void }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl border border-indigo-100/80 bg-indigo-50/50 px-3 py-2.5",
        className
      )}
    >
      <CompanionAvatar mood={mood} size={28} className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="text-xs leading-relaxed text-slate-800">{children}</div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Contextual AI actions that stream an answer inline. */
export function CompanionAssist({ context, className }: { context: CompanionContext; className?: string }) {
  const [active, setActive] = useState<AiMode | null>(null);
  const [mood, setMood] = useState<CompanionMood>("idle");
  const [text, setText] = useState("");
  const [source, setSource] = useState<"live" | "demo" | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (mode: AiMode) => {
      setActive(mode);
      setText("");
      setSource(null);
      setLoading(true);
      setMood("thinking");
      try {
        const result = await consumeAiStream({ mode, context }, (delta) => setText((t) => t + delta));
        setSource(result.source);
        setMood("focused");
      } catch {
        setText("Kip hit a snag. Try again.");
        setMood("concerned");
      } finally {
        setLoading(false);
      }
    },
    [context]
  );

  return (
    <div className={cn("space-y-3", className)} data-surface={context.surface}>
      <div className="flex flex-wrap gap-1.5">
        {ASSIST_MODES.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            disabled={loading}
            onClick={() => void run(mode)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
              active === mode
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {(text || loading) && (
        <CompanionNote mood={mood}>
          {loading && !text ? (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{text}</span>
          )}
          {source && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {source === "live" ? "Live model" : "Demo script"}
            </p>
          )}
        </CompanionNote>
      )}
    </div>
  );
}

/** Global ambient companion (mounted once in the app shell). */
export function CompanionPresence() {
  return <CompanionPresenceDock />;
}

/** Daily briefing card from Kip. */
export function CompanionBriefing({ className }: { className?: string }) {
  return <CompanionBriefingCard className={className} />;
}

/** Programmatically open the companion with a prompt in a given context. */
export function askCompanion(prompt: string, context?: CompanionContext): void {
  dispatchAskCompanion(prompt, context);
}
