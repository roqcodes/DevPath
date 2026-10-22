"use client";

/**
 * STUB - Owner: Agent A (AI Companion). Replace implementations, keep these exports + prop shapes.
 * Companion is "Kip", a living graph node. Everyone else imports from "@/components/companion".
 */

import type { ReactNode } from "react";

export type CompanionMood =
  | "idle"
  | "thinking"
  | "excited"
  | "proud"
  | "concerned"
  | "sleepy"
  | "focused";

export interface CompanionContext {
  /** where the learner is, e.g. "dashboard", "lesson", "quiz", "path", "review", "interview" */
  surface: string;
  /** human-readable subject, e.g. lesson title or problem name */
  subject?: string;
  /** any extra text the AI should know (lesson body excerpt, wrong answer, etc.) */
  detail?: string;
}

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
  return (
    <span
      aria-hidden
      data-mood={mood}
      className={className}
      style={{ display: "inline-block", width: size, height: size, borderRadius: 12, background: "#4f46e5" }}
    />
  );
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
    <div className={className}>
      <CompanionAvatar mood={mood} size={28} />
      <div>{children}</div>
      {actions?.map((a) => (
        <button key={a.label} type="button" onClick={a.onClick}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

/** Contextual AI actions (Explain / ELI5 / Deeper / Example / Quiz me) that stream an answer inline. */
export function CompanionAssist({ context, className }: { context: CompanionContext; className?: string }) {
  return <div className={className} data-surface={context.surface} />;
}

/** Global ambient companion (mounted once in the app shell). Reacts to engine events. */
export function CompanionPresence() {
  return null;
}

/** Programmatically open the companion with a prompt in a given context. */
export function askCompanion(_prompt: string, _context?: CompanionContext): void {}
