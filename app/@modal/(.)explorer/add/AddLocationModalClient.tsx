"use client";

import { useState } from "react";
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
  const [closeSignal, setCloseSignal] = useState(0);

  return (
    <FullPageModal
      closeSignal={closeSignal}
      onClose={() => router.back()}
      title="위치 추가"
      disableBodyScroll={true}
    >
      <AddLocationClient
        locations={locations}
        mode="modal"
        onSuccess={async () => {
          setCloseSignal((current) => current + 1);
        }}
      />
    </FullPageModal>
  );
}
