"use client";

import { ReactNode, useEffect, useCallback, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FullPageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showBackButton?: boolean;
  /** 뒤로가기 클릭 시 호출. 없으면 onClose 사용(기존 동작) */
  onBack?: () => void;
  closeOnEscape?: boolean;
  disableBodyScroll?: boolean;
}

export function FullPageModal({
  isOpen = true, // Default to true since it's likely used in an intercepted route
  onClose,
  title,
  children,
  showBackButton = true,
  onBack,
  closeOnEscape = true,
  disableBodyScroll = false,
}: FullPageModalProps) {
  const [isVisible, setIsVisible] = useState(false); // Controls rendering
  const [isAnimating, setIsAnimating] = useState(false); // Controls animation class

  // Handle visibility and animation based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure render happens before animation starts
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "full-page-modal-title" : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content - Slide Up Animation */}
      <div
        className={cn(
          "relative bg-card w-full h-full pointer-events-auto",
          "flex flex-col overflow-hidden",
          "shadow-2xl transition-transform duration-300 ease-in-out transform",
          isAnimating ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Header - Matching SidePanel style */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={onBack ?? onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {title && (
              <h2
                id="full-page-modal-title"
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex-1",
            disableBodyScroll ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
