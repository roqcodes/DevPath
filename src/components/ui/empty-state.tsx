import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  className,
  icon: Icon = Inbox,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center animate-fade-in",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-brand-600 ring-1 ring-brand-100">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-semibold tracking-tight text-slate-900">{title}</p>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      ) : null}
      {children}
    </div>
  );
}
