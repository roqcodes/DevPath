import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-primary-soft text-brand-700 border-brand-200/60",
  secondary: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-success-muted text-emerald-800 border-emerald-200/70",
  warning: "bg-warning-muted text-amber-900 border-amber-200/70",
  outline: "bg-white/80 text-slate-700 border-slate-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200/70",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70",
  rose: "bg-rose-50 text-rose-700 border-rose-200/70",
  xp: "bg-xp-soft text-xp-strong border-lime-200/70",
  highlight: "bg-highlight-soft text-cyan-800 border-cyan-200/70",
  flame: "bg-flame-soft text-flame-strong border-orange-200/70",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  dot?: boolean;
  size?: "sm" | "md";
}

const dotColors: Partial<Record<keyof typeof variants, string>> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  purple: "bg-purple-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
  xp: "bg-lime-500",
  highlight: "bg-cyan-500",
  flame: "bg-orange-500",
};

export function Badge({
  className,
  variant = "default",
  dot,
  size = "md",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight select-none",
        size === "sm" ? "px-2 py-0 text-[10px]" : "px-2.5 py-0.5 text-xs",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColors[variant] ?? "bg-brand-500"
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
