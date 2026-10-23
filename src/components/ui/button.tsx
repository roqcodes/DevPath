import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent" | "ink";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const variants = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary-strong shadow-glow active:scale-[0.98]",
  accent:
    "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:opacity-95 active:scale-[0.98]",
  secondary: "bg-surface-sunken text-slate-800 hover:bg-slate-200/80 active:scale-[0.98]",
  outline:
    "border border-slate-200/90 bg-surface-raised hover:bg-slate-50 text-slate-800 shadow-xs active:scale-[0.98]",
  ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-[0.98]",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm active:scale-[0.98]",
  ink:
    "bg-white/10 text-ink-foreground border border-white/15 backdrop-blur-md hover:bg-white/15 active:scale-[0.98]",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-6 text-sm rounded-xl gap-2 font-medium",
  icon: "h-9 w-9 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", disabled, asChild, children, ...props }, ref) => {
    const classes = cn(
      "press inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button ref={ref} disabled={disabled} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
