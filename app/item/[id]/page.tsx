import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ItemDetailPageClient } from "./ItemDetailPageClient";
import { getServerSideProps } from "next/dist/build/templates/pages";

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
      .single();

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

  console.log("id @@@@@@@@@@@@@@@@@@@@@@@@@@", id);

  // /items/add 가 [id]로 잡혀서 id='add'로 들어오는 경우 → 정적 라우트로 보냄
  if (id === "add") {
    redirect("/items/add");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  console.log("uuidRegex ##########################", uuidRegex.test(id));
  // if (!uuidRegex.test(id)) {
  //   notFound();
  // }

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  // if (itemError || !item) {
  //   notFound();
  // }

  const { data: pathData } = await supabase
    .from("locations")
    .select("id, name, icon, parent_id")
    .eq("id", item.location_id)
    .single();

  let locationPath: Array<{ id: string; name: string; icon?: string | null }> =
    [];

  if (pathData) {
    let currentId: string | null = pathData.id;
    const path: Array<{ id: string; name: string; icon?: string | null }> = [];

    while (currentId) {
      const { data: loc } = await supabase
        .from("locations")
        .select("id, name, icon, parent_id")
        .eq("id", currentId)
        .single();

      if (!loc) break;

      path.unshift({ id: loc.id, name: loc.name, icon: loc.icon });
      currentId = loc.parent_id;
    }

    locationPath = path;
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
      locationPath={locationPath}
    />
  );
}
