import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-md border border-slate-200/90 bg-surface-sunken px-1.5 font-mono text-[10px] font-semibold text-slate-600 shadow-xs",
        className
      )}
      {...props}
    />
  );
}

export function KbdGroup({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} {...props} />
  );
}
