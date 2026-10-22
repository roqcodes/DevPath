"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, children }: DialogProps) {
  if (!open) return null;
  return <>{children}</>;
}

export const DialogContent = forwardRef<
  HTMLDialogElement,
  HTMLAttributes<HTMLDialogElement> & {
    onOpenChange?: (open: boolean) => void;
    showClose?: boolean;
  }
>(({ className, children, onOpenChange, showClose = true, ...props }, ref) => {
  const innerRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || el.open) return;
    el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);

  const requestClose = () => {
    innerRef.current?.close();
    onOpenChange?.(false);
  };

  return (
    <dialog
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "ds-dialog fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200/80 bg-card p-0 text-card-foreground shadow-lg backdrop:bg-slate-950/45",
        className
      )}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      {...props}
    >
      <div className="relative p-6">
        {showClose ? (
          <button
            type="button"
            onClick={requestClose}
            className="focus-ring absolute right-4 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        {children}
      </div>
    </dialog>
  );
});
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5 pr-8", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-base font-semibold tracking-tight text-slate-900", className)} {...props} />
  );
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}
