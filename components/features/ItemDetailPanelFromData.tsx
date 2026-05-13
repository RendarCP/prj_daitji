"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackageMinus } from "lucide-react";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { EntityDeleteActions } from "@/components/features/EntityDeleteActions";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";
import { ItemDetailPanel } from "@/components/ui/ItemDetailPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useOverlayHistorySync } from "@/lib/hooks/useOverlayHistorySync";
import { useDeleteItem } from "@/lib/hooks/useDeleteItem";
import { useToast } from "@/lib/providers/ToastProvider";
import { queryKeys } from "@/lib/queryKeys";
import type {
  DbItemForPanel,
  ItemLocationInfo,
  LocationPathItem,
} from "@/lib/types";

export const PANEL_EXIT_MS = 300;

function getExpiryFromMetadata(
  _type: string,
  metadata: Record<string, unknown> | null | undefined,
): { computed_expiry_date: string | null; days_until_expiry: number | null } {
  if (!metadata) return { computed_expiry_date: null, days_until_expiry: null };
  const expiry =
    (metadata.expiry_date as string) ||
    (metadata.opened_date && metadata.pao
      ? (() => {
          const opened = new Date(metadata.opened_date as string);
          const exp = new Date(opened);
          exp.setMonth(exp.getMonth() + Number(metadata.pao));
          return exp.toISOString();
        })()
      : null);
  if (!expiry) return { computed_expiry_date: null, days_until_expiry: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expiry);
  expDate.setHours(0, 0, 0, 0);
  const days = Math.ceil(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return { computed_expiry_date: expiry, days_until_expiry: days };
}

export interface ItemDetailPanelFromDataProps {
  item: DbItemForPanel;
  locationPath?: LocationPathItem[];
  location?: ItemLocationInfo | null;
  /** Called after close animation (e.g. router.back() or router.push('/explorer')) */
  onCloseRequested?: () => void;
  /** Stackflow 등 외부 네비게이션으로 수정 화면 열기 */
  onEditRequested?: (itemId: string) => void;
  mode?: "modal" | "page";
  enableOverlayHistorySync?: boolean;
}

export function ItemDetailPanelFromData({
  item,
  locationPath = [],
  location,
  onCloseRequested,
  onEditRequested,
  mode = "modal", // Default to modal (SidePanel) for backward compat
  enableOverlayHistorySync = true,
}: ItemDetailPanelFromDataProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [currentQuantity, setCurrentQuantity] = useState(item.quantity ?? 0);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [useQuantityInput, setUseQuantityInput] = useState("1");
  const [isUsing, setIsUsing] = useState(false);
  const [useError, setUseError] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    if (onCloseRequested) {
      closeTimerRef.current = setTimeout(() => {
        onCloseRequested();
      }, PANEL_EXIT_MS);
    }
  }, [onCloseRequested, setIsOpen]);

  const { requestClose } = useOverlayHistorySync({
    isOpen: mode === "modal" && isOpen,
    enabled: mode === "modal" && enableOverlayHistorySync,
    overlayKey: "item-detail",
    overlayId: item.id,
    onRequestClose: closePanel,
  });

  useEffect(() => {
    setCurrentQuantity(item.quantity ?? 0);
  }, [item.quantity]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (editNavTimerRef.current) clearTimeout(editNavTimerRef.current);
    };
  }, []);

  const locationPathStr =
    locationPath.length > 0
      ? locationPath.map((p) => p.name).join(" > ")
      : (location?.name ?? "");
  const { computed_expiry_date, days_until_expiry } = getExpiryFromMetadata(
    item.type,
    item.metadata ?? undefined,
  );

  const panelItem = {
    id: item.id,
    item_id: item.id,
    name: item.name,
    item_name: item.name,
    type: item.type,
    item_type: item.type,
    image_url: item.image_url ?? undefined,
    quantity: currentQuantity,
    location_path: locationPathStr || undefined,
    location_name: locationPathStr || undefined,
    tags: item.tags ?? undefined,
    created_at: item.created_at ?? undefined,
    computed_expiry_date: computed_expiry_date ?? undefined,
    days_until_expiry: days_until_expiry ?? undefined,
    metadata: item.metadata ?? undefined,
  };

  const handleEdit = useCallback(() => {
    if (onEditRequested) {
      onEditRequested(item.id);
      return;
    }
    if (mode === "modal") {
      setIsOpen(false);
      editNavTimerRef.current = setTimeout(() => {
        router.push(`/item/${item.id}/edit`);
      }, 0);
      return;
    }
    router.push(`/item/${item.id}/edit`);
  }, [item.id, mode, onEditRequested, router, setIsOpen]);

  const handleUseClick = useCallback(() => {
    setUseQuantityInput("1");
    setUseError(null);
    setIsUseModalOpen(true);
  }, []);

  const handleUseConfirm = useCallback(async () => {
    const parsedQuantity = Number.parseInt(useQuantityInput, 10);
    const availableQuantity = currentQuantity ?? 0;

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setUseError("사용 수량은 1개 이상이어야 합니다.");
      return;
    }

    if (parsedQuantity > availableQuantity) {
      setUseError(`현재 ${availableQuantity}개까지 사용할 수 있습니다.`);
      return;
    }

    const nextQuantity = availableQuantity - parsedQuantity;
    const nextStatus = nextQuantity === 0 ? "CONSUMED" : "ACTIVE";

    try {
      setIsUsing(true);
      setUseError(null);

      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: nextQuantity,
          status: nextStatus,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message ?? "물품 사용 처리에 실패했습니다.");
      }

      setCurrentQuantity(nextQuantity);
      setIsUseModalOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.items.detail(item.id),
        }),
      ]);

      if (nextQuantity === 0) {
        pushToast({
          tone: "success",
          title: "물품을 모두 사용했어요.",
          description: "목록에서 자동으로 숨겨집니다.",
        });

        if (mode === "page") {
          startTransition(() => {
            router.replace("/explorer");
            router.refresh();
          });
          return;
        }

        requestClose();
        return;
      }

      pushToast({
        tone: "success",
        title: "물품 사용 완료",
        description: `${parsedQuantity}개 사용했고 ${nextQuantity}개 남았습니다.`,
      });
    } catch (error) {
      setUseError(
        error instanceof Error ? error.message : "물품 사용 처리에 실패했습니다.",
      );
    } finally {
      setIsUsing(false);
    }
  }, [
    currentQuantity,
    item.id,
    mode,
    pushToast,
    queryClient,
    requestClose,
    router,
    useQuantityInput,
  ]);

  const deleteItemMutation = useDeleteItem(item.id, {
    onSuccess: async () => {
      if (mode === "page") {
        startTransition(() => {
          router.replace("/explorer");
          router.refresh();
        });
        return;
      }

      requestClose();
    },
  });

  const handleDelete = useCallback(async () => {
    try {
      deleteItemMutation.reset();
      await deleteItemMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteItemMutation]);

  const headerActions = (
    <EntityDeleteActions
      entityName={item.name}
      entityLabel="물품"
      isDeleting={deleteItemMutation.isPending}
      deleteError={
        deleteItemMutation.error instanceof Error
          ? deleteItemMutation.error.message
          : null
      }
      onDelete={handleDelete}
      onResetState={() => deleteItemMutation.reset()}
    />
  );

  const useModal = (
    <Modal
      isOpen={isUseModalOpen}
      onClose={() => {
        if (isUsing) return;
        setIsUseModalOpen(false);
        setUseError(null);
      }}
      title="물품 사용하기"
      description={`${item.name}에서 몇 개를 사용할지 입력해주세요.`}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setIsUseModalOpen(false);
              setUseError(null);
            }}
            disabled={isUsing}
          >
            취소
          </Button>
          <Button
            onClick={() => void handleUseConfirm()}
            isLoading={isUsing}
            leftIcon={<PackageMinus className="h-4 w-4" />}
          >
            사용하기
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-secondary/20 p-4 text-sm">
          현재 수량은{" "}
          <span className="font-semibold text-foreground">{currentQuantity}개</span>
          입니다.
        </div>
        <Input
          label="사용 수량"
          type="number"
          inputMode="numeric"
          min="1"
          max={String(Math.max(currentQuantity, 1))}
          value={useQuantityInput}
          onChange={(event) => {
            setUseQuantityInput(event.target.value);
            if (useError) {
              setUseError(null);
            }
          }}
          autoFocus
        />
        {useError && <p className="text-sm text-destructive">{useError}</p>}
      </div>
    </Modal>
  );

  if (mode === "page") {
    // Page Mode: Use FormPageLayout
    return (
      <FormPageLayout
        title={item.name}
        className="bg-background" // Ensure background is set
        leadingAction={
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        trailingAction={headerActions}
        showDefaultCloseButton={false}
      >
        <ItemDetailContent
          item={panelItem}
          onEdit={handleEdit}
          onUse={handleUseClick}
          isUsing={isUsing}
        />
        {useModal}
      </FormPageLayout>
    );
  }

  // Modal Mode: Use SidePanel (ItemDetailPanel wraps SidePanel)
  return (
    <>
      <ItemDetailPanel
        isOpen={isOpen}
        onClose={requestClose}
        item={panelItem}
        onEdit={handleEdit}
        onUse={handleUseClick}
        isUsing={isUsing}
        onFavorite={() => {}}
        headerActions={headerActions}
        showCloseButton={false}
      />
      {useModal}
    </>
  );
}
