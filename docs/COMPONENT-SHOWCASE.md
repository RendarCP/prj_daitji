# Component Visual Showcase

이 문서는 모든 컴포넌트의 시각적 예제를 제공합니다.

## 🎨 Basic UI Components

### Button

```tsx
// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus /></Button>

// States
<Button isLoading>Loading</Button>
<Button disabled>Disabled</Button>

// With Icons
<Button leftIcon={<Plus />}>Add Item</Button>
<Button rightIcon={<ChevronRight />}>Next</Button>
```

**Visual Preview:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Primary   │ │  Secondary  │ │   Outline   │
│   (Blue)    │ │   (Gray)    │ │  (Border)   │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Ghost    │ │   Danger    │ │   Success   │
│ (No Border) │ │    (Red)    │ │   (Green)   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

### Card

```tsx
// Basic
<Card>
  <p>Simple card content</p>
</Card>

// With Header & Footer
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="outlined">Outlined Card</Card>
<Card variant="elevated">Elevated Card</Card>

// Hover Effect
<Card hover>Clickable Card</Card>
```

**Visual Preview:**
```
┌──────────────────────────────┐
│ Card Title                   │
│ Card description text        │
├──────────────────────────────┤
│                              │
│ Main content goes here       │
│                              │
├──────────────────────────────┤
│              [Action Button] │
└──────────────────────────────┘
```

---

### Input

```tsx
// Basic
<Input placeholder="Enter text..." />

// With Label
<Input label="Email" type="email" />

// With Error
<Input 
  label="Password" 
  error="Password is required" 
/>

// With Helper Text
<Input 
  label="Username"
  helperText="Choose a unique username"
/>

// With Icons
<Input 
  leftIcon={<Search />}
  placeholder="Search..."
/>

<Input 
  leftIcon={<Mail />}
  rightIcon={<Check />}
  placeholder="Email"
/>

// Required
<Input label="Name" required />
```

**Visual Preview:**
```
Email *
┌────────────────────────────┐
│                            │
└────────────────────────────┘
Helper text appears here

Password *
┌────────────────────────────┐
│                            │
└────────────────────────────┘
⚠ Password is required

🔍 ┌────────────────────────┐
   │ Search...              │
   └────────────────────────┘
```

---

### Badge

```tsx
// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With Dot
<Badge dot variant="success">Active</Badge>
<Badge dot variant="warning">Pending</Badge>
<Badge dot variant="danger">Offline</Badge>
```

**Visual Preview:**
```
[Default] [Primary] [Success] [Warning] [Danger]
  Gray     Blue      Green     Orange     Red

● Active  ● Pending  ● Offline
  Green     Orange      Red
```

---

### Select

```tsx
<Select
  label="Item Type"
  placeholder="Choose type..."
  options={[
    { value: 'food', label: 'Food' },
    { value: 'cosmetic', label: 'Cosmetic' },
    { value: 'medicine', label: 'Medicine' },
  ]}
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
/>

// With Icon
<Select
  leftIcon={<Package />}
  options={options}
/>

// With Error
<Select
  label="Category"
  error="Please select a category"
  options={options}
/>
```

**Visual Preview:**
```
Item Type
┌──────────────────────────▼─┐
│ Choose type...             │
└────────────────────────────┘

(Expanded)
┌──────────────────────────▼─┐
│ Food                       │
│ Cosmetic                   │
│ Medicine                   │
└────────────────────────────┘
```

---

### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete Item"
  description="This action cannot be undone"
  footer={
    <>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
```

**Visual Preview:**
```
╔════════════════════════════════════╗
║ Delete Item                      × ║
║ This action cannot be undone       ║
╟────────────────────────────────────╢
║                                    ║
║ Are you sure you want to delete    ║
║ this item?                         ║
║                                    ║
╟────────────────────────────────────╢
║               [Cancel] [Delete]    ║
╚════════════════════════════════════╝
```

---

### Alert

```tsx
// Variants
<Alert variant="info">
  Information message
</Alert>

<Alert variant="success" title="Success!">
  Operation completed successfully
</Alert>

<Alert variant="warning" title="Warning">
  Please review this carefully
</Alert>

<Alert variant="danger" title="Error" onClose={handleClose}>
  Something went wrong
</Alert>
```

**Visual Preview:**
```
┌────────────────────────────────┐
│ ℹ️  Information message         │
└────────────────────────────────┘
  (Blue background)

┌────────────────────────────────┐
│ ✓ Success!                   × │
│   Operation completed          │
└────────────────────────────────┘
  (Green background)

┌────────────────────────────────┐
│ ⚠ Warning                    × │
│   Please review carefully      │
└────────────────────────────────┘
  (Orange background)

┌────────────────────────────────┐
│ ✕ Error                      × │
│   Something went wrong         │
└────────────────────────────────┘
  (Red background)
```

---

### Spinner

```tsx
// Sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />

// Variants
<Spinner variant="primary" />
<Spinner variant="secondary" />
<Spinner variant="white" />

// With Label
<Spinner size="lg" label="Loading..." />
```

**Visual Preview:**
```
  ⟳      ⟳      ⟳      ⟳
 Small  Medium  Large   XL

        ⟳
   Loading...
```

---

### EmptyState

```tsx
<EmptyState
  title="No items found"
  description="Add your first item to get started"
  action={{
    label: 'Add Item',
    onClick: handleAdd,
    icon: <Plus />,
  }}
/>
```

**Visual Preview:**
```
       📦
       
  No items found
  
  Add your first item
  to get started
  
  ┌─────────────┐
  │ + Add Item  │
  └─────────────┘
```

---

## 🎯 Feature Components

### ItemCard

```tsx
<ItemCard
  item={{
    id: '1',
    name: 'Milk',
    type: 'FOOD',
    quantity: 2,
    location: { id: '1', name: 'Refrigerator' },
    metadata: {
      expiry_date: '2024-12-31',
      purchase_date: '2024-12-01',
    },
  }}
/>
```

**Visual Preview:**
```
┌──────────────────────────┐
│  [Food Icon]       × 2   │
│                          │
│  Milk                    │
│                          │
│  [Tag] [Tag]             │
│                          │
│  📍 Refrigerator         │
│  📅 Added 1 day ago      │
│                          │
│  ● Fresh (D-30)          │
└──────────────────────────┘
```

---

### LocationTree

```tsx
<LocationTree
  location={{
    id: '1',
    name: 'Kitchen',
    level: 0,
    icon: '🏠',
    itemCount: 10,
    children: [
      {
        id: '2',
        name: 'Refrigerator',
        level: 1,
        icon: '❄️',
        itemCount: 7,
      },
    ],
  }}
  selectedId={selectedId}
  onSelect={handleSelect}
/>
```

**Visual Preview:**
```
▼ 🏠 Kitchen                [10]
  │
  ├─ ❄️ Refrigerator        [7]
  │  │
  │  ├─ Fridge Section     [4]
  │  └─ Freezer Section    [3]
  │
  └─ 🍽️ Cabinet             [3]
```

---

### ItemList

```tsx
<ItemList
  items={items}
  viewMode="grid"
  sortBy="name_asc"
  onViewModeChange={setViewMode}
  onSortChange={setSortBy}
/>
```

**Visual Preview:**
```
Total: 12 items          [Sort: Name ▼] [Grid] [List]

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Item 1  │ │ Item 2  │ │ Item 3  │ │ Item 4  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Item 5  │ │ Item 6  │ │ Item 7  │ │ Item 8  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

### LocationBreadcrumb

```tsx
<LocationBreadcrumb
  path={[
    { id: '1', name: 'Home', icon: '🏠' },
    { id: '2', name: 'Kitchen', icon: '🍳' },
    { id: '3', name: 'Refrigerator' },
  ]}
  onNavigate={handleNavigate}
/>
```

**Visual Preview:**
```
🏠 > 🍳 Kitchen > Refrigerator
     (clickable)   (current)
```

---

### ExpiryStatus

```tsx
<ExpiryStatus expiryDate="2024-12-31" />
```

**Visual Preview:**
```
● Fresh (D-30)      (Green badge)
● Expiring (D-3)    (Orange badge)
● Expired (0 days)  (Red badge)
```

---

### ItemFilter

```tsx
<ItemFilter
  onFilterChange={handleFilterChange}
  locationOptions={locations}
/>
```

**Visual Preview:**
```
┌────────────────────────────────┐
│ 🔍 Search...                   │
└────────────────────────────────┘  [Filter (2)]

(Expanded)
┌────────────────────────────────┐
│ Item Type                      │
│ [Food] [Cosmetic] [Medicine]   │
│                                │
│ Expiry Status                  │
│ [All ▼]                        │
│                                │
│ Location                       │
│ [All Locations ▼]              │
│                                │
│ [Clear Filters]                │
└────────────────────────────────┘
```

---

### QuickAddButton

```tsx
<QuickAddButton
  onAddItem={handleAddItem}
  onAddLocation={handleAddLocation}
/>
```

**Visual Preview:**
```
(Closed)              (Open)
    ┌───┐            Add Item    [📦]
    │ + │            Add Location [📍]
    └───┘                ┌───┐
                         │ + │
                         └───┘
                     (Floating bottom-right)
```

---

## 🏗️ Layout Components

### Header

```tsx
<Header
  title="DAITJI"
  onMenuClick={handleMenuClick}
  notificationCount={5}
/>
```

**Visual Preview:**
```
┌────────────────────────────────────────┐
│ ☰  DAITJI        🔔(5)  ⚙️  👤        │
└────────────────────────────────────────┘
```

---

### BottomNav

```tsx
<BottomNav />
```

**Visual Preview:**
```
┌──────┬──────┬──────┬──────┐
│ 🏠   │ 🔍   │ 📦   │ 📊   │
│ Home │Search│Items │Stats │
└──────┴──────┴──────┴──────┘
```

---

### PageHeader

```tsx
<PageHeader
  title="Item Management"
  description="View and manage your items"
  backHref="/"
  actions={<Button>Add</Button>}
/>
```

**Visual Preview:**
```
← Back

Item Management              [Add]
View and manage your items
```

---

## 🎭 State Examples

### Loading State
```tsx
{isLoading ? (
  <Spinner size="lg" label="Loading items..." />
) : (
  <ItemList items={items} />
)}
```

### Empty State
```tsx
{items.length === 0 ? (
  <EmptyState
    title="No items found"
    action={{ label: 'Add Item', onClick: handleAdd }}
  />
) : (
  <ItemList items={items} />
)}
```

### Error State
```tsx
{error && (
  <Alert variant="danger" onClose={() => setError(null)}>
    {error.message}
  </Alert>
)}
```

### Success State
```tsx
{success && (
  <Alert variant="success" title="Success!">
    Item saved successfully
  </Alert>
)}
```

---

## 🔄 Interactive States

### Button States
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Normal    │  │   Hover     │  │   Loading   │
└─────────────┘  └─────────────┘  └─────────────┘
                    (darker)         (spinner)

┌─────────────┐  ┌─────────────┐
│   Active    │  │  Disabled   │
└─────────────┘  └─────────────┘
   (pressed)        (faded)
```

### Input States
```
Normal:
┌────────────────────────────┐
│                            │
└────────────────────────────┘

Focus:
┌────────────────────────────┐ ← Blue ring
│ |                          │
└────────────────────────────┘

Error:
┌────────────────────────────┐ ← Red border
│                            │
└────────────────────────────┘
⚠ Error message
```

### Card States
```
Normal:            Hover:
┌──────────────┐   ┌──────────────┐
│              │   │              │ ← Shadow grows
│   Content    │   │   Content    │
│              │   │              │
└──────────────┘   └──────────────┘
```

---

## 🌈 Color Palette Visual

```
Primary (Blue):
████████ #0ea5e9
Actions, links, focus

Success (Green):
████████ #22c55e
Fresh items, success messages

Warning (Orange):
████████ #f59e0b
Expiring soon, warnings

Danger (Red):
████████ #ef4444
Expired items, errors, delete

Secondary (Gray):
████████ #64748b
Text, borders, backgrounds
```

---

## 📐 Spacing Scale

```
Gap/Padding Scale:
1  ▪         (4px)
2  ▪▪        (8px)
3  ▪▪▪       (12px)
4  ▪▪▪▪      (16px)
6  ▪▪▪▪▪▪    (24px)
8  ▪▪▪▪▪▪▪▪  (32px)
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px):
┌─────────────────┐
│    1 Column     │
└─────────────────┘

Tablet (640px - 1024px):
┌────────┬────────┐
│ 2 Cols │ 2 Cols │
└────────┴────────┘

Desktop (> 1024px):
┌────┬────┬────┬────┐
│ 4  │ 4  │ 4  │ 4  │
└────┴────┴────┴────┘
```

---

## 🎯 Usage Recommendations

### When to Use Each Component

#### Button
- Primary actions (Save, Submit)
- Secondary actions (Cancel)
- Destructive actions (Delete)

#### Card
- Content grouping
- Dashboard widgets
- List items

#### Input
- Forms
- Search bars
- Filters

#### Badge
- Status indicators
- Counts
- Labels

#### Modal
- Confirmations
- Forms
- Detail views

#### Alert
- Success messages
- Error messages
- Warnings
- Information

#### EmptyState
- No results
- Empty lists
- Onboarding

#### ItemCard
- Item display
- Product cards
- Content previews

---

이 쇼케이스를 참고하여 적절한 컴포넌트를 선택하고 사용하세요!
