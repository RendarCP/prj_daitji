import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ItemDetailModalClient } from "./ItemDetailModalClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailModalPage({ params }: Props) {
  const { id } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (itemError || !item) {
    notFound();
  }

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
    <ItemDetailModalClient
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
