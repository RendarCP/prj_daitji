import { createClient } from "@/lib/supabase/server";
import { AddLocationModalClient } from "./AddLocationModalClient";

export default async function AddLocationModalPage() {
  const supabase = await createClient();

  // Fetch all locations for the hierarchical dropdown
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, level, parent_id, icon")
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true });

  return <AddLocationModalClient locations={locations || []} />;
}
