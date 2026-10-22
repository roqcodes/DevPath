import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const variants = {
  default:
    "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_2px_10px_rgba(79,70,229,0.22)] active:scale-[0.98]",
  accent:
    "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_2px_12px_rgba(79,70,229,0.3)] hover:opacity-95 active:scale-[0.98]",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]",
  outline:
    "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-[0.98]",
  ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-[0.98]",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
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
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
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
