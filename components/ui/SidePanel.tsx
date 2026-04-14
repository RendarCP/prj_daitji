"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X, ArrowLeft, Heart, Edit } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showBackButton?: boolean;
  showFavoriteButton?: boolean;
  showEditButton?: boolean;
  showCloseButton?: boolean;
  /** 뒤로가기 클릭 시 호출. 없으면 onClose 사용(기존 동작) */
  onBack?: () => void;
  onFavorite?: () => void;
  onEdit?: () => void;
  headerActions?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  disableBodyScroll?: boolean;
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  showBackButton = true,
  showFavoriteButton = false,
  showEditButton = false,
  showCloseButton = true,
  onBack,
  onFavorite,
  onEdit,
  headerActions,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  disableBodyScroll = false,
}: SidePanelProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end overscroll-none pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "side-panel-title" : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto touch-none",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel Content */}
      <div
        className={cn(
          "relative bg-card w-full md:w-[400px] md:max-w-[90vw]",
          "flex flex-col h-full overflow-hidden overscroll-contain pointer-events-auto touch-pan-y",
          "shadow-2xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
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
                id="side-panel-title"
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showFavoriteButton && onFavorite && (
              <button
                onClick={onFavorite}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="즐겨찾기"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="수정"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {headerActions}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
