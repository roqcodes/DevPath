import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function OnboardingShell({
  children,
  sidebar,
  step,
  totalSteps,
  className,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  step: number;
  totalSteps: number;
  className?: string;
}) {
  const pct = Math.round((step / totalSteps) * 100);

  return (
    <div className={cn("min-h-svh bg-muted/50", className)}>
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-6 flex shrink-0 items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3 text-right">
            <p className="text-xs font-medium text-muted-foreground">
              Step <span className="tabular-nums text-foreground">{step}</span> of{" "}
              <span className="tabular-nums text-foreground">{totalSteps}</span>
            </p>
            <div
              className="hidden h-2 w-24 overflow-hidden rounded-full bg-border sm:block"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Onboarding progress"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <aside className="hidden w-full max-w-sm shrink-0 lg:block lg:sticky lg:top-6">
            {sidebar}
          </aside>

          <main className="min-w-0 flex-1">
            <div
              className="rounded-2xl border border-border bg-card shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl"
            >
              <div className="p-6 sm:p-8 lg:p-9">{children}</div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
                Back to home
              </Link>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
