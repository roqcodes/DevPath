"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, onCheckedChange, onChange, ...props }, ref) => {
    const inputId = id ?? (label ? `switch-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

    return (
      <label
        className={cn(
          "group inline-flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-60",
          className
        )}
        htmlFor={inputId}
      >
        <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            onChange={(e) => {
              onChange?.(e);
              onCheckedChange?.(e.target.checked);
            }}
            {...props}
          />
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-slate-200 transition-colors duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-checked:bg-brand-600 peer-disabled:bg-slate-100"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
              "peer-checked:translate-x-4"
            )}
            aria-hidden
          />
        </span>
        {(label || description) && (
          <span className="min-w-0">
            {label ? <span className="block text-sm font-medium text-slate-900">{label}</span> : null}
            {description ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
            ) : null}
          </span>
        )}
      </label>
    );
  }
);
Switch.displayName = "Switch";
