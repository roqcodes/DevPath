import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Scrollable main column — use inside AppLayout for list/long-form pages. */
export function PageScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("page-scroll flex flex-col gap-5 pt-3 md:gap-6 md:pt-4", className)}>
      {children}
    </div>
  );
}

/** Fixed viewport column (review, arena, practice problem). */
export function PageFill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  backHref,
  backLabel = "Back",
  icon: Icon,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("shrink-0 border-b border-slate-200/80 pb-3", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel}
        </Link>
      )}
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{eyebrow}</p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
            {Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            )}
            <span className="min-w-0">{title}</span>
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl copy-body">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function SectionBlock({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 md:text-base">{title}</h2>
          {description && <p className="mt-1 copy-body text-xs md:text-sm">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
