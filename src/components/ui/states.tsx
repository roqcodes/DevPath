import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";

export { EmptyState } from "./empty-state";
export { Skeleton } from "./skeleton";

interface StateProps {
  title: string;
  description?: string;
  className?: string;
  action?: { label: string; onClick: () => void };
}

export function LoadingState({ title, description, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function ErrorState({ title, description, className, action }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button variant="outline" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

export function SuccessState({ title, description, className, action }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center animate-fade-in", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-6 w-6 text-success" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
