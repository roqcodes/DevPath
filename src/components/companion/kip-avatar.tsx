"use client";

import { cn } from "@/lib/utils";
import type { CompanionMood } from "@/lib/companion/types";

const MOOD_CLASS: Record<CompanionMood, string> = {
  idle: "kip-mood-idle",
  thinking: "kip-mood-thinking",
  excited: "kip-mood-excited",
  proud: "kip-mood-proud",
  concerned: "kip-mood-concerned",
  sleepy: "kip-mood-sleepy",
  focused: "kip-mood-focused",
};

export function KipAvatar({
  mood = "idle",
  size = 40,
  className,
}: {
  mood?: CompanionMood;
  size?: number;
  className?: string;
}) {
  const s = size;
  const eyeY = mood === "sleepy" ? s * 0.42 : s * 0.38;
  const eyeOpen = mood === "sleepy" ? 0.04 : 0.07;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`Kip, mood ${mood}`}
      className={cn("kip-avatar shrink-0", MOOD_CLASS[mood], className)}
    >
      <defs>
        <linearGradient id="kip-node" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <filter id="kip-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="kip-antennae" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M14 10 C10 6, 6 8, 4 4" />
        <path d="M34 10 C38 6, 42 8, 44 4" />
        <circle cx="4" cy="4" r="2" fill="#a5b4fc" stroke="none" />
        <circle cx="44" cy="4" r="2" fill="#a5b4fc" stroke="none" />
      </g>
      <rect
        x="8"
        y="12"
        width="32"
        height="32"
        rx="12"
        fill="url(#kip-node)"
        filter={mood === "proud" || mood === "excited" ? "url(#kip-glow)" : undefined}
        className="kip-body"
      />
      <ellipse cx="18" cy={eyeY} rx="3" ry={s * eyeOpen} fill="#e0e7ff" className="kip-eye" />
      <ellipse cx="30" cy={eyeY} rx="3" ry={s * eyeOpen} fill="#e0e7ff" className="kip-eye" />
      {mood === "concerned" && (
        <path d="M20 34 Q24 31 28 34" stroke="#c7d2fe" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {(mood === "excited" || mood === "proud") && (
        <path d="M19 33 Q24 36 29 33" stroke="#c7d2fe" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
