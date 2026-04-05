import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import ExplorerV2Client from "./ExplorerV2Client";

export const metadata: Metadata = {
  title: "브라우즈 V2",
  description: "트리 구조에서 위치를 드래그 앤 드롭으로 정리하세요",
};

function ExplorerV2Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function ExplorerV2Page() {
  return (
    <Suspense fallback={<ExplorerV2Fallback />}>
      <ExplorerV2Client />
    </Suspense>
  );
}
