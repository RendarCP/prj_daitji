"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { EntityDeleteActions } from "@/components/features/EntityDeleteActions";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";
import { ItemDetailPanel } from "@/components/ui/ItemDetailPanel";
import { useOverlayHistorySync } from "@/lib/hooks/useOverlayHistorySync";
import { useDeleteItem } from "@/lib/hooks/useDeleteItem";
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
  const [isOpen, setIsOpen] = useState(true);
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
    quantity: item.quantity ?? 0,
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
        <ItemDetailContent item={panelItem} onEdit={handleEdit} />
      </FormPageLayout>
    );
  }

  // Modal Mode: Use SidePanel (ItemDetailPanel wraps SidePanel)
  return (
    <ItemDetailPanel
      isOpen={isOpen}
      onClose={requestClose}
      item={panelItem}
      onEdit={handleEdit}
      onFavorite={() => {}}
      headerActions={headerActions}
      showCloseButton={false}
    />
  );
}
