# API Quick Reference Card

## Base URL
```
http://localhost:3000/api
```

---

## Items API

```bash
# List items (with filters)
GET /api/items?type=FOOD&status=ACTIVE&page=1&per_page=20

# Create item
POST /api/items
{
  "name": "Milk",
  "type": "FOOD",
  "location_id": "uuid",
  "quantity": 2,
  "metadata": { "expiry_date": "2026-02-15T00:00:00Z" }
}

# Get item
GET /api/items/:id

# Update item
PATCH /api/items/:id
{ "quantity": 1 }

# Delete item
DELETE /api/items/:id

# Get expiring items
GET /api/items/expiring?days=7
```

---

## Locations API

```bash
# List locations (flat)
GET /api/locations

# List locations (tree)
GET /api/locations?tree=true

# Create location
POST /api/locations
{
  "name": "Kitchen",
  "level": 1,
  "icon": "🍳",
  "color": "#FF5733"
}

# Get location
GET /api/locations/:id

# Update location
PATCH /api/locations/:id
{ "name": "New Name" }

# Delete location
DELETE /api/locations/:id

# Get location path
GET /api/locations/:id/path
```

---

## Stats API

```bash
# Dashboard statistics
GET /api/stats/dashboard
```

---

## Query Parameters

### Items
| Param | Type | Example |
|-------|------|---------|
| `type` | string | `FOOD,COSMETIC` |
| `status` | string | `ACTIVE,EXPIRED` |
| `location_id` | uuid | `abc-123-...` |
| `search` | string | `milk` |
| `expiring_within_days` | number | `7` |
| `page` | number | `1` |
| `per_page` | number | `20` |
| `sort_by` | string | `name` |
| `sort_dir` | asc/desc | `desc` |

### Locations
| Param | Type | Example |
|-------|------|---------|
| `level` | number | `1` |
| `parent_id` | uuid | `abc-123-...` |
| `search` | string | `kitchen` |
| `tree` | boolean | `true` |

---

## Item Types
- `FOOD`
- `COSMETIC`
- `MEDICINE`
- `GENERAL`

## Item Status
- `ACTIVE`
- `CONSUMED`
- `EXPIRED`
- `DISCARDED`

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [...]
  }
}
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INVALID_ID` | 400 | Bad UUID format |
| `NOT_FOUND` | 404 | Resource missing |
| `LOCATION_HAS_ITEMS` | 409 | Can't delete location |
| `DATABASE_ERROR` | 500 | DB operation failed |

---

## Common Operations

### Create Item Flow
```bash
# 1. Create location
curl -X POST /api/locations \
  -d '{"name":"Kitchen","level":1}'
# → Save location_id

# 2. Create item
curl -X POST /api/items \
  -d '{"name":"Milk","type":"FOOD","location_id":"..."}'
```

### Query Flow
```bash
# 1. Get all items
curl /api/items

# 2. Filter by type
curl /api/items?type=FOOD

# 3. Search by name
curl /api/items?search=milk

# 4. Get expiring items
curl /api/items/expiring?days=7
```

### Location Hierarchy
```bash
# 1. Create root (level 1)
POST /locations {"name":"Home","level":1}

# 2. Create child (level 2)
POST /locations {"name":"Kitchen","level":2,"parent_id":"..."}

# 3. Create grandchild (level 3)
POST /locations {"name":"Fridge","level":3,"parent_id":"..."}

# 4. Get tree
GET /locations?tree=true

# 5. Get path
GET /locations/:id/path
```

---

## Metadata Examples

### Food
```json
{
  "expiry_date": "2026-02-15T00:00:00Z",
  "purchase_date": "2026-02-01T00:00:00Z",
  "brand": "Local Farm",
  "category": "Dairy"
}
```

### Cosmetic
```json
{
  "opened_date": "2026-01-01T00:00:00Z",
  "pao": 12,
  "brand": "Beauty Co",
  "category": "Skincare"
}
```

### Medicine
```json
{
  "expiry_date": "2027-12-31T00:00:00Z",
  "prescription": true,
  "dosage": "500mg twice daily",
  "warnings": ["Take with food"]
}
```

---

## Testing Commands

```bash
# Test connection
curl http://localhost:3000/api/stats/dashboard

# Create test data
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","level":1}'

# List all
curl http://localhost:3000/api/items
curl http://localhost:3000/api/locations

# Delete test data
curl -X DELETE http://localhost:3000/api/items/:id
curl -X DELETE http://localhost:3000/api/locations/:id
```

---

## Tips

1. **Pretty Print**: Use `| jq` for formatted JSON
2. **Save IDs**: Store returned IDs for subsequent requests
3. **Check Status**: Use `-i` flag to see HTTP status
4. **Debug**: Use `-v` flag for verbose output
5. **Tree View**: Use `?tree=true` for hierarchical locations

---

## CURL Examples

### With Headers
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"name":"Item",...}'
```

### Save Response
```bash
curl http://localhost:3000/api/items > items.json
```

### Pretty Print
```bash
curl http://localhost:3000/api/items | jq '.'
```

### Extract ID
```bash
ITEM_ID=$(curl -s -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test",...}' \
  | jq -r '.data.id')
```

---

## Database Functions

Available via Supabase:
- `get_location_path(location_id)` - Returns "Home > Kitchen > Fridge"
- `get_expiring_items(days_threshold)` - Returns expiring items

---

## Quick Validation Rules

### Items
- `name`: Required, max 200 chars
- `type`: Must be enum value
- `location_id`: Must exist in DB
- `quantity`: Integer >= 0
- `metadata.expiry_date`: ISO 8601 datetime

### Locations
- `name`: Required, max 100 chars
- `level`: 1-10, must match hierarchy
- `parent_id`: Must exist if provided
- `color`: Hex format (#RRGGBB)

---

## Development URLs

| Environment | URL |
|-------------|-----|
| Local API | http://localhost:3000/api |
| Local Supabase | http://localhost:54321 |
| Supabase Studio | http://localhost:54323 |

---

For full documentation, see [API.md](./API.md)
