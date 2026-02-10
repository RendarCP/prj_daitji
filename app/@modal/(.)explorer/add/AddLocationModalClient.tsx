"use client";

import { useRouter } from "next/navigation";
import { FullPageModal } from "@/components/ui/FullPageModal";
import { AddLocationClient } from "@/app/explorer/AddLocationClient";
import type { Location } from "@/lib/types";

interface AddLocationModalClientProps {
  locations: Location[];
}

export function AddLocationModalClient({
  locations,
}: AddLocationModalClientProps) {
  const router = useRouter();

  return (
    <FullPageModal
      onClose={() => router.back()}
      title="위치 추가"
      disableBodyScroll={true}
    >
      <AddLocationClient locations={locations} mode="modal" />
    </FullPageModal>
  );
}
