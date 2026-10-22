import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { DsaGraphMotif } from "@/components/auth/dsa-graph-motif";
import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  editorial,
  headerAction,
  mobileEyebrow,
  showMotif = true,
  rightTop,
}: {
  children: ReactNode;
  editorial: ReactNode;
  headerAction?: ReactNode;
  mobileEyebrow?: string;
  showMotif?: boolean;
  rightTop?: ReactNode;
  /** @deprecated Spacing is auto-tightened; kept for API compatibility */
  compact?: boolean;
}) {
  const showMobileBanner = !rightTop;

  return (
    <div className="auth-viewport grid overflow-hidden lg:grid-cols-[minmax(280px,1.05fr)_minmax(300px,0.95fr)]">
      <aside className="relative hidden h-full overflow-hidden bg-[#0b1220] lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(79,70,229,0.45), transparent), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(14,165,233,0.18), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col px-7 py-5 xl:px-10 xl:py-6">
          <Logo tone="onDark" size="sm" />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-2">
            {editorial}
          </div>
          {showMotif && (
            <DsaGraphMotif className="pointer-events-none absolute bottom-10 left-3 w-[min(88%,360px)] opacity-35" />
          )}
          <p className="relative z-10 shrink-0 pt-2 text-[10px] font-medium tracking-wide text-indigo-200/50">
            School of Engineering · CUSAT
          </p>
        </div>
      </aside>

      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5f2]">
        <header className="flex h-10 shrink-0 items-center gap-3 px-3 sm:h-11 sm:px-5 lg:px-6">
          <div className="min-w-0 lg:hidden">
            <Logo size="sm" />
          </div>
          {showMobileBanner && (
            <p className="min-w-0 flex-1 truncate text-[11px] text-slate-500 lg:hidden">
              {mobileEyebrow}
            </p>
          )}
          <p className="hidden min-w-0 flex-1 truncate text-xs text-slate-500 lg:block">
            {mobileEyebrow}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-2">{headerAction}</div>
        </header>

        {rightTop && (
          <div className="shrink-0 border-b border-slate-200/60 bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-[24rem]">{rightTop}</div>
          </div>
        )}

        <main className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-3 sm:px-5 lg:px-6">
          <div className="auth-fit-tight mx-auto flex h-full max-h-full w-full max-w-[24rem] flex-col justify-center overflow-hidden py-1">
            {children}
          </div>
        </main>

        <div className="shrink-0 px-3 pb-2 text-center sm:px-5 lg:hidden">
          <Link href="/" className="text-[10px] text-slate-400 hover:text-slate-600">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthStatRow({ className }: { className?: string }) {
  return (
    <dl className={cn("mt-4 grid grid-cols-3 gap-2 xl:mt-5", className)}>
      {[
        ["12", "Modules"],
        ["89", "Lessons"],
        ["Judge0", "Live runs"],
      ].map(([value, label]) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2"
        >
          <dt className="text-[9px] font-medium uppercase tracking-wider text-indigo-300/70">
            {label}
          </dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-white xl:text-base">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
