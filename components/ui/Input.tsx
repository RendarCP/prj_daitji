import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      type = "text",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("flex flex-col gap-2", fullWidth ? "w-full" : "")}>
        {label && (
          <label className="text-sm font-medium text-secondary-700">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 border rounded-lg transition-all duration-200 text-black",
              "placeholder:text-black/40",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:bg-secondary-100 disabled:cursor-not-allowed disabled:text-secondary-500",
              error
                ? "border-danger-500 focus:ring-danger-500"
                : "border-secondary-300 hover:border-secondary-400",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${props.id}-error`
                : helperText
                  ? `${props.id}-helper`
                  : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-danger-500 flex items-center gap-1"
          >
            <span className="text-xs">⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
