"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface FormPageLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** 본문 스크롤 비활성화 (모달과 동일) */
  disableBodyScroll?: boolean;
}

/**
 * 추가/편집 폼 페이지용 레이아웃.
 * FullPageModal과 동일한 헤더(제목 + X) + 본문 구조로, 페이지/모달 UX를 통일.
 */
export function FormPageLayout({
  title,
  children,
  className,
  disableBodyScroll = false,
}: FormPageLayoutProps) {
  const router = useRouter();

  const handleClose = () => router.back();

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card overflow-hidden",
        className,
      )}
    >
      {/* Header - 고정 (FullPageModal과 동일 스타일) */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm"
        aria-label="페이지 헤더"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          <h1
            id="form-page-title"
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h1>
        </div>
        <div className="w-9" aria-hidden="true" />
      </header>

      {/* Body - 헤더 아래부터 스크롤 영역 (pt-14 = 헤더 높이) */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-0 pt-14",
          disableBodyScroll ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {children}
      </div>
    </div>
  );
}
