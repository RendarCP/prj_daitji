import { AddLocationModalClient } from "./AddLocationModalClient";
import { getCurrentUserLocationsForSelection } from "@/lib/supabase/locations";

export default async function AddLocationModalPage() {
  const locations = await getCurrentUserLocationsForSelection();

  return <AddLocationModalClient locations={locations} />;
}
