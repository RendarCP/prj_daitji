# API Testing Guide

This guide provides step-by-step instructions for testing the DAITJI API endpoints.

## Prerequisites

1. Ensure Supabase is running locally:
   ```bash
   npm run db:start
   ```

2. Apply migrations:
   ```bash
   npm run db:migration:up
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

---

## Test Sequence

### 1. Test Dashboard Stats (Empty State)

```bash
curl http://localhost:3000/api/stats/dashboard
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 0,
    "active_items": 0,
    "expiring_soon": 0,
    "expired": 0,
    "locations_count": 0
  }
}
```

---

### 2. Create Root Location (Kitchen)

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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "<LOCATION_ID>",
    "name": "Kitchen",
    "level": 1,
    "parent_id": null,
    "icon": "🍳",
    "color": "#FF5733",
    "sort_order": 0,
    "created_at": "2026-02-02T...",
    "updated_at": "2026-02-02T..."
  }
}
```

**Save the `id` as `KITCHEN_ID` for next steps.**

---

### 3. Create Child Location (Fridge)

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fridge",
    "level": 2,
    "parent_id": "<KITCHEN_ID>",
    "icon": "🧊"
  }'
```

**Replace `<KITCHEN_ID>` with the actual ID from step 2.**

**Save the returned `id` as `FRIDGE_ID`.**

---

### 4. Get Location Tree

```bash
curl "http://localhost:3000/api/locations?tree=true"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "<KITCHEN_ID>",
      "name": "Kitchen",
      "level": 1,
      "children": [
        {
          "id": "<FRIDGE_ID>",
          "name": "Fridge",
          "level": 2,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 5. Get Location Path

```bash
curl http://localhost:3000/api/locations/<FRIDGE_ID>/path
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "path": "Kitchen > Fridge"
  }
}
```

---

### 6. Create Food Item (Milk)

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Milk",
    "type": "FOOD",
    "location_id": "<FRIDGE_ID>",
    "quantity": 2,
    "tags": ["dairy", "fresh"],
    "metadata": {
      "expiry_date": "2026-02-10T00:00:00.000Z",
      "brand": "Local Farm",
      "category": "Dairy"
    }
  }'
```

**Replace `<FRIDGE_ID>` with the actual ID from step 3.**

**Save the returned `id` as `MILK_ID`.**

---

### 7. Create Expiring Food Item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cheese",
    "type": "FOOD",
    "location_id": "<FRIDGE_ID>",
    "quantity": 1,
    "metadata": {
      "expiry_date": "2026-02-05T00:00:00.000Z",
      "brand": "Artisan Cheese Co"
    }
  }'
```

---

### 8. List All Items

```bash
curl "http://localhost:3000/api/items"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "item_id": "<MILK_ID>",
      "item_name": "Milk",
      "item_type": "FOOD",
      "quantity": 2,
      "tags": ["dairy", "fresh"],
      "location_name": "Fridge",
      "location_level": 2,
      "expiry_date": "2026-02-10T00:00:00.000Z",
      "days_until_expiry": 8
    },
    {
      "item_id": "<CHEESE_ID>",
      "item_name": "Cheese",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

---

### 9. Filter Items by Type

```bash
curl "http://localhost:3000/api/items?type=FOOD"
```

---

### 10. Search Items by Name

```bash
curl "http://localhost:3000/api/items?search=milk"
```

---

### 11. Get Expiring Items

```bash
curl "http://localhost:3000/api/items/expiring?days=7"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "item_id": "<CHEESE_ID>",
      "item_name": "Cheese",
      "item_type": "FOOD",
      "expiry_date": "2026-02-05T00:00:00.000Z",
      "days_until_expiry": 3,
      "location_name": "Fridge",
      "location_path": "Kitchen > Fridge"
    }
  ]
}
```

---

### 12. Update Item Quantity

```bash
curl -X PATCH http://localhost:3000/api/items/<MILK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }'
```

---

### 13. Get Single Item

```bash
curl http://localhost:3000/api/items/<MILK_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "<MILK_ID>",
    "name": "Milk",
    "type": "FOOD",
    "status": "ACTIVE",
    "quantity": 1,
    "location": {
      "id": "<FRIDGE_ID>",
      "name": "Fridge",
      "level": 2
    }
  }
}
```

---

### 14. Get Location with Item Count

```bash
curl http://localhost:3000/api/locations/<FRIDGE_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "<FRIDGE_ID>",
    "name": "Fridge",
    "level": 2,
    "parent_id": "<KITCHEN_ID>",
    "children": [],
    "item_count": 2
  }
}
```

---

### 15. Test Dashboard Stats (With Data)

```bash
curl http://localhost:3000/api/stats/dashboard
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 2,
    "active_items": 2,
    "expiring_soon": 1,
    "expired": 0,
    "locations_count": 2
  }
}
```

---

### 16. Test Pagination

```bash
curl "http://localhost:3000/api/items?page=1&per_page=1"
```

**Expected: Only 1 item returned, with pagination meta.**

---

### 17. Test Sorting

```bash
curl "http://localhost:3000/api/items?sort_by=name&sort_dir=asc"
```

**Expected: Items sorted alphabetically by name.**

---

### 18. Delete Item

```bash
curl -X DELETE http://localhost:3000/api/items/<MILK_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Item deleted successfully"
  }
}
```

---

### 19. Try to Delete Location with Items (Should Fail)

```bash
curl -X DELETE http://localhost:3000/api/locations/<FRIDGE_ID>
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "LOCATION_HAS_ITEMS",
    "message": "Cannot delete location with items"
  }
}
```

---

### 20. Test Validation Error

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "type": "INVALID_TYPE"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "path": "name",
        "message": "Name is required"
      },
      {
        "path": "type",
        "message": "Invalid enum value..."
      },
      {
        "path": "location_id",
        "message": "Required"
      }
    ]
  }
}
```

---

## Error Testing

### Test Invalid UUID

```bash
curl http://localhost:3000/api/items/invalid-uuid
```

**Expected: 400 Bad Request with INVALID_ID error**

---

### Test Not Found

```bash
curl http://localhost:3000/api/items/00000000-0000-0000-0000-000000000000
```

**Expected: 404 Not Found with ITEM_NOT_FOUND error**

---

### Test Invalid Parent Level

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid",
    "level": 5,
    "parent_id": "<KITCHEN_ID>"
  }'
```

**Expected: 400 Bad Request - level must be parent.level + 1**

---

## Advanced Testing

### Test Multiple Filters

```bash
curl "http://localhost:3000/api/items?type=FOOD,COSMETIC&status=ACTIVE&location_id=<FRIDGE_ID>"
```

---

### Test Tree Structure with Deep Hierarchy

1. Create Level 3 location (Vegetable Drawer)
2. Create items at different levels
3. Query tree structure
4. Verify all relationships

---

### Test Concurrent Operations

Use a tool like Apache Bench or Artillery to test:
- Multiple simultaneous reads
- Concurrent writes
- Race conditions

---

## Automated Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_BASE="http://localhost:3000/api"

echo "Testing Dashboard..."
curl -s "$API_BASE/stats/dashboard" | jq

echo -e "\n\nCreating Kitchen..."
KITCHEN=$(curl -s -X POST "$API_BASE/locations" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kitchen","level":1,"icon":"🍳"}')
KITCHEN_ID=$(echo $KITCHEN | jq -r '.data.id')
echo "Kitchen ID: $KITCHEN_ID"

echo -e "\n\nCreating Fridge..."
FRIDGE=$(curl -s -X POST "$API_BASE/locations" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Fridge\",\"level\":2,\"parent_id\":\"$KITCHEN_ID\",\"icon\":\"🧊\"}")
FRIDGE_ID=$(echo $FRIDGE | jq -r '.data.id')
echo "Fridge ID: $FRIDGE_ID"

echo -e "\n\nCreating Milk..."
MILK=$(curl -s -X POST "$API_BASE/items" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Milk\",\"type\":\"FOOD\",\"location_id\":\"$FRIDGE_ID\",\"quantity\":2,\"metadata\":{\"expiry_date\":\"2026-02-10T00:00:00.000Z\"}}")
echo $MILK | jq

echo -e "\n\nListing Items..."
curl -s "$API_BASE/items" | jq

echo -e "\n\nGetting Location Tree..."
curl -s "$API_BASE/locations?tree=true" | jq

echo -e "\n\nDashboard Stats..."
curl -s "$API_BASE/stats/dashboard" | jq
```

Make executable: `chmod +x test-api.sh`

Run: `./test-api.sh`

---

## Notes

1. Replace `<KITCHEN_ID>`, `<FRIDGE_ID>`, `<MILK_ID>` with actual UUIDs from responses
2. All timestamps are in ISO 8601 format
3. Use `jq` for pretty-printing JSON responses
4. Check HTTP status codes with `-i` flag: `curl -i ...`
5. For debugging, use `-v` flag: `curl -v ...`

---

## Common Issues

### "Cannot find module"
- Ensure all dependencies are installed: `npm install`

### "Database connection error"
- Start Supabase: `npm run db:start`
- Check Supabase status: `npm run db:status`

### "Location not found"
- Verify the location exists first
- Check the UUID format is correct

### "CORS errors" (from browser)
- CORS is configured for all origins (*)
- Should work from any frontend application
