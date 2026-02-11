"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ItemDetailPanel } from "@/components/ui/ItemDetailPanel";

export const PANEL_EXIT_MS = 300;

export type LocationPathItem = { id: string; name: string; icon?: string | null };

export type DbItemForPanel = {
  id: string;
  name: string;
  type: string;
  location_id: string;
  quantity: number | null;
  tags: string[] | null;
  created_at: string | null;
  metadata?: Record<string, unknown> | null;
};

function getExpiryFromMetadata(
  _type: string,
  metadata: Record<string, unknown> | null | undefined
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
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return { computed_expiry_date: expiry, days_until_expiry: days };
}

export interface ItemDetailPanelFromDataProps {
  item: DbItemForPanel;
  locationPath: LocationPathItem[];
  /** Called after close animation (e.g. router.back() or router.push('/explorer')) */
  onCloseRequested?: () => void;
  mode?: "modal" | "page";
}

import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";

export function ItemDetailPanelFromData({
  item,
  locationPath,
  onCloseRequested,
  mode = "modal", // Default to modal (SidePanel) for backward compat
}: ItemDetailPanelFromDataProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    };
  }, []);

  const locationPathStr = locationPath.map((p) => p.name).join(" > ");
  const { computed_expiry_date, days_until_expiry } = getExpiryFromMetadata(
    item.type,
    item.metadata ?? undefined
  );

  const panelItem = {
    id: item.id,
    item_id: item.id,
    name: item.name,
    item_name: item.name,
    type: item.type,
    item_type: item.type,
    quantity: item.quantity ?? 0,
    location_path: locationPathStr || undefined,
    location_name: locationPathStr || undefined,
    tags: item.tags ?? undefined,
    created_at: item.created_at ?? undefined,
    computed_expiry_date: computed_expiry_date ?? undefined,
    days_until_expiry: days_until_expiry ?? undefined,
  };

  const handleEdit = () => router.push(`/item/${item.id}/edit`);

  if (mode === "page") {
    // Page Mode: Use FormPageLayout
    return (
      <FormPageLayout
        title={item.name}
        className="bg-background" // Ensure background is set
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
    />
  );
}
