import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  /** Renders a circle skeleton (avatars, icons). */
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", circle ? "rounded-full" : "rounded-lg", className)}
      aria-hidden
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-4/5" : "w-full")}
        />
      ))}
    </div>
  );
}
