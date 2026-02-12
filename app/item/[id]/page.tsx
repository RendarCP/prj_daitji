import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ItemDetailPageClient } from "./ItemDetailPageClient";
import type { Database } from "@/lib/types/database.types";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
type ItemWithLocationRow = ItemRow & {
  location: Pick<LocationRow, "id" | "name" | "icon" | "parent_id"> | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  if (id === "add") {
    return {
      title: "물품 추가 - DAITJI",
      description: "새로운 물품을 등록하세요",
    };
  }

  try {
    const supabase = await createClient();
    const { data: item } = await supabase
      .from("items")
      .select("name")
      .eq("id", id)
      .single<{ name: string }>();

    return {
      title: item ? `${item.name} - 물품 상세` : "물품 상세",
      description: "물품의 상세 정보를 확인하고 수정할 수 있습니다",
    };
  } catch {
    return {
      title: "물품 상세",
      description: "물품의 상세 정보를 확인하고 수정할 수 있습니다",
    };
  }
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;

  // /items/add 가 [id]로 잡혀서 id='add'로 들어오는 경우 → 정적 라우트로 보냄
  if (id === "add") {
    redirect("/items/add");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select(
      `
        *,
        location:locations(id, name, icon, parent_id)
      `,
    )
    .eq("id", id)
    .single<ItemWithLocationRow>();

  if (itemError || !item) {
    notFound();
  }

  return (
    <ItemDetailPageClient
      item={{
        id: item.id,
        name: item.name,
        type: item.type,
        location_id: item.location_id,
        quantity: item.quantity,
        tags: item.tags,
        created_at: item.created_at,
        metadata: item.metadata as Record<string, unknown> | null,
      }}
      location={item.location}
      locationPath={[]}
    />
  );
}
