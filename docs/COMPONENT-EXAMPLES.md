# Component Examples & Showcase

이 문서는 DAITJI 컴포넌트 라이브러리의 실제 사용 예제를 제공합니다.

## 1. 물품 등록 폼 예제

```tsx
'use client'

import { useState } from 'react'
import { Apple } from 'lucide-react'
import { 
  Input, 
  Select, 
  Button, 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Alert
} from '@/components/ui'

export function ItemForm() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    expiryDate: '',
  })
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 폼 검증 및 제출 로직
    setShowSuccess(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 물품 등록</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showSuccess && (
            <Alert 
              variant="success" 
              title="등록 완료"
              onClose={() => setShowSuccess(false)}
            >
              물품이 성공적으로 등록되었습니다.
            </Alert>
          )}

          <Input
            label="물품 이름"
            placeholder="예: 우유"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <Select
            label="물품 타입"
            placeholder="선택하세요"
            options={[
              { value: 'FOOD', label: '식품' },
              { value: 'COSMETIC', label: '화장품' },
              { value: 'MEDICINE', label: '의약품' },
              { value: 'GENERAL', label: '일반' },
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            leftIcon={<Apple className="w-4 h-4" />}
            required
          />

          <Input
            type="date"
            label="유통기한"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            helperText="물품의 유통기한을 입력하세요"
          />

          <CardFooter className="px-0">
            <Button variant="ghost" type="button">
              취소
            </Button>
            <Button variant="primary" type="submit" isLoading={false}>
              등록하기
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
```

## 2. 물품 목록 페이지 예제

```tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  ItemList,
  ItemFilter,
  QuickAddButton,
} from '@/components/features'
import {
  Header,
  BottomNav,
  PageHeader,
} from '@/components/layout'

export default function ItemsPage() {
  const [filters, setFilters] = useState({})
  const [viewMode, setViewMode] = useState('grid')

  // 샘플 데이터
  const items = [
    {
      id: '1',
      name: '우유',
      type: 'FOOD' as const,
      quantity: 2,
      location: { id: '1', name: '냉장고' },
      metadata: {
        expiry_date: '2024-12-31',
        purchase_date: '2024-12-01',
      },
    },
    // ... 더 많은 아이템
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <PageHeader
          title="물품 관리"
          description="등록된 물품을 확인하고 관리하세요"
        />

        <div className="space-y-6">
          <ItemFilter onFilterChange={setFilters} />
          
          <ItemList
            items={items}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            emptyAction={{
              label: '물품 추가',
              onClick: () => console.log('Add item'),
            }}
          />
        </div>
      </main>

      <QuickAddButton
        onAddItem={() => console.log('Add item')}
        onAddLocation={() => console.log('Add location')}
      />

      <BottomNav />
    </div>
  )
}
```

## 3. 대시보드 페이지 예제

```tsx
'use client'

import { Package, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@/components/ui'
import { ExpiryStatus } from '@/components/features'
import { Header, BottomNav, PageHeader } from '@/components/layout'

export default function DashboardPage() {
  const stats = {
    total_items: 45,
    active_items: 38,
    expiring_soon: 5,
    expired: 2,
  }

  const expiringItems = [
    {
      id: '1',
      name: '우유',
      type: 'FOOD',
      expiry_date: '2024-12-25',
      location_name: '냉장고',
    },
    // ... 더 많은 아이템
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <PageHeader
          title="대시보드"
          description="물품 현황을 한눈에 확인하세요"
        />

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">전체 물품</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.total_items}
                  </p>
                </div>
                <Package className="w-8 h-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">보관 중</p>
                  <p className="text-2xl font-bold text-success-600">
                    {stats.active_items}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">임박</p>
                  <p className="text-2xl font-bold text-warning-600">
                    {stats.expiring_soon}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">만료</p>
                  <p className="text-2xl font-bold text-danger-600">
                    {stats.expired}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-danger-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 만료 임박 물품 */}
        <Card>
          <CardHeader>
            <CardTitle>만료 임박 물품</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                      <span className="text-sm text-secondary-600">
                        {item.location_name}
                      </span>
                    </div>
                  </div>
                  <ExpiryStatus 
                    expiryDate={item.expiry_date}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
```

## 4. 위치 탐색 페이지 예제

```tsx
'use client'

import { useState } from 'react'
import { LocationTree, LocationBreadcrumb } from '@/components/features'
import { Header, BottomNav, PageHeader } from '@/components/layout'
import { Card } from '@/components/ui'

export default function ExplorerPage() {
  const [selectedId, setSelectedId] = useState<string>()
  const [path, setPath] = useState([
    { id: '1', name: '전체', icon: '🏠' },
  ])

  const locations = [
    {
      id: '1',
      name: '주방',
      level: 0,
      icon: '🏠',
      color: '#0ea5e9',
      itemCount: 12,
      children: [
        {
          id: '2',
          name: '냉장고',
          level: 1,
          icon: '❄️',
          itemCount: 8,
          children: [
            {
              id: '3',
              name: '냉장실',
              level: 2,
              itemCount: 5,
            },
            {
              id: '4',
              name: '냉동실',
              level: 2,
              itemCount: 3,
            },
          ],
        },
        {
          id: '5',
          name: '식기장',
          level: 1,
          icon: '🍽️',
          itemCount: 4,
        },
      ],
    },
    {
      id: '6',
      name: '욕실',
      level: 0,
      icon: '🚿',
      color: '#22c55e',
      itemCount: 7,
    },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <PageHeader
          title="위치 탐색"
          description="물품이 보관된 위치를 찾아보세요"
        />

        <Card>
          <LocationBreadcrumb
            path={path}
            onNavigate={(id) => {
              setSelectedId(id)
              // 경로 업데이트 로직
            }}
          />

          <div className="space-y-2 mt-4">
            {locations.map((location) => (
              <LocationTree
                key={location.id}
                location={location}
                selectedId={selectedId}
                onSelect={(location) => {
                  setSelectedId(location.id)
                  // 경로 업데이트
                }}
              />
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
```

## 5. 모달 사용 예제

```tsx
'use client'

import { useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { Button, Modal, Alert } from '@/components/ui'

export function DeleteItemModal({ itemName, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      setIsOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="danger"
        leftIcon={<Trash2 className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
      >
        삭제
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="물품 삭제"
        description="이 작업은 되돌릴 수 없습니다"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="삭제 중..."
            >
              삭제
            </Button>
          </>
        }
      >
        <Alert variant="warning" icon={<AlertCircle />}>
          <strong>{itemName}</strong>을(를) 정말 삭제하시겠습니까?
        </Alert>
      </Modal>
    </>
  )
}
```

## 6. 로딩 상태 예제

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Spinner, Card, CardContent } from '@/components/ui'
import { ItemList } from '@/components/features'

export function ItemListWithLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems().then((data) => {
      setItems(data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <Spinner size="lg" label="물품 목록을 불러오는 중..." />
        </CardContent>
      </Card>
    )
  }

  return <ItemList items={items} />
}
```

## 7. 복잡한 필터링 예제

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ItemFilter, ItemList } from '@/components/features'

export function FilteredItemList({ allItems }: Props) {
  const [filteredItems, setFilteredItems] = useState(allItems)

  const handleFilterChange = (filters) => {
    let result = [...allItems]

    // 검색
    if (filters.search) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // 타입 필터
    if (filters.type.length > 0) {
      result = result.filter(item => filters.type.includes(item.type))
    }

    // 유통기한 필터
    if (filters.expiryFilter !== 'all') {
      const now = new Date()
      result = result.filter(item => {
        if (!item.metadata?.expiry_date) return false
        
        const expiryDate = new Date(item.metadata.expiry_date)
        const daysUntil = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        switch (filters.expiryFilter) {
          case 'valid':
            return daysUntil > 7
          case 'expiring_3':
            return daysUntil > 0 && daysUntil <= 3
          case 'expiring_7':
            return daysUntil > 0 && daysUntil <= 7
          case 'expired':
            return daysUntil <= 0
          default:
            return true
        }
      })
    }

    setFilteredItems(result)
  }

  return (
    <div className="space-y-6">
      <ItemFilter onFilterChange={handleFilterChange} />
      <ItemList items={filteredItems} />
    </div>
  )
}
```

## 8. 반응형 레이아웃 예제

```tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Header, BottomNav } from '@/components/layout'
import { Button } from '@/components/ui'

export function ResponsiveLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-secondary-200 h-[calc(100vh-64px)] sticky top-16">
          {/* 사이드바 컨텐츠 */}
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 bg-white h-full">
              {/* 사이드바 컨텐츠 */}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
```

---

## 추가 팁

### 1. 컴포넌트 조합
컴포넌트들을 조합하여 더 복잡한 UI를 만들 수 있습니다.

### 2. 커스터마이징
모든 컴포넌트는 `className` prop으로 추가 스타일을 적용할 수 있습니다.

### 3. 타입 안전성
TypeScript를 활용하여 props 타입 체크를 받으세요.

### 4. 성능 최적화
- `React.memo`로 불필요한 리렌더링 방지
- 큰 리스트는 가상화 고려
- 이미지는 Next.js Image 컴포넌트 사용

### 5. 접근성
- 키보드 네비게이션 테스트
- 스크린 리더로 테스트
- 색상 대비 확인
