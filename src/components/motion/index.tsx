"use client";

/**
 * DevPath motion primitives. CSS in src/styles/motion.css (via globals.css).
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { celebrate as fireConfetti, type CelebrateOptions } from "@/lib/motion/confetti";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { playSound } from "@/lib/motion/sound";
import type { Celebration } from "@/lib/engine/types";
import { updateEngine, useEngineSelector } from "@/lib/engine/store";

export { useReducedMotion, prefersReducedMotion } from "@/lib/motion/reduced-motion";
export { playSound, useSoundSetting, setSoundEnabled, isSoundEnabled, type SoundName } from "@/lib/motion/sound";
export type { CelebrateOptions };

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
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const style: CSSProperties | undefined =
    visible && !reduced && delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <Tag
      ref={ref as never}
      className={className}
      data-reveal={reduced ? undefined : visible ? "in" : "pending"}
      style={style}
    >
      {children}
    </Tag>
  );
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Animated number count-up. */
export function CountUp({
  value,
  className,
  duration = 800,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const animatedRef = useRef(reduced ? value : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (reduced) {
      animatedRef.current = value;
      setDisplay(value);
      return;
    }
    const from = animatedRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = Math.round(from + (to - from) * easeOutCubic(t));
      animatedRef.current = next;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else animatedRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, reduced]);

  return <span className={className}>{display}</span>;
}

/** Fire a celebration burst (confetti/particles). No-op under reduced motion. */
export function celebrate(opts?: CelebrateOptions): void {
  fireConfetti(opts);
}

function celebrationBurstKind(c: Celebration): "small" | "big" {
  switch (c.kind) {
    case "level_up":
    case "goal_met":
    case "achievement":
      return "big";
    default:
      return "small";
  }
}

function celebrationSound(c: Celebration): void {
  switch (c.kind) {
    case "level_up":
    case "goal_met":
      playSound("levelup");
      break;
    case "xp":
      playSound("pop");
      break;
    case "achievement":
    case "streak":
    case "quest":
      playSound("success");
      break;
    default:
      playSound("success");
  }
}

/** Listens to engine `pendingCelebration` and renders toasts/bursts. Mounted once in the app shell. */
export function CelebrationLayer() {
  const pending = useEngineSelector((s) => s.pendingCelebration);
  const reduced = useReducedMotion();
  const [toast, setToast] = useState<Celebration | null>(null);
  const consumedRef = useRef<string | null>(null);
  const dismissRef = useRef(0);

  useEffect(() => {
    if (!pending?.id || pending.id === consumedRef.current) return;
    consumedRef.current = pending.id;

    if (!reduced) celebrate({ kind: celebrationBurstKind(pending), origin: { x: 0.5, y: 0.28 } });
    celebrationSound(pending);

    setToast(pending);
    updateEngine((s) => ({ ...s, pendingCelebration: null }));

    window.clearTimeout(dismissRef.current);
    dismissRef.current = window.setTimeout(() => setToast(null), 3400);
  }, [pending, reduced]);

  useEffect(() => () => window.clearTimeout(dismissRef.current), []);

  if (!toast) return null;

  return (
    <div
      className="m-celebration pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[2147482000] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-sm rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-lg shadow-indigo-500/10">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{toast.detail}</p> : null}
        {toast.xp != null && toast.xp > 0 ? (
          <p className="m-xp-float mt-1 text-xs font-medium text-indigo-600">+{toast.xp} XP</p>
        ) : null}
      </div>
    </div>
  );
}
