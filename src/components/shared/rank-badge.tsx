import { Award, Medal, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PODIUM: Record<
  number,
  { icon: LucideIcon; className: string; iconClass: string }
> = {
  1: {
    icon: Trophy,
    className: "bg-amber-400/20 text-amber-800 ring-amber-400/40",
    iconClass: "text-amber-600",
  },
  2: {
    icon: Medal,
    className: "bg-slate-200/80 text-slate-800 ring-slate-300",
    iconClass: "text-slate-600",
  },
  3: {
    icon: Award,
    className: "bg-orange-200/60 text-orange-900 ring-orange-400/50",
    iconClass: "text-orange-700",
  },
};

type RankBadgeProps = {
  rank: number;
  size?: "sm" | "md";
  showNumber?: boolean;
};

export function RankBadge({ rank, size = "md", showNumber = true }: RankBadgeProps) {
  const box =
    size === "sm"
      ? "h-6 min-w-6 px-1 gap-0.5"
      : "h-7 min-w-7 px-1 gap-0.5";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  const podium = PODIUM[rank];
  if (podium) {
    const Icon = podium.icon;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-bold ring-1",
          box,
          podium.className
        )}
        title={`Rank ${rank}`}
      >
        <Icon className={cn(iconSize, podium.iconClass)} aria-hidden />
        {showNumber && <span className={cn("tabular-nums", textSize)}>{rank}</span>}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-slate-100 font-mono font-semibold text-slate-600",
        box,
        textSize
      )}
    >
      #{rank}
    </span>
  );
}
