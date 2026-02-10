# Item Pages Implementation

This document describes the implementation of the Item Detail and Item Add pages for the DAITJI project.

## Overview

Two main pages have been implemented:

- **Item Detail Page** (`/item/[id]`): View, edit, and delete items
- **Item Add Page** (`/items/add`): Create new items

## File Structure

```
app/item/
├── [id]/
│   ├── page.tsx                 # Server component - fetches data
│   ├── ItemDetailClient.tsx     # Client component - UI and interactions
│   ├── loading.tsx              # Loading state
│   ├── error.tsx                # Error boundary
│   └── not-found.tsx            # 404 page
└── add/
    ├── page.tsx                 # Server component - fetches locations
    ├── ItemAddClient.tsx        # Client component - form handling
    ├── loading.tsx              # Loading state
    └── error.tsx                # Error boundary
```

## Features

### Item Detail Page (`/item/[id]`)

#### View Mode

- **Image Display**: Shows item image or placeholder icon
- **Basic Information**:
  - Name, type, status badges
  - Quantity
  - Barcode (if available)
  - Location breadcrumb (navigable)
  - Expiry status badge (for applicable types)
- **Tags**: Display all tags as badges
- **Type-specific Metadata**:
  - **FOOD**: Expiry date, purchase date, brand, category
  - **COSMETIC**: Opened date, PAO (Period After Opening), brand, category
  - **MEDICINE**: Expiry date, prescription status, dosage, warnings
  - **GENERAL**: Purchase date, warranty, manufacturer, model, notes
- **System Info**: Created and updated timestamps
- **Actions**: Edit and Delete buttons

#### Edit Mode

- All fields editable via form inputs
- Dynamic metadata fields based on item type
- Tag management (add/remove)
- Real-time validation
- Save/Cancel actions
- Loading states during API calls

#### Delete Functionality

- Confirmation modal before deletion
- Redirects to explorer after successful deletion
- Error handling

### Item Add Page (`/items/add`)

#### Features

- **Image URL Input**: Add image via URL (with preview)
- **Basic Information Form**:
  - Name (required)
  - Type (required, dropdown)
  - Location (required, hierarchical dropdown)
  - Quantity (default: 1)
  - Barcode (optional)
- **Tag Management**: Add tags with Enter key or button
- **Dynamic Metadata Fields**: Changes based on selected type
- **Form Validation**:
  - Required field checking
  - URL format validation
  - Zod schema validation on server
- **Actions**: Save and Cancel buttons
- **Loading States**: Spinner during submission
- **Error Handling**: Display errors from API

## API Integration

### Endpoints Used

#### Item Detail

- `GET /api/items/[id]` - Fetch item with location
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item
- `GET /api/locations/[id]/path` - Get location breadcrumb path

#### Item Add

- `POST /api/items` - Create new item
- `GET /api/locations` - Fetch all locations for dropdown

## Type Safety

### Custom Types

```typescript
type ItemMetadata = {
  expiry_date?: string;
  opened_date?: string;
  pao?: number;
  purchase_date?: string;
  brand?: string;
  category?: string;
  notes?: string;
  prescription?: boolean;
  dosage?: string;
  warnings?: string[];
  warranty_until?: string;
  manufacturer?: string;
  model?: string;
};
```

### Database Type Casting

The `metadata` field from Supabase is typed as `Json`. We cast it to `ItemMetadata` for type safety:

```typescript
const metadata = item.metadata as ItemMetadata;
```

## UI Components Used

### Layout Components

- `Header` - Top navigation
- `BottomNav` - Bottom navigation bar
- `PageHeader` - Page title with back button

### UI Components

- `Card` - Container cards
- `Button` - Action buttons with variants
- `Input` - Text, number, date inputs
- `Select` - Dropdown selections
- `Badge` - Status and tag badges
- `Modal` - Delete confirmation
- `Alert` - Error messages
- `Spinner` - Loading indicators
- `EmptyState` - Empty/error states

### Feature Components

- `LocationBreadcrumb` - Hierarchical location path
- `ExpiryStatus` - Smart expiry status badge

## State Management

### Item Detail Client

- `item` - Current item data
- `isEditing` - Edit mode toggle
- `isDeleteModalOpen` - Delete modal state
- `isSaving` / `isDeleting` - Loading states
- `error` - Error message
- `formData` - Form state (name, type, status, location, quantity, barcode, image_url, tags, metadata)
- `tagInput` - Tag input field state

### Item Add Client

- `isSubmitting` - Form submission state
- `error` - Global error message
- `formData` - Form state
- `tagInput` - Tag input state
- `errors` - Field-level validation errors

## Form Handling

### Validation

- **Client-side**: Basic validation (required fields, formats)
- **Server-side**: Zod schema validation via API
- **Real-time**: Error display on form submission

### Metadata Management

- Dynamic fields based on item type
- `updateMetadata(key, value)` helper function
- Cleans empty values before submission

### Tag Management

- Add tags with Enter key or button
- Remove tags by clicking badge
- Prevent duplicates

## Navigation Flow

```
Dashboard/Explorer
    ↓
  QuickAddButton → /items/add → Submit → /item/[id] (new item)
    ↓
  ItemCard → /item/[id]
    ↓
  Edit → Save → Refresh
    ↓
  Delete → Confirm → /explorer
    ↓
  Back → Previous page
```

## Responsive Design

- **Mobile First**: Optimized for mobile screens
- **Grid Layouts**: 2-column grid on desktop for form fields
- **Sticky Actions**: Bottom action buttons on mobile
- **Overflow Handling**: Scrollable content areas
- **Touch Friendly**: Large tap targets

## Error Handling

### Client-side Errors

- Form validation errors displayed inline
- API errors shown in Alert component
- Network errors caught and displayed

### Server-side Errors

- Error boundary catches React errors
- 404 handling via not-found.tsx
- Custom error messages per error type

## Loading States

### Page Level

- `loading.tsx` with spinner and message

### Component Level

- Button loading states with spinner
- Disabled inputs during submission

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages

## Performance Optimizations

### Server Components

- Initial data fetching on server
- Reduced client JavaScript
- Faster initial page load

### Client Components

- Only interactive parts on client
- Optimized re-renders with useState
- Lazy loading of images

### API Optimization

- Single request for item + location
- Efficient location path building
- Proper caching headers (from API)

## Future Enhancements

### Planned Features

- [ ] Image upload to Supabase Storage
- [ ] Barcode scanner integration
- [ ] Bulk tag editing
- [ ] Item duplication
- [ ] History/audit log
- [ ] Advanced metadata validation
- [ ] Rich text notes editor
- [ ] Multiple image support

### Potential Improvements

- [ ] Optimistic UI updates
- [ ] Auto-save draft
- [ ] Keyboard shortcuts
- [ ] Advanced search in location dropdown
- [ ] Tag suggestions/autocomplete
- [ ] QR code generation
- [ ] Export item details

## Testing Recommendations

### Manual Testing Checklist

- [ ] View item details with all metadata types
- [ ] Edit item and save changes
- [ ] Delete item with confirmation
- [ ] Add new item with all field types
- [ ] Test validation errors
- [ ] Test with missing optional data
- [ ] Test location breadcrumb navigation
- [ ] Test tag add/remove
- [ ] Test responsive layouts
- [ ] Test loading and error states
- [ ] Test back button navigation

### Edge Cases to Test

- [ ] Item without image
- [ ] Item without tags
- [ ] Item with empty metadata
- [ ] Very long item name
- [ ] Many tags
- [ ] Deep location hierarchy
- [ ] Invalid item ID (404)
- [ ] Network failure during save
- [ ] Concurrent edits

## Dependencies

### Required Packages

- `next` - Framework (v14+)
- `react` - UI library
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `zod` - Validation
- `@supabase/supabase-js` - Database client

### Internal Dependencies

- All UI components in `/components/ui`
- Feature components in `/components/features`
- API utilities in `/lib/api`
- Validation schemas in `/lib/validations`
- Type definitions in `/lib/types`

## Integration Points

### Database Schema

- `items` table with all fields
- `locations` table for hierarchy
- Foreign key relationship
- Computed expiry_date column

### API Routes

- Full CRUD operations for items
- Location path resolution
- Validation at API layer
- Error response standardization

### Navigation

- QuickAddButton in Dashboard and Explorer
- ItemCard links from list views
- Back button to previous page
- Bottom navigation always accessible

## Troubleshooting

### Common Issues

**Issue**: Type errors with metadata
**Solution**: Ensure proper casting to `ItemMetadata` type

**Issue**: Back button not working
**Solution**: Check router.back() implementation or use backHref prop

**Issue**: Location dropdown not showing hierarchy
**Solution**: Verify location sort_order and level in database

**Issue**: Tags not saving
**Solution**: Check tags array format (string[] expected)

**Issue**: Image not loading
**Solution**: Verify CORS and URL accessibility

## Code Examples

### Accessing Metadata

```typescript
const metadata = item.metadata as ItemMetadata;
const expiryDate = metadata.expiry_date;
```

### Adding a Tag

```typescript
const addTag = () => {
  if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
    setFormData({
      ...formData,
      tags: [...formData.tags, tagInput.trim()],
    });
    setTagInput("");
  }
};
```

### Updating Metadata

```typescript
const updateMetadata = (key: string, value: any) => {
  setFormData({
    ...formData,
    metadata: {
      ...formData.metadata,
      [key]: value || undefined,
    },
  });
};
```

## Conclusion

The Item Detail and Add pages provide a comprehensive interface for managing items in the DAITJI system. They leverage Next.js App Router patterns, maintain type safety, handle errors gracefully, and provide an excellent user experience across all device sizes.
