# Item Pages Quick Reference

Quick reference guide for working with the Item Detail and Item Add pages.

## URLs

- **Item Detail**: `/item/[id]` (e.g., `/item/123e4567-e89b-12d3-a456-426614174000`)
- **Item Add**: `/item/add`

## Navigation

### Access Item Detail
```typescript
// From ItemCard component
<Link href={`/item/${item.id}`}>

// From code
router.push(`/item/${itemId}`)
```

### Access Item Add
```typescript
// From QuickAddButton
<QuickAddButton onAddItem={() => router.push('/item/add')} />

// From code
router.push('/item/add')
```

## Item Detail Page

### View Mode Features
- View all item information
- Navigate location breadcrumb
- See expiry status
- View all tags

### Edit Mode Features
- Edit all fields inline
- Add/remove tags
- Update type-specific metadata
- Save or cancel changes

### Delete Item
```typescript
// Confirmation modal appears
// After confirmation:
DELETE /api/items/[id]
// Redirects to /explorer
```

## Item Add Page

### Form Fields

#### Required Fields
- **Name**: Text input, 1-200 characters
- **Type**: Select dropdown (FOOD, COSMETIC, MEDICINE, GENERAL)
- **Location**: Select dropdown (hierarchical)

#### Optional Fields
- **Image URL**: Text input (URL format)
- **Quantity**: Number input (default: 1)
- **Barcode**: Text input
- **Tags**: Array of strings

#### Type-Specific Metadata

**FOOD**
- `expiry_date`: Date
- `purchase_date`: Date
- `brand`: String
- `category`: String

**COSMETIC**
- `opened_date`: Date
- `pao`: Number (months)
- `brand`: String
- `category`: String

**MEDICINE**
- `expiry_date`: Date
- `prescription`: Boolean
- `dosage`: String
- `warnings`: Array of strings

**GENERAL**
- `purchase_date`: Date
- `warranty_until`: Date
- `manufacturer`: String
- `model`: String
- `notes`: String (long text)

## API Calls

### Get Item Detail
```typescript
const response = await fetch(`/api/items/${id}`)
const { data } = await response.json()
// data includes item + location
```

### Update Item
```typescript
const response = await fetch(`/api/items/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData),
})
```

### Create Item
```typescript
const response = await fetch('/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(itemData),
})
```

### Delete Item
```typescript
const response = await fetch(`/api/items/${id}`, {
  method: 'DELETE',
})
```

## Type Definitions

### ItemMetadata
```typescript
type ItemMetadata = {
  // FOOD & MEDICINE
  expiry_date?: string
  
  // FOOD & GENERAL
  purchase_date?: string
  
  // FOOD & COSMETIC
  brand?: string
  category?: string
  
  // COSMETIC
  opened_date?: string
  pao?: number
  
  // MEDICINE
  prescription?: boolean
  dosage?: string
  warnings?: string[]
  
  // GENERAL
  warranty_until?: string
  manufacturer?: string
  model?: string
  notes?: string
}
```

## Component Props

### ItemDetailClient
```typescript
interface ItemDetailClientProps {
  item: Item
  locationPath: Array<{
    id: string
    name: string
    icon?: string | null
  }>
  allLocations: Location[]
}
```

### ItemAddClient
```typescript
interface ItemAddClientProps {
  locations: Location[]
}
```

## Common Patterns

### Casting Metadata
```typescript
const metadata = item.metadata as ItemMetadata
```

### Handling Dates
```typescript
// Display
import { formatDate } from '@/lib/utils/format'
formatDate(item.created_at) // "2024년 2월 3일"

// Input (date field)
value={metadata.expiry_date?.split('T')[0] || ''}

// Save (convert to ISO)
new Date(dateString).toISOString()
```

### Tag Management
```typescript
// Add tag
setFormData({
  ...formData,
  tags: [...formData.tags, newTag]
})

// Remove tag
setFormData({
  ...formData,
  tags: formData.tags.filter(t => t !== tagToRemove)
})
```

### Metadata Updates
```typescript
const updateMetadata = (key: string, value: any) => {
  setFormData({
    ...formData,
    metadata: {
      ...formData.metadata,
      [key]: value || undefined,
    },
  })
}
```

## Error Handling

### Client-Side Validation
```typescript
const errors: Record<string, string> = {}

if (!formData.name.trim()) {
  errors.name = '물품 이름은 필수입니다'
}

if (!formData.type) {
  errors.type = '타입을 선택해주세요'
}
```

### API Error Handling
```typescript
try {
  const response = await fetch('/api/items', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const result = await response.json()
    throw new Error(result.error?.message || 'Failed')
  }
  
  // Success
} catch (err) {
  setError(err.message)
}
```

## Styling Tips

### Form Grid (Desktop)
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input label="Field 1" />
  <Input label="Field 2" />
</div>
```

### Sticky Action Buttons (Mobile)
```typescript
<div className="sticky bottom-20 bg-secondary-50 py-4 border-t">
  <Button>Save</Button>
</div>
```

### Responsive Image Container
```typescript
<div className="aspect-video bg-secondary-100 rounded-lg overflow-hidden">
  {image ? <img /> : <PlaceholderIcon />}
</div>
```

## Testing Quick Checks

### Item Detail
```bash
# View item
curl http://localhost:3000/api/items/{id}

# Update item
curl -X PATCH http://localhost:3000/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete item
curl -X DELETE http://localhost:3000/api/items/{id}
```

### Item Add
```bash
# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "type": "GENERAL",
    "location_id": "uuid",
    "quantity": 1
  }'
```

## Keyboard Shortcuts

- **Enter**: Add tag (in tag input field)
- **Escape**: Close delete modal
- **Tab**: Navigate form fields

## Browser Console Debugging

```javascript
// Check item data
console.log('Item:', item)

// Check metadata type
console.log('Metadata:', item.metadata)

// Check form state
console.log('Form Data:', formData)

// Check validation errors
console.log('Errors:', errors)
```

## Common Gotchas

1. **Metadata Type**: Always cast to `ItemMetadata` when accessing properties
2. **Date Format**: Use `.split('T')[0]` for date inputs, `.toISOString()` for saving
3. **Empty Values**: Clean metadata before submission (remove undefined/empty)
4. **Location Dropdown**: Locations must be hierarchical (level + sort_order)
5. **Back Button**: Use `router.back()` or `onBack` prop, not `backButton`

## Quick Fixes

### Issue: Metadata not showing
```typescript
// Bad
const expiry = item.metadata.expiry_date

// Good
const metadata = item.metadata as ItemMetadata
const expiry = metadata.expiry_date
```

### Issue: Date input not working
```typescript
// Bad
value={metadata.expiry_date}

// Good
value={metadata.expiry_date ? metadata.expiry_date.split('T')[0] : ''}
```

### Issue: Tags not updating
```typescript
// Bad
formData.tags.push(newTag)

// Good
setFormData({
  ...formData,
  tags: [...formData.tags, newTag]
})
```

## Performance Tips

1. Use Server Components for initial data fetching
2. Only make Client Components for interactive parts
3. Debounce search/filter inputs
4. Use proper loading states
5. Implement error boundaries
6. Optimize images with Next.js Image component (future)

## Resources

- [Full Implementation Docs](./ITEM-PAGES-IMPLEMENTATION.md)
- [API Documentation](./API-QUICK-REFERENCE.md)
- [Component Library](./COMPONENT-QUICK-REFERENCE.md)
- [Database Schema](../supabase/migrations/001_initial_schema.sql)
