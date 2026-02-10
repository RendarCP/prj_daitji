import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ItemAddClient } from "./ItemAddClient";
import { FormPageLayout } from "@/components/layout/FormPageLayout";

export const metadata: Metadata = {
  title: "물품 추가 - DAITJI",
  description: "새로운 물품을 등록하세요",
};

export default async function ItemAddPage() {
  await createClient();

  return (
    <FormPageLayout title="물품 추가">
      <ItemAddClient mode="page" />
    </FormPageLayout>
  );
}
