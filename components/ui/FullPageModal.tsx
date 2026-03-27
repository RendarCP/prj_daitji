"use client";

import {
  ReactNode,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const CLOSE_DURATION_MS = 300;

export interface FullPageModalProps {
  isOpen?: boolean;
  closeSignal?: number;
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
  closeSignal = 0,
  onClose,
  title,
  children,
  showBackButton = false,
  onBack,
  closeOnEscape = true,
  disableBodyScroll = false,
}: FullPageModalProps) {
  const [isVisible, setIsVisible] = useState(false); // Controls rendering
  const [isAnimating, setIsAnimating] = useState(false); // true = 열림 상태, false = 닫힘 애니 중
  const [isClosing, setIsClosing] = useState(false); // 닫기 애니메이션 진행 중 (이때는 onClose 지연)
  const hasCloseIntentRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const lastCloseSignalRef = useRef(closeSignal);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 열림: 마운트 후 슬라이드 업
  useEffect(() => {
    if (isOpen && !isClosing && !hasCloseIntentRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      setIsClosing(false);
      requestAnimationFrame(() => setIsAnimating(true));
    }
  }, [isOpen, isClosing]);

  // 부모에서 isOpen이 false로 바뀐 경우(예: 브라우저 뒤로가기)에도 슬라이드 다운 후 숨김
  useEffect(() => {
    if (!isOpen) {
      hasCloseIntentRef.current = false;
    }

    if (!isOpen && isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(false);
      const t = setTimeout(() => setIsVisible(false), CLOSE_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen, isVisible]);

  // 닫기 클릭/이스케이프: 먼저 슬라이드 다운 재생 후 onClose 호출
  const startClose = useCallback(() => {
    if (isClosing || hasCloseIntentRef.current) return;
    hasCloseIntentRef.current = true;
    setIsClosing(true);
    setIsAnimating(false); // 슬라이드 다운 (translate-y-full)
  }, [isClosing]);

  useEffect(() => {
    if (closeSignal === lastCloseSignalRef.current) {
      return;
    }

    lastCloseSignalRef.current = closeSignal;
    startClose();
  }, [closeSignal, startClose]);

  // 닫기 애니메이션 종료 후 실제 onClose 호출
  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(() => {
      onCloseRef.current();
      setIsVisible(false);
      setIsClosing(false);
    }, CLOSE_DURATION_MS);
    return () => clearTimeout(t);
  }, [isClosing]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") startClose();
    },
    [closeOnEscape, startClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end overscroll-none pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "full-page-modal-title" : undefined}
    >
      {/* Overlay - 닫힐 때도 페이드 아웃 */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto touch-none",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={startClose}
        aria-hidden="true"
      />

      {/* Modal Content - 열림: 슬라이드 업 / 닫힘: 슬라이드 다운 */}
      <div
        className={cn(
          "relative bg-card w-full h-full pointer-events-auto",
          "flex flex-col overflow-hidden",
          "overscroll-contain touch-pan-y",
          "shadow-2xl transition-transform duration-300 ease-in-out transform",
          isAnimating ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Header - Matching SidePanel style */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={startClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            {showBackButton && (
              <button
                onClick={onBack ?? startClose}
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
          <div className="w-9" aria-hidden="true" />
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
