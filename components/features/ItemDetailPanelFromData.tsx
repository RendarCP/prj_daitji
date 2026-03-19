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
import { useQueryClient } from "@tanstack/react-query";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { EntityDeleteActions } from "@/components/features/EntityDeleteActions";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";
import { ItemDetailPanel } from "@/components/ui/ItemDetailPanel";

export const PANEL_EXIT_MS = 300;

export type LocationPathItem = {
  id: string;
  name: string;
  icon?: string | null;
};
export type ItemLocationInfo = {
  id: string;
  name: string | null;
  icon?: string | null;
  parent_id?: string | null;
};

export type DbItemForPanel = {
  id: string;
  name: string;
  type: string;
  image_url?: string | null;
  location_id: string;
  quantity: number | null;
  tags: string[] | null;
  created_at: string | null;
  metadata?: Record<string, unknown> | null;
};

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
}

export function ItemDetailPanelFromData({
  item,
  locationPath = [],
  location,
  onCloseRequested,
  onEditRequested,
  mode = "modal", // Default to modal (SidePanel) for backward compat
}: ItemDetailPanelFromDataProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onCloseRequested) {
      closeTimerRef.current = setTimeout(() => {
        onCloseRequested();
      }, PANEL_EXIT_MS);
    }
  }, [onCloseRequested]);

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
  }, [mode, item.id, onEditRequested, router]);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error?.message ?? "물품 삭제 중 오류가 발생했습니다",
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["items"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["locations"] }),
      ]);
      queryClient.removeQueries({ queryKey: ["item", "detail", item.id] });

      if (mode === "page") {
        startTransition(() => {
          router.replace("/explorer");
          router.refresh();
        });
        return true;
      }

      handleClose();
      return true;
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "물품 삭제 중 오류가 발생했습니다",
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [handleClose, item.id, mode, queryClient, router]);

  const headerActions = (
    <EntityDeleteActions
      entityName={item.name}
      entityLabel="물품"
      isDeleting={isDeleting}
      deleteError={deleteError}
      onDelete={handleDelete}
      onResetState={() => setDeleteError(null)}
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
      onClose={handleClose}
      item={panelItem}
      onEdit={handleEdit}
      onFavorite={() => {}}
      headerActions={headerActions}
      showCloseButton={false}
    />
  );
}
