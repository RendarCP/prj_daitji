import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import ExplorerV2Client from "@/app/explorer-v2/ExplorerV2Client";

export const metadata: Metadata = {
  title: "우리집 위치구조",
  description: "우리집 위치 구조를 정리하고 관리하세요",
};

function ExplorerV2Fallback() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center sm:min-h-[calc(100dvh-4rem)]">
      <Spinner size="lg" />
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<ExplorerV2Fallback />}>
      <ExplorerV2Client />
    </Suspense>
  );
}
