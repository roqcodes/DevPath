import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  className,
  indicatorClassName,
  size = "md",
  showLabel,
  label,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showLabel && <span className="font-semibold text-slate-800 tabular-nums">{clamped}%</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100 p-0.5",
          size === "xs" ? "h-1.5" : size === "sm" ? "h-2" : size === "lg" ? "h-3" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500 ease-out",
            indicatorClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
