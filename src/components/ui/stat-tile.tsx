import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const accentMap = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  cyan: "bg-highlight-soft text-highlight-strong ring-cyan-100",
  flame: "bg-flame-soft text-flame ring-orange-100",
  xp: "bg-xp-soft text-xp-strong ring-lime-100",
  success: "bg-success-muted text-emerald-700 ring-emerald-100",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
};

export interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: keyof typeof accentMap;
  className?: string;
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-slate-500">{label}</p>
          <p className="num mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
              accentMap[accent]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
