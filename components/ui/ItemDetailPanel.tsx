"use client";

import { ReactNode } from "react";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";
import { SidePanel } from "./SidePanel";

interface ItemDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string | null;
    item_id?: string | null;
    name?: string | null;
    item_name?: string | null;
    type?: string | null;
    item_type?: string | null;
    image_url?: string | null;
    quantity?: number | null;
    location_path?: string | null;
    location_name?: string | null;
    tags?: string[] | null;
    computed_expiry_date?: string | null;
    expiry_date?: string | null;
    created_at?: string | null;
    days_until_expiry?: number | null;
    metadata?: any;
  } | null;
  onEdit?: () => void;
  onFavorite?: () => void;
  headerActions?: ReactNode;
  showCloseButton?: boolean;
}

export function ItemDetailPanel({
  isOpen,
  onClose,
  item,
  onEdit,
  onFavorite,
  headerActions,
  showCloseButton = true,
}: ItemDetailPanelProps) {
  if (!item) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="" // Title hidden in header, shown in content
      showBackButton
      // showFavoriteButton={!!onFavorite}
      showFavoriteButton={false}
      showEditButton={false} // Hide header edit button, moved to bottom
      onFavorite={onFavorite}
      onEdit={onEdit}
      headerActions={headerActions}
      showCloseButton={showCloseButton}
      disableBodyScroll={true}
    >
      <ItemDetailContent item={item} onEdit={onEdit} />
    </SidePanel>
  );
}
