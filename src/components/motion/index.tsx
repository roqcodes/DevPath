"use client";

/**
 * STUB - Owner: Agent M (Motion). Replace implementations, keep these exports + prop shapes.
 * CSS lives in src/styles/motion.css (imported by globals.css).
 */

import type { ReactNode } from "react";

/** Staggered reveal on mount / when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  return (
    <Tag className={className} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Animated number count-up. */
export function CountUp({ value, className, duration = 800 }: { value: number; className?: string; duration?: number }) {
  void duration;
  return <span className={className}>{value}</span>;
}

/** Fire a celebration burst (confetti/particles). No-op under reduced motion. */
export function celebrate(_opts?: { kind?: "small" | "big"; origin?: { x: number; y: number } }): void {}

/** Listens to engine `pendingCelebration` and renders toasts/bursts. Mounted once in the app shell. */
export function CelebrationLayer() {
  return null;
}
