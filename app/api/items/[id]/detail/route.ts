import { NextRequest } from "next/server";
import { errorResponse, successResponse, handleError } from "@/lib/api/utils";
import type { Database } from "@/lib/types/database.types";
import { getAuthenticatedClient } from "@/lib/api/auth";

export const preferredRegion = "icn1";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type ItemWithLocationRow = ItemRow & {
  location: {
    id: string;
    name: string | null;
    icon: string | null;
    parent_id: string | null;
  } | null;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/items/[id]/detail
 * 단일 물품 + 위치 정보 반환
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const { data, error: itemError } = await supabase
      .from("items")
      .select(
        `
          id,
          name,
          type,
          image_url,
          location_id,
          quantity,
          tags,
          created_at,
          metadata,
          location:locations(id, name, icon, parent_id)
        `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single<ItemWithLocationRow>();

    const item = data;

    if (itemError || !item) {
      if (itemError?.code === "PGRST116") {
        return errorResponse("ITEM_NOT_FOUND", undefined, 404);
      }
      return errorResponse("QUERY_ERROR", { message: itemError?.message }, 500);
    }

    return successResponse({
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        image_url: item.image_url,
        location_id: item.location_id,
        quantity: item.quantity,
        tags: item.tags,
        created_at: item.created_at,
        metadata: item.metadata as Record<string, unknown> | null,
      },
      location: item.location,
      locationPath: [],
    });
  } catch (error) {
    return handleError(error);
  }
}
