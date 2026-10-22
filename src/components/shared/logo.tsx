import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "onDark";
}

export function Logo({ className, href = "/", size = "md", tone = "default" }: LogoProps) {
  const iconSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const titleSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)] ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105",
          iconSize
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-indigo-100"
        >
          {/* Subtle node graph/binary tree motif */}
          <path
            d="M12 4V9M12 9L7 14M12 9L17 14M7 14V19M17 14V19"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          <circle cx="12" cy="4" r="2" fill="#38bdf8" />
          <circle cx="7" cy="14" r="2" fill="#a5b4fc" />
          <circle cx="17" cy="14" r="2" fill="#a5b4fc" />
          <circle cx="7" cy="19" r="1.5" fill="#e0e7ff" />
          <circle cx="17" cy="19" r="1.5" fill="#e0e7ff" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "font-bold tracking-tight",
              titleSize,
              tone === "onDark" ? "text-white" : "text-slate-900"
            )}
          >
            SAIT{" "}
            <span className={tone === "onDark" ? "text-sky-300" : "text-indigo-600"}>DSA</span>
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              tone === "onDark"
                ? "bg-white/10 text-indigo-100 ring-1 ring-white/15"
                : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60"
            )}
          >
            CUSAT
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium tracking-wide mt-0.5",
            tone === "onDark" ? "text-indigo-200/70" : "text-slate-400"
          )}
        >
          Peer Learning Engine
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {content}
      </Link>
    );
  }
  return content;
}
