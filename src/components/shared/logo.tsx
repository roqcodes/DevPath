import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md";
}

export function Logo({ className, href = "/", size = "md" }: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-accent font-mono font-bold text-accent-foreground",
          size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm"
        )}
      >
        DP
      </div>
      <span className={cn("font-semibold tracking-tight", size === "sm" ? "text-sm" : "text-base")}>
        DevPath AI
      </span>
    </div>
  );

  if (href) {
    return <Link href={href} className="hover:opacity-90 transition-opacity">{content}</Link>;
  }
  return content;
}
