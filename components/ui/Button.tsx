import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline:
        "border-2 border-border bg-background hover:bg-secondary hover:border-primary/20",
      ghost: "hover:bg-secondary hover:text-secondary-foreground",
      danger:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
      success:
        "bg-success text-success-foreground hover:bg-success/90 shadow-soft",
    };

    const sizes = {
      sm: "h-9 rounded-md px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText || "처리중..."}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
