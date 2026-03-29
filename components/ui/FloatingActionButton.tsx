"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label = "추가",
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-[90px] right-6 md:bottom-8 md:right-8",
        "size-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-glow hover:shadow-glow-strong",
        "flex items-center justify-center",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "z-40",
        className,
      )}
      aria-label={label}
    >
      {icon || <Plus className="w-6 h-6" />}
    </button>
  );
}
