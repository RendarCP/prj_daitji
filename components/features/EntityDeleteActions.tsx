"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useDialog } from "@/lib/hooks/useDialog";
import { useToastError } from "@/lib/hooks/useToastError";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface EntityDeleteActionsProps {
  entityName: string;
  entityLabel: string;
  isDeleting: boolean;
  deleteError: string | null;
  onDelete: () => Promise<boolean>;
  onResetState?: () => void;
}

export function EntityDeleteActions({
  entityName,
  entityLabel,
  isDeleting,
  deleteError,
  onDelete,
  onResetState,
}: EntityDeleteActionsProps) {
  const menuDialog = useDialog();
  const confirmDialog = useDialog();
  const [isMounted, setIsMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useToastError(deleteError, {
    title: `${entityLabel} 삭제를 완료하지 못했습니다.`,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!menuDialog.isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(window.innerWidth - rect.right, 16),
      });
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      menuDialog.close();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        menuDialog.close();
      }
    };

    updateMenuPosition();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuDialog]);

  const handleDeleteClick = () => {
    menuDialog.close();
    confirmDialog.open();
  };

  const handleCloseConfirm = () => {
    onResetState?.();
    confirmDialog.close();
  };

  const handleDeleteConfirm = async () => {
    const wasDeleted = await onDelete();
    if (wasDeleted) {
      handleCloseConfirm();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={menuDialog.toggle}
        className="rounded-xl p-2 text-muted-foreground shadow-sm transition-all hover:bg-secondary/70 hover:text-foreground"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={menuDialog.isOpen}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isMounted &&
        menuDialog.isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[70] min-w-[160px] rounded-2xl border border-border/70 bg-card p-1.5 shadow-2xl"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleDeleteClick}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              삭제하기
            </button>
          </div>,
          document.body,
        )}

      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirm}
        title="정말 삭제하시겠습니까?"
        showCloseButton={false}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseConfirm}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              loadingText="삭제 중..."
            >
              삭제
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">{entityName}</span>{" "}
            {entityLabel}을(를) 삭제하면 복구할 수 없습니다.
          </p>
        </div>
      </Modal>
    </>
  );
}
