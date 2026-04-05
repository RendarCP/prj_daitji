import {
  InputHTMLAttributes,
  forwardRef,
  MouseEvent,
  ReactNode,
} from "react";
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
    const isDateInput = type === "date";

    const handleDateInputClick = (event: MouseEvent<HTMLInputElement>) => {
      props.onClick?.(event);

      if (type !== "date") {
        return;
      }

      const input = event.currentTarget as HTMLInputElement & {
        showPicker?: () => void;
      };

      input.showPicker?.();
    };

    return (
      <div className={cn("flex flex-col gap-2", fullWidth ? "w-full" : "")}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {/* {props.required && <span className="text-destructive ml-1">*</span>} */}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            onClick={handleDateInputClick}
            className={cn(
              "w-full min-w-0 max-w-full rounded-lg border border-border bg-white px-4 py-2.5 text-slate-900 transition-all duration-200",
              "placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-white",
              "disabled:bg-secondary/20 disabled:cursor-not-allowed disabled:text-muted-foreground",
              error
                ? "border-destructive focus:ring-destructive"
                : "hover:border-border hover:bg-white",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              isDateInput &&
                "appearance-none pr-4 text-[16px] tracking-tight [color-scheme:light] [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0 [&::-webkit-calendar-picker-indicator]:opacity-100",
              isDateInput && leftIcon && "pl-11 pr-3",
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
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-destructive flex items-center gap-1"
          >
            <span className="text-xs">⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
