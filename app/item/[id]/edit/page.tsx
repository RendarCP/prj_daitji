import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";
import { FormPageLayout } from "@/components/layout/FormPageLayout";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: item } = await supabase
      .from("items")
      .select("name")
      .eq("id", id)
      .single();

    return {
      title: item ? `${item.name} - 물품 수정` : "물품 수정 - DAITJI",
      description: "물품 정보를 수정합니다",
    };
  } catch {
    return {
      title: "물품 수정 - DAITJI",
      description: "물품 정보를 수정합니다",
    };
  }
}

export default async function ItemEditPage({ params }: Props) {
  const { id } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("items")
    .select("id")
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

  return (
    <FormPageLayout title="물품 수정">
      <ItemAddClient mode="page" isEditMode itemId={id} />
    </FormPageLayout>
  );
}
