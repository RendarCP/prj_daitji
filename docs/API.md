# DAITJI API Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format

All API responses follow this structure:

```typescript
{
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    per_page?: number
    total?: number
    total_pages?: number
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_ID` | 400 | Invalid UUID format |
| `NOT_FOUND` | 404 | Resource not found |
| `ITEM_NOT_FOUND` | 404 | Item not found |
| `LOCATION_NOT_FOUND` | 404 | Location not found |
| `LOCATION_HAS_ITEMS` | 409 | Cannot delete location with items |
| `LOCATION_HAS_CHILDREN` | 409 | Cannot delete location with children |
| `INVALID_PARENT` | 400 | Invalid parent location |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `QUERY_ERROR` | 500 | Failed to execute query |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Items API

### List Items
```
GET /api/items
```

Fetch items with filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by item type (comma-separated): `FOOD`, `COSMETIC`, `MEDICINE`, `GENERAL` |
| `status` | string | - | Filter by status (comma-separated): `ACTIVE`, `CONSUMED`, `EXPIRED`, `DISCARDED` |
| `location_id` | string (UUID) | - | Filter by location |
| `search` | string | - | Search by item name (case-insensitive) |
| `expiring_within_days` | number | - | Filter items expiring within N days |
| `page` | number | 1 | Page number |
| `per_page` | number | 20 | Items per page (max: 100) |
| `sort_by` | string | `created_at` | Sort field |
| `sort_dir` | `asc`\|`desc` | `desc` | Sort direction |

**Response:**
```typescript
{
  success: true,
  data: Array<{
    item_id: string
    item_name: string
    item_type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'
    quantity: number
    barcode: string | null
    image_url: string | null
    tags: string[]
    metadata: object
    expiry_date: string | null
    days_until_expiry: number | null
    location_id: string
    location_name: string
    location_level: number
    location_icon: string | null
    location_color: string | null
  }>,
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/items?type=FOOD&status=ACTIVE&page=1&per_page=20"
```

---

### Create Item
```
POST /api/items
```

Create a new item.

**Request Body:**
```typescript
{
  name: string                    // Required
  type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'  // Required
  location_id: string             // Required (UUID)
  quantity?: number               // Default: 1
  barcode?: string
  image_url?: string
  tags?: string[]
  metadata?: {
    expiry_date?: string          // ISO 8601
    opened_date?: string          // ISO 8601
    pao?: number                  // Period after opening (months)
    purchase_date?: string        // ISO 8601
    brand?: string
    category?: string
    notes?: string
    // ... additional fields
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string
    name: string
    type: string
    location_id: string
    quantity: number
    // ... other fields
    location: {
      id: string
      name: string
      // ... location fields
    }
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Milk",
    "type": "FOOD",
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "quantity": 2,
    "metadata": {
      "expiry_date": "2026-02-15T00:00:00.000Z",
      "brand": "Local Farm"
    }
  }'
```

---

### Get Item by ID
```
GET /api/items/:id
```

Fetch a single item by ID with location information.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string
    name: string
    type: string
    status: string
    location_id: string
    quantity: number
    barcode: string | null
    image_url: string | null
    tags: string[]
    metadata: object
    computed_expiry_date: string | null
    created_at: string
    updated_at: string
    location: {
      id: string
      name: string
      level: number
      // ... location fields
    }
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/items/123e4567-e89b-12d3-a456-426614174000
```

---

### Update Item
```
PATCH /api/items/:id
```

Update an existing item (partial update).

**Request Body:** (all fields optional)
```typescript
{
  name?: string
  type?: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'
  location_id?: string
  quantity?: number
  barcode?: string
  image_url?: string
  tags?: string[]
  metadata?: object
}
```

**Response:** Same as Get Item by ID

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/items/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 1}'
```

---

### Delete Item
```
DELETE /api/items/:id
```

Delete an item by ID.

**Response:**
```typescript
{
  success: true,
  data: {
    message: "Item deleted successfully"
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/items/123e4567-e89b-12d3-a456-426614174000
```

---

### Get Expiring Items
```
GET /api/items/expiring
```

Fetch items expiring within specified days.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 7 | Number of days threshold |

**Response:**
```typescript
{
  success: true,
  data: Array<{
    item_id: string
    item_name: string
    item_type: string
    expiry_date: string
    days_until_expiry: number
    location_name: string
    location_path: string
  }>
}
```

**Example:**
```bash
curl "http://localhost:3000/api/items/expiring?days=7"
```

---

## Locations API

### List Locations
```
GET /api/locations
```

Fetch locations with optional filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `level` | number (1-10) | - | Filter by location level |
| `parent_id` | string (UUID) | - | Filter by parent location (use `null` for root locations) |
| `search` | string | - | Search by location name (case-insensitive) |
| `tree` | `true`\|`false` | `false` | Return as tree structure |

**Response (flat list):**
```typescript
{
  success: true,
  data: Array<{
    id: string
    name: string
    level: number
    parent_id: string | null
    icon: string | null
    color: string | null
    sort_order: number
    created_at: string
    updated_at: string
  }>
}
```

**Response (tree structure when `tree=true`):**
```typescript
{
  success: true,
  data: Array<{
    id: string
    name: string
    level: number
    parent_id: string | null
    // ... other fields
    children: Array<Location>  // Recursive
  }>
}
```

**Example:**
```bash
curl "http://localhost:3000/api/locations?tree=true"
```

---

### Create Location
```
POST /api/locations
```

Create a new location.

**Request Body:**
```typescript
{
  name: string                // Required
  level: number               // Required (1-10)
  parent_id?: string          // Optional (UUID)
  icon?: string
  color?: string              // Hex color (e.g., "#FF5733")
  sort_order?: number
}
```

**Validation Rules:**
- Root locations (without `parent_id`) must have `level: 1`
- Child locations must have `level = parent.level + 1`

**Response:**
```typescript
{
  success: true,
  data: {
    id: string
    name: string
    level: number
    parent_id: string | null
    icon: string | null
    color: string | null
    sort_order: number
    created_at: string
    updated_at: string
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kitchen",
    "level": 1,
    "icon": "🍳",
    "color": "#FF5733"
  }'
```

---

### Get Location by ID
```
GET /api/locations/:id
```

Fetch a single location by ID with children and item count.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string
    name: string
    level: number
    parent_id: string | null
    icon: string | null
    color: string | null
    sort_order: number
    created_at: string
    updated_at: string
    children: Array<Location>
    item_count: number
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/locations/123e4567-e89b-12d3-a456-426614174000
```

---

### Update Location
```
PATCH /api/locations/:id
```

Update an existing location (partial update).

**Request Body:** (all fields optional)
```typescript
{
  name?: string
  level?: number
  parent_id?: string
  icon?: string
  color?: string
  sort_order?: number
}
```

**Validation Rules:**
- Cannot set location as its own parent
- Level hierarchy must be maintained

**Response:** Same as Get Location by ID

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/locations/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Kitchen"}'
```

---

### Delete Location
```
DELETE /api/locations/:id
```

Delete a location by ID.

**Restrictions:**
- Cannot delete if location has child locations
- Cannot delete if location has items

**Response:**
```typescript
{
  success: true,
  data: {
    message: "Location deleted successfully"
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/locations/123e4567-e89b-12d3-a456-426614174000
```

---

### Get Location Path
```
GET /api/locations/:id/path
```

Get the hierarchical path for a location.

**Response:**
```typescript
{
  success: true,
  data: {
    path: string  // e.g., "Home > Kitchen > Fridge"
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/locations/123e4567-e89b-12d3-a456-426614174000/path
```

---

## Stats API

### Dashboard Statistics
```
GET /api/stats/dashboard
```

Fetch dashboard statistics.

**Response:**
```typescript
{
  success: true,
  data: {
    total_items: number        // Total number of items
    active_items: number       // Number of active items
    expiring_soon: number      // Items expiring within 7 days
    expired: number            // Already expired items
    locations_count: number    // Total number of locations
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/stats/dashboard
```

---

## CORS Support

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

OPTIONS requests are supported for preflight checks.

---

## Notes

1. **Authentication**: Authentication is now partially implemented with Supabase Auth. App pages and selected settings/item/location endpoints require an authenticated user session, while some MVP-era endpoints and docs may still be in transition.

2. **Database Functions Used**:
   - `get_location_path(location_id)`: Returns hierarchical path string
   - `get_expiring_items(days_threshold)`: Returns items expiring within threshold

3. **Views Used**:
   - `v_active_items_with_location`: Optimized view for item listings with location data
   - `v_location_item_counts`: Location statistics (not directly exposed but available)

4. **Computed Fields**:
   - `computed_expiry_date`: Automatically calculated from metadata (expiry_date or opened_date + pao)

5. **Validation**: All inputs are validated using Zod schemas before processing.
