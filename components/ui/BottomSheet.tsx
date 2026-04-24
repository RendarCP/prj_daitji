"use client";

import {
  type PointerEvent as ReactPointerEvent,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils/cn";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showDragHandle?: boolean;
  currentStep?: number;
  totalSteps?: number;
  maxHeight?: string;
}

const SHEET_ANIMATION_MS = 300;
const SWIPE_CLOSE_THRESHOLD = 96;
const SWIPE_CLOSE_VELOCITY = 0.45;
const DEFAULT_CLOSE_OFFSET = 1000;

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showDragHandle = true,
  currentStep,
  totalSteps,
  maxHeight = "max-h-[80vh]",
}: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(DEFAULT_CLOSE_OFFSET);
  const [isDragging, setIsDragging] = useState(false);
  const closeCallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dragStartYRef = useRef(0);
  const dragLastYRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const shouldRender = isOpen || isClosing;
  useBodyScrollLock(shouldRender);

  const getCloseOffset = useCallback(
    () =>
      typeof window === "undefined"
        ? DEFAULT_CLOSE_OFFSET
        : Math.max(window.innerHeight, DEFAULT_CLOSE_OFFSET),
    [],
  );

  const requestClose = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    setIsDragging(false);
    setDragOffset(getCloseOffset());

    if (closeCallbackTimerRef.current) {
      clearTimeout(closeCallbackTimerRef.current);
    }

    closeCallbackTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, SHEET_ANIMATION_MS);
  }, [getCloseOffset, isClosing, onClose]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        requestClose();
      }
    },
    [closeOnEscape, requestClose],
  );

  useEffect(() => {
    if (isOpen) {
      const animationFrameId = requestAnimationFrame(() => {
        setIsClosing(false);
        setIsDragging(false);
        setDragOffset(0);
      });

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [getCloseOffset, isOpen]);

  useEffect(() => {
    return () => {
      if (closeCallbackTimerRef.current) {
        clearTimeout(closeCallbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shouldRender) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [shouldRender, handleEscape]);

  const finishDrag = useCallback(() => {
    const distance = dragLastYRef.current - dragStartYRef.current;
    const elapsed = Math.max(Date.now() - dragStartTimeRef.current, 1);
    const velocity = distance / elapsed;
    const shouldClose =
      distance > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_CLOSE_VELOCITY;

    setIsDragging(false);

    if (shouldClose) {
      setDragOffset(distance > 0 ? distance : 0);
      requestClose();
      return;
    }

    setDragOffset(0);
  }, [requestClose]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
      dragLastYRef.current = event.clientY;
      setDragOffset(nextOffset);
    };

    const handlePointerUp = () => {
      finishDrag();
    };

    const handlePointerCancel = () => {
      setIsDragging(false);
      setDragOffset(0);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [finishDrag, isDragging]);

  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!showDragHandle || isClosing) {
        return;
      }

      dragStartYRef.current = event.clientY;
      dragLastYRef.current = event.clientY;
      dragStartTimeRef.current = Date.now();
      setIsDragging(true);
      setDragOffset(0);
    },
    [isClosing, showDragHandle],
  );

  if (!shouldRender) return null;

  const effectiveOffset = dragOffset;
  const overlayOpacity = Math.max(0, 1 - Math.min(effectiveOffset / 240, 1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "bottom-sheet-title" : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        )}
        style={{
          opacity: isOpen || isClosing ? overlayOpacity : 0,
        }}
        onClick={closeOnOverlayClick ? requestClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className={cn(
          "relative bg-card w-full rounded-t-3xl",
          "flex flex-col overflow-hidden",
          "shadow-2xl",
          isDragging ? "will-change-transform" : undefined,
          maxHeight,
        )}
        style={{
          transform: `translateY(${effectiveOffset}px)`,
          transition: isDragging
            ? "none"
            : `transform ${SHEET_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div
            className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handleDragStart}
          >
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-xl font-bold text-foreground"
              >
                {title}
              </h2>
            )}
            {currentStep !== undefined && totalSteps !== undefined && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        index < currentStep
                          ? "bg-primary"
                          : index === currentStep
                            ? "bg-primary/60"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={requestClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-4"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
