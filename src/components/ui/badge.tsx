import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  secondary: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  warning: "bg-amber-50 text-amber-800 border-amber-200/70",
  outline: "bg-white/80 text-slate-700 border-slate-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200/70",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70",
  rose: "bg-rose-50 text-rose-700 border-rose-200/70",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  dot?: boolean;
}

export function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success"
              ? "bg-emerald-500"
              : variant === "warning"
                ? "bg-amber-500"
                : variant === "purple"
                  ? "bg-purple-500"
                  : variant === "sky"
                    ? "bg-sky-500"
                    : "bg-indigo-500"
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
