"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Edit,
  MapPin,
  Plus,
  Calendar,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { ItemDetailContent } from "@/components/features/ItemDetailContent";
import { SidePanel } from "./SidePanel";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

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
}

const getEmojiByType = (type: string) => {
  switch (type) {
    case "FOOD":
      return "🍽️";
    case "COSMETIC":
      return "💄";
    case "MEDICINE":
      return "💊";
    case "GENERAL":
      return "🔋";
    default:
      return "📦";
  }
};

const getExpiryStatus = (
  daysUntilExpiry: number | null | undefined,
): "expired" | "expiring" | "fresh" => {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) return "fresh";
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 7) return "expiring";
  return "fresh";
};

export function ItemDetailPanel({
  isOpen,
  onClose,
  item,
  onEdit,
  onFavorite,
}: ItemDetailPanelProps) {
  // Persist item data for exit animation
  const [displayItem, setDisplayItem] = useState(item);

  useEffect(() => {
    if (item) setDisplayItem(item);
  }, [item]);

  const [newTag, setNewTag] = useState("");

  if (!displayItem) return null;

  const itemName = displayItem.item_name || displayItem.name || "이름 없음";
  const itemType = displayItem.item_type || displayItem.type || "GENERAL";
  const emoji = getEmojiByType(itemType);
  const locationPath =
    displayItem.location_path || displayItem.location_name || "위치 미지정";
  const tags = displayItem.tags || [];
  const expiryDate =
    displayItem.computed_expiry_date || displayItem.expiry_date;
  const createdAt = displayItem.created_at;
  const daysUntilExpiry = displayItem.days_until_expiry;
  const expiryStatus = getExpiryStatus(daysUntilExpiry);

  const handleAddTag = () => {
    if (newTag.trim()) {
      // TODO: Implement tag addition API call
      setNewTag("");
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="" // Title hidden in header, shown in content
      showBackButton
      showFavoriteButton={!!onFavorite}
      showEditButton={false} // Hide header edit button, moved to bottom
      onFavorite={onFavorite}
      onEdit={onEdit}
      disableBodyScroll={true}
    >
      <ItemDetailContent item={displayItem} onEdit={onEdit} />
    </SidePanel>
  );
}
