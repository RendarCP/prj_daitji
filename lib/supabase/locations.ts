import type { Location } from "@/lib/types";
import type { Database } from "@/lib/types/database.types";
import { createClient } from "@/lib/supabase/server";

type LocationRow = Pick<
  Database["public"]["Tables"]["locations"]["Row"],
  | "id"
  | "name"
  | "level"
  | "parent_id"
  | "icon"
  | "color"
  | "description"
  | "sort_order"
>;

export async function getCurrentUserLocationsForSelection(): Promise<
  Location[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("locations")
    .select("id, name, level, parent_id, icon, color, description, sort_order")
    .eq("user_id", user.id)
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load current user locations for selection:", error);
    return [];
  }

  return ((data ?? []) as LocationRow[]).map((location) => ({
    id: location.id,
    name: location.name,
    level: location.level,
    parent_id: location.parent_id,
    icon: location.icon,
    color: location.color,
    description: location.description,
    sort_order: location.sort_order ?? 0,
  }));
}
