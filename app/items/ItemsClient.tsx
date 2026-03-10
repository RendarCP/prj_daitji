"use client";

import { Stack } from "./stackflow/itemsStack";

/**
 * /items 페이지용 클라이언트.
 * Stackflow 스택(목록 → 상세)을 렌더합니다.
 */
export function ItemsClient() {
  return (
    <div className="relative">
      <Stack />
    </div>
  );
}
