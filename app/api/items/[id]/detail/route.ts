import { NextRequest } from "next/server";
import { errorResponse, successResponse, handleError } from "@/lib/api/utils";
import type { Database } from "@/lib/types/database.types";
import { getAuthenticatedClient } from "@/lib/api/auth";
import {
  mapItemLocationInfo,
  mapItemRowToDetailItem,
} from "@/lib/server/item-data";
import { ITEM_DETAIL_SELECT } from "@/lib/server/item-query";
import { isUuid } from "@/lib/utils/validation";

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

    if (!isUuid(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const { data, error: itemError } = await supabase
      .from("items")
      .select(ITEM_DETAIL_SELECT)
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
      item: mapItemRowToDetailItem(item as any),
      location: mapItemLocationInfo(item.location),
      locationPath: [],
    });
  } catch (error) {
    return handleError(error);
  }
}
