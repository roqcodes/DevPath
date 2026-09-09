import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const variants = {
  default: "bg-accent text-accent-foreground hover:bg-blue-600 shadow-sm",
  secondary: "bg-muted text-foreground hover:bg-zinc-200",
  outline: "border border-border bg-transparent hover:bg-muted text-foreground",
  ghost: "hover:bg-muted text-foreground",
  destructive: "bg-destructive text-white hover:bg-red-600",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-9 px-4 text-sm rounded-md",
  lg: "h-11 px-6 text-sm rounded-lg",
  icon: "h-9 w-9 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", disabled, asChild, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
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
