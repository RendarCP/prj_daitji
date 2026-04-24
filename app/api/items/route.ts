import { NextRequest } from "next/server";
import {
  ItemFormDataSchema,
  ItemsQuerySchema,
  ItemsQueryInput,
} from "@/lib/validations/schemas";
import {
  successResponse,
  errorResponse,
  handleError,
  parseQueryParams,
  applyFilters,
  applySorting,
  applyPagination,
  getPaginationMeta,
  CORS_HEADERS,
} from "@/lib/api/utils";
import { getAuthenticatedClient } from "@/lib/api/auth";
import { mapItemRowToListResponse } from "@/lib/server/item-data";
import { ITEM_LIST_SELECT, ITEM_WITH_LOCATION_SELECT } from "@/lib/server/item-query";

export const preferredRegion = "icn1";

async function getUserLocationSubtreeIds(
  supabase: any,
  userId: string,
  rootLocationId: string,
): Promise<string[]> {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id, parent_id")
    .eq("user_id", userId);

  if (error || !Array.isArray(locations)) {
    return [];
  }

  const byParent = new Map<string, string[]>();
  let rootExists = false;

  for (const location of locations) {
    if (location.id === rootLocationId) {
      rootExists = true;
    }

    if (!location.parent_id) {
      continue;
    }

    const children = byParent.get(location.parent_id) ?? [];
    children.push(location.id);
    byParent.set(location.parent_id, children);
  }

  if (!rootExists) {
    return [];
  }

  const result: string[] = [];
  const queue: string[] = [rootLocationId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    result.push(currentId);

    const children = byParent.get(currentId) ?? [];
    for (const childId of children) {
      queue.push(childId);
    }
  }

  return result;
}

/**
 * GET /api/items
 * Fetch items with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = parseQueryParams(searchParams);

    // Validate query parameters
    const params = ItemsQuerySchema.parse(rawParams);

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const resolvedParams: ItemsQueryInput & { location_ids?: string[] } = {
      ...params,
    };

    if (params.location_id) {
      const subtreeIds = await getUserLocationSubtreeIds(
        supabase,
        user.id,
        params.location_id,
      );

      if (subtreeIds.length === 0) {
        const meta = getPaginationMeta(0, params.page, params.per_page);
        return successResponse([], meta);
      }

      resolvedParams.location_ids = subtreeIds;
      delete resolvedParams.location_id;
    }

    let query = supabase
      .from("items")
      .select(ITEM_LIST_SELECT, { count: "exact" })
      .eq("user_id", user.id);

    // Active items are the default list experience unless a status filter is requested.
    if (!resolvedParams.status) {
      query = query.eq("status", "ACTIVE");
    }

    // Apply filters
    query = applyFilters(query, resolvedParams);

    // Allow view field aliases for backwards compatibility
    const sortBy = params.sort_by === "item_name" ? "name" : params.sort_by;

    // Apply sorting
    query = applySorting(query, sortBy, params.sort_dir);

    // expiring_within_days는 앱 로직으로 계산하기 위해 전체 후보를 가져온 뒤 필터링
    if (params.expiring_within_days === undefined) {
      query = applyPagination(query, params.page, params.per_page);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return errorResponse("QUERY_ERROR", { message: error.message }, 500);
    }

    let mappedData = Array.isArray(data)
      ? data.map((row) => mapItemRowToListResponse(row as any))
      : [];

    let totalCount = count || 0;

    if (params.expiring_within_days !== undefined) {
      mappedData = mappedData.filter((item) => {
        const days = item.days_until_expiry ?? null;
        return days !== null && days >= 0 && days <= params.expiring_within_days!;
      });

      totalCount = mappedData.length;

      const from = (params.page - 1) * params.per_page;
      const to = from + params.per_page;
      mappedData = mappedData.slice(from, to);
    }

    // Calculate pagination metadata
    const meta = getPaginationMeta(totalCount, params.page, params.per_page);

    return successResponse(mappedData, meta);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/items
 * Create a new item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = ItemFormDataSchema.parse(body);

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    // Verify location exists and belongs to authenticated user
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("id", validatedData.location_id)
      .eq("user_id", user.id)
      .single();

    if (locationError || !location) {
      return errorResponse("LOCATION_NOT_FOUND", undefined, 404);
    }

    // Insert item
    const { data, error } = await supabase
      .from("items")
      .insert({
        name: validatedData.name,
        type: validatedData.type,
        status: validatedData.status,
        location_id: validatedData.location_id,
        quantity: validatedData.quantity,
        barcode: validatedData.barcode || null,
        image_url: validatedData.image_url || null,
        tags: validatedData.tags,
        metadata: validatedData.metadata,
        user_id: user.id,
      } as any)
      .select(ITEM_WITH_LOCATION_SELECT)
      .single();

    if (error) {
      console.error("Database error:", error);
      return errorResponse("DATABASE_ERROR", { message: error.message }, 500);
    }

    return successResponse(data, undefined, 201);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
