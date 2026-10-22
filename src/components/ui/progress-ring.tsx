import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  children?: ReactNode;
  label?: string;
  /** When true, animates stroke on mount/update. */
  animated?: boolean;
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className,
  trackClassName = "text-slate-200",
  barClassName = "text-brand-600",
  children,
  label,
  animated = true,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progress ${Math.round(pct)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            barClassName,
            animated && "transition-[stroke-dashoffset] duration-700 ease-[var(--ease-out-expo)]"
          )}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      ) : (
        <span className="absolute num text-xs font-semibold text-slate-700">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
