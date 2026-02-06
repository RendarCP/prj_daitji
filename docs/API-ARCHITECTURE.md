# DAITJI API Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                         │
│              (React/Next.js/Mobile App)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/JSON
                        │ CORS Enabled
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│                  (App Router - TypeScript)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Items API   │  │ Locations API│  │  Stats API   │     │
│  │  6 endpoints │  │  6 endpoints │  │  1 endpoint  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                  Middleware Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Zod Validation                                      │  │
│  │ • Error Handling                                      │  │
│  │ • Response Formatting                                 │  │
│  │ • CORS Headers                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ Supabase Client
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
│                     (PostgreSQL)                             │
├─────────────────────────────────────────────────────────────┤
│  Tables:           Views:                Functions:          │
│  • items           • v_active_items_   • get_location_path()│
│  • locations         with_location     • get_expiring_items()│
│                    • v_location_item_                        │
│                      counts                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## API Route Structure

```
app/api/
│
├── items/
│   ├── route.ts                      # GET, POST /api/items
│   ├── [id]/
│   │   └── route.ts                  # GET, PATCH, DELETE /api/items/:id
│   └── expiring/
│       └── route.ts                  # GET /api/items/expiring
│
├── locations/
│   ├── route.ts                      # GET, POST /api/locations
│   └── [id]/
│       ├── route.ts                  # GET, PATCH, DELETE /api/locations/:id
│       └── path/
│           └── route.ts              # GET /api/locations/:id/path
│
└── stats/
    └── dashboard/
        └── route.ts                  # GET /api/stats/dashboard
```

---

## Request Flow

### Example: Create Item

```
1. Client Request
   ↓
   POST /api/items
   Content-Type: application/json
   Body: { name: "Milk", type: "FOOD", location_id: "..." }

2. Route Handler (app/api/items/route.ts)
   ↓
   • Parse request body
   • Validate with Zod (lib/validations/schemas.ts)

3. Validation Success
   ↓
   • Create Supabase client (lib/supabase/server.ts)
   • Verify location exists
   • Insert into items table

4. Database Operation
   ↓
   • Execute INSERT query
   • Fetch created item with location join
   • Return data

5. Response Formatting (lib/api/utils.ts)
   ↓
   • successResponse(data, undefined, 201)
   • Add CORS headers
   • Return JSON

6. Client receives
   ↓
   {
     success: true,
     data: { id: "...", name: "Milk", ... }
   }
```

---

## Data Flow Diagram

### Items API Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ GET /api/items?type=FOOD&page=1
       ▼
┌─────────────────────┐
│  ItemsQuerySchema   │ ← Zod Validation
│  (lib/validations)  │
└──────┬──────────────┘
       │ Validated params
       ▼
┌─────────────────────┐
│   applyFilters()    │ ← Query Builders
│   applySorting()    │   (lib/api/utils.ts)
│   applyPagination() │
└──────┬──────────────┘
       │ Built query
       ▼
┌─────────────────────┐
│ v_active_items_with │ ← Database View
│      _location      │
└──────┬──────────────┘
       │ Result set
       ▼
┌─────────────────────┐
│  successResponse()  │ ← Response Formatter
└──────┬──────────────┘
       │ JSON response
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

### Locations API Flow (Tree Structure)

```
Client Request
     ↓
GET /api/locations?tree=true
     ↓
Supabase Query
     ↓
Fetch all locations (flat list)
     ↓
buildLocationTree()
     ↓
  • Create location map
  • Build parent-child relationships
  • Sort by sort_order
  • Return tree structure
     ↓
Client receives hierarchical tree
```

---

## Component Architecture

### API Layer Components

```
┌─────────────────────────────────────────────────────────┐
│                    Route Handlers                        │
│  (app/api/**/route.ts)                                  │
│                                                          │
│  • Request parsing                                       │
│  • Business logic                                        │
│  • Response formatting                                   │
└───────────────┬─────────────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌─────────┐
│Validation│Utils│  │Supabase │
│Schemas │ │Functions│Client   │
└────────┘ └────────┘ └─────────┘
│          │          │
│          │          │
lib/       lib/      lib/
validations/ api/    supabase/
```

### Validation Layer

```
Request Body
     ↓
┌─────────────────────┐
│  ItemFormDataSchema │
├─────────────────────┤
│ • name: string      │
│ • type: enum        │
│ • location_id: uuid │
│ • quantity: number  │
│ • metadata: object  │
└─────────────────────┘
     ↓
   Valid? ─No──→ ValidationError (400)
     │
    Yes
     ↓
Process Request
```

### Error Handling Flow

```
Try Block
   ↓
Operation
   ↓
   ├─Success──→ successResponse()
   │             ↓
   │          { success: true, data: ... }
   │
   └─Error
       ↓
   ┌────────────┬────────────┬────────────┐
   │            │            │            │
ZodError  DatabaseError  OtherError
   │            │            │
   ├─→ handleValidationError()
   ├─→ handleDatabaseError()
   └─→ handleError()
       ↓
   { success: false, error: { code, message, details } }
```

---

## Database Schema Integration

### Tables

```
items
├── id (uuid, PK)
├── user_id (uuid, FK nullable)
├── location_id (uuid, FK) → locations.id
├── name (text)
├── type (enum)
├── status (enum)
├── quantity (integer)
├── metadata (jsonb)
├── tags (text[])
└── computed_expiry_date (timestamptz, generated)

locations
├── id (uuid, PK)
├── user_id (uuid, FK nullable)
├── parent_id (uuid, FK) → locations.id
├── name (text)
├── level (integer, 1-10)
├── icon (text)
├── color (text)
└── sort_order (integer)
```

### Views

```
v_active_items_with_location
├── All item columns
├── location_name
├── location_level
├── location_icon
├── location_color
├── expiry_date (computed)
└── days_until_expiry (computed)

v_location_item_counts
├── location_id
├── location_name
├── level
├── total_items
├── active_items
├── expired_items
└── expiring_soon_items
```

### Functions

```
get_location_path(location_id UUID) → TEXT
  Returns: "Parent > Child > Grandchild"

get_expiring_items(days_threshold INT) → TABLE
  Returns: Items expiring within N days with location path
```

---

## API Endpoint Mapping

### Items Domain

| HTTP Method | Endpoint | Handler | Database Operation |
|-------------|----------|---------|-------------------|
| GET | `/api/items` | List items | SELECT from view + filters |
| POST | `/api/items` | Create item | INSERT into items |
| GET | `/api/items/:id` | Get item | SELECT with JOIN |
| PATCH | `/api/items/:id` | Update item | UPDATE items |
| DELETE | `/api/items/:id` | Delete item | DELETE from items |
| GET | `/api/items/expiring` | Expiring items | CALL function |

### Locations Domain

| HTTP Method | Endpoint | Handler | Database Operation |
|-------------|----------|---------|-------------------|
| GET | `/api/locations` | List locations | SELECT all + optional tree build |
| POST | `/api/locations` | Create location | INSERT into locations |
| GET | `/api/locations/:id` | Get location | SELECT with children |
| PATCH | `/api/locations/:id` | Update location | UPDATE locations |
| DELETE | `/api/locations/:id` | Delete location | DELETE with validation |
| GET | `/api/locations/:id/path` | Get path | CALL function |

### Stats Domain

| HTTP Method | Endpoint | Handler | Database Operation |
|-------------|----------|---------|-------------------|
| GET | `/api/stats/dashboard` | Get stats | 5 parallel COUNT queries |

---

## Security Architecture

```
Request
   ↓
┌─────────────────────────┐
│   Input Validation      │
│   (Zod Schemas)         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   UUID Format Check     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Foreign Key Check     │
│   (Verify Related Data) │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Business Logic        │
│   Validation            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Supabase Client       │
│   (Parameterized Queries)│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Database Constraints  │
│   (FK, Unique, Check)   │
└─────────────────────────┘
```

---

## Performance Optimization Points

### Query Optimization
```
1. Database Views
   └─ Pre-joined tables for common queries
   └─ Computed columns for complex logic

2. Parallel Execution
   └─ Dashboard stats run 5 queries simultaneously
   └─ Promise.all() for independent operations

3. Pagination
   └─ Limit result sets with .range()
   └─ Return total count for UI

4. Selective Fields
   └─ Only fetch required columns
   └─ Use .select() with specific fields

5. Indexing
   └─ Primary keys (id)
   └─ Foreign keys (location_id, parent_id)
   └─ Common filters (type, status)
```

### Caching Strategy (Future)
```
┌──────────────┐
│  Client      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  API Route   │
└──────┬───────┘
       │
    Check Redis ──Yes──→ Return cached
       │
       No
       ▼
┌──────────────┐
│  Database    │
└──────┬───────┘
       │
       ▼
   Cache result
       │
       ▼
   Return data
```

---

## Type Safety Flow

```
Request
   ↓
Zod Schema (Runtime Validation)
   ↓
TypeScript Types (Compile-time)
   ↓
Database Types (from Supabase)
   ↓
Response Types (ApiResponse<T>)
   ↓
Client receives fully typed data
```

### Type Chain Example

```typescript
// 1. Zod Schema
const ItemFormDataSchema = z.object({
  name: z.string(),
  type: z.enum(['FOOD', 'COSMETIC', 'MEDICINE', 'GENERAL']),
  // ...
})

// 2. Inferred TypeScript Type
type ItemFormDataInput = z.infer<typeof ItemFormDataSchema>

// 3. Database Type
type ItemInsert = Database['public']['Tables']['items']['Insert']

// 4. Response Type
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: ErrorObject
}

// 5. Complete Flow
ItemFormDataInput → Validation → ItemInsert → Database → Item → ApiResponse<Item>
```

---

## Scalability Considerations

### Current Implementation
- ✅ Stateless API routes
- ✅ Horizontal scaling ready
- ✅ Database connection pooling (Supabase)
- ✅ Pagination for large datasets
- ✅ Efficient queries with views

### Future Enhancements
- 🔄 Redis caching layer
- 🔄 Rate limiting per IP
- 🔄 CDN for static assets
- 🔄 Database read replicas
- 🔄 Message queue for async operations

---

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│          Load Balancer                    │
└────────────┬─────────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐
│ API    ││ API    ││ API    │  Next.js Instances
│Instance││Instance││Instance│  (Stateless)
└───┬────┘└───┬────┘└───┬────┘
    └──────────┼──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Supabase Database  │   PostgreSQL
    │  (Connection Pool)  │   (Managed Service)
    └─────────────────────┘
```

---

## Monitoring & Observability

### Metrics to Track
```
Performance Metrics:
├── Response time per endpoint
├── Database query duration
├── Error rate by endpoint
└── Request volume

Business Metrics:
├── Items created per day
├── Locations created per day
├── Most accessed endpoints
└── Popular item types

Error Tracking:
├── 4xx errors by type
├── 5xx errors by type
├── Validation errors
└── Database errors
```

### Logging Strategy
```
Request
   ↓
Log: Request received (method, path, params)
   ↓
Process
   ↓
   ├─Success──→ Log: Request completed (status, duration)
   │
   └─Error
       ↓
   Log: Request failed (error code, message, stack trace)
```

---

## Summary

The DAITJI API architecture follows these principles:

1. **Separation of Concerns**: Routes, validation, utils, and data are separate
2. **Type Safety**: Full TypeScript coverage from request to response
3. **Consistency**: Uniform response format and error handling
4. **Performance**: Optimized queries with views and parallel execution
5. **Maintainability**: Clear structure and comprehensive documentation
6. **Scalability**: Stateless design ready for horizontal scaling
7. **Security**: Input validation and SQL injection protection

The architecture is production-ready and provides a solid foundation for future enhancements.
