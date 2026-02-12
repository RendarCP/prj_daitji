import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, handleError } from "@/lib/api/utils";
import type { Database } from "@/lib/types/database.types";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
type ItemWithLocationRow = ItemRow & {
  location: Pick<LocationRow, "id" | "name" | "icon" | "parent_id"> | null;
};
type LocationPathSegment = Pick<
  LocationRow,
  "id" | "name" | "icon" | "parent_id"
>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LOCATION_PATH_DEPTH = 20;

/**
 * GET /api/items/[id]/detail
 * 단일 물품 + location 경로 배열 반환 (Stackflow 등 클라이언트 상세 화면용)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const supabase = await createClient();

    const { data, error: itemError } = await supabase
      .from("items")
      .select(
        `
          *,
          location:locations(id, name, icon, parent_id)
        `,
      )
      .eq("id", id)
      .single<ItemWithLocationRow>();

    const item = data;

    if (itemError || !item) {
      if (itemError?.code === "PGRST116") {
        return errorResponse("ITEM_NOT_FOUND", undefined, 404);
      }
      return errorResponse("QUERY_ERROR", { message: itemError?.message }, 500);
    }

    let locationPath: Array<{ id: string; name: string; icon?: string | null }> =
      [];

    if (item.location) {
      const path: Array<{ id: string; name: string; icon?: string | null }> = [
        {
          id: item.location.id,
          name: item.location.name,
          icon: item.location.icon,
        },
      ];
      const visited = new Set<string>([item.location.id]);
      let currentId: string | null = item.location.parent_id;
      let depth = 0;

      while (currentId && depth < MAX_LOCATION_PATH_DEPTH) {
        if (visited.has(currentId)) break;
        const res: { data: LocationPathSegment | null } = await supabase
          .from("locations")
          .select("id, name, icon, parent_id")
          .eq("id", currentId)
          .single();

        const loc = res.data;

        if (!loc) break;

        visited.add(loc.id);
        path.unshift({ id: loc.id, name: loc.name, icon: loc.icon });
        currentId = loc.parent_id;
        depth += 1;
      }

      locationPath = path;
    }

    return successResponse({
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        location_id: item.location_id,
        quantity: item.quantity,
        tags: item.tags,
        created_at: item.created_at,
        metadata: item.metadata as Record<string, unknown> | null,
      },
      locationPath,
    });
  } catch (error) {
    return handleError(error);
  }
}
