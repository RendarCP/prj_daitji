"use client";

import { useRouter } from "next/navigation";
import { FullPageModal } from "@/components/ui/FullPageModal";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";

export function ItemAddModalClient() {
  const router = useRouter();

  return (
    <FullPageModal
      onClose={() => router.back()}
      title="물품 추가"
      disableBodyScroll={true}
    >
      <ItemAddClient mode="modal" />
    </FullPageModal>
  );
}
