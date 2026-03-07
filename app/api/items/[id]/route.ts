import { NextRequest } from "next/server";
import { ItemUpdateSchema } from "@/lib/validations/schemas";
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from "@/lib/api/utils";
import { getAuthenticatedClient } from "@/lib/api/auth";

export const preferredRegion = "icn1";

/**
 * GET /api/items/[id]
 * Fetch a single item by ID with location information
 *
 * @param id - Item UUID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const { data, error } = await supabase
      .from("items")
      .select(
        `
        id,
        name,
        type,
        location_id,
        quantity,
        barcode,
        image_url,
        tags,
        metadata,
        status,
        created_at,
        updated_at,
        user_id,
        location:locations(
          id,
          name,
          icon,
          parent_id,
          level,
          sort_order,
          color,
          created_at,
          updated_at,
          user_id
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("ITEM_NOT_FOUND", undefined, 404);
      }
      console.error("Database error:", error);
      return errorResponse("QUERY_ERROR", { message: error.message }, 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/items/[id]
 * Update an existing item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const body = await request.json();

    // Validate request body (partial update)
    const validatedData = ItemUpdateSchema.parse(body);

    // Check if update data is empty
    if (Object.keys(validatedData).length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        { message: "업데이트할 필드가 없습니다" },
        400,
      );
    }

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    // If location_id is being updated, verify it exists and belongs to user
    if (validatedData.location_id) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("id", validatedData.location_id)
        .eq("user_id", user.id)
        .single();

      if (locationError || !location) {
        return errorResponse("LOCATION_NOT_FOUND", undefined, 404);
      }
    }

    // Update item
    const { data, error } = await (supabase.from("items") as any)
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        id,
        name,
        type,
        location_id,
        quantity,
        barcode,
        image_url,
        tags,
        metadata,
        status,
        created_at,
        updated_at,
        user_id,
        location:locations(
          id,
          name,
          icon,
          parent_id,
          level,
          sort_order,
          color,
          created_at,
          updated_at,
          user_id
        )
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("ITEM_NOT_FOUND", undefined, 404);
      }
      console.error("Database error:", error);
      return errorResponse("DATABASE_ERROR", { message: error.message }, 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/items/[id]
 * Delete an item by ID
 *
 * @param id - Item UUID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse("INVALID_ID", undefined, 400);
    }

    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("ITEM_NOT_FOUND", undefined, 404);
      }
      console.error("Database error:", error);
      return errorResponse("DATABASE_ERROR", { message: error.message }, 500);
    }

    return successResponse(
      { message: "물품을 성공적으로 삭제했습니다" },
      undefined,
      200,
    );
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
