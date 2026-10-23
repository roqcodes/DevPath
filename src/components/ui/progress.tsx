import { cn } from "@/lib/utils";

const indicatorVariants = {
  default: "from-brand-600 to-brand-500",
  success: "from-emerald-600 to-emerald-500",
  xp: "from-lime-600 to-lime-500",
  flame: "from-orange-500 to-amber-500",
};

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: keyof typeof indicatorVariants;
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  className,
  indicatorClassName,
  size = "md",
  variant = "default",
  showLabel,
  label,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showLabel && (
            <span className="num font-semibold text-slate-800">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-sunken p-0.5 ring-1 ring-slate-200/50",
          size === "xs" ? "h-1.5" : size === "sm" ? "h-2" : size === "lg" ? "h-3" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
            indicatorVariants[variant],
            indicatorClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
