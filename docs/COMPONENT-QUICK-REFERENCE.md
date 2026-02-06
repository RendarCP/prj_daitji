# Component Quick Reference

빠른 참조를 위한 컴포넌트 치트시트

## Import 패턴

```tsx
// UI 컴포넌트
import { Button, Input, Card, Badge, Select, Modal, Alert, Spinner, EmptyState } from '@/components/ui'

// Feature 컴포넌트
import { ItemCard, LocationTree, ItemList, LocationBreadcrumb, ExpiryStatus, ItemFilter, QuickAddButton } from '@/components/features'

// Layout 컴포넌트
import { Header, BottomNav, PageHeader } from '@/components/layout'

// 아이콘
import { Apple, Sparkles, Pill, Package, Plus, X, Search } from 'lucide-react'

// 유틸리티
import { cn } from '@/lib/utils/cn'
import { formatDate, formatRelativeDate, isExpired, isExpiringSoon } from '@/lib/utils/format'
```

## 자주 쓰는 패턴

### 1. 기본 버튼들

```tsx
// Primary 버튼
<Button variant="primary">저장</Button>

// 로딩 버튼
<Button isLoading loadingText="저장 중...">저장</Button>

// 아이콘 버튼
<Button leftIcon={<Plus />}>추가</Button>

// 전체 너비
<Button fullWidth>확인</Button>
```

### 2. 입력 폼

```tsx
// 기본 입력
<Input label="이름" placeholder="입력..." />

// 에러 상태
<Input label="이메일" error="올바른 이메일을 입력하세요" />

// 아이콘 포함
<Input leftIcon={<Search />} placeholder="검색..." />

// 필수 입력
<Input label="이름" required />
```

### 3. 선택 박스

```tsx
<Select
  label="타입"
  placeholder="선택하세요"
  options={[
    { value: 'FOOD', label: '식품' },
    { value: 'COSMETIC', label: '화장품' },
  ]}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 4. 카드 구조

```tsx
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

### 5. 모달

```tsx
const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="제목"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>취소</Button>
      <Button onClick={handleConfirm}>확인</Button>
    </>
  }
>
  내용
</Modal>
```

### 6. 알림

```tsx
// 성공
<Alert variant="success" title="완료">작업이 완료되었습니다.</Alert>

// 경고
<Alert variant="warning">주의가 필요합니다.</Alert>

// 에러
<Alert variant="danger" onClose={handleClose}>오류가 발생했습니다.</Alert>
```

### 7. 배지

```tsx
// 기본
<Badge>레이블</Badge>

// 색상 variant
<Badge variant="success">신선</Badge>
<Badge variant="warning">임박</Badge>
<Badge variant="danger">만료</Badge>

// 점 표시
<Badge dot variant="success">활성</Badge>
```

### 8. 빈 상태

```tsx
<EmptyState
  title="물품이 없습니다"
  description="새로운 물품을 추가하세요"
  action={{
    label: '추가하기',
    onClick: handleAdd,
    icon: <Plus />,
  }}
/>
```

### 9. 로딩

```tsx
// 인라인 스피너
<Spinner size="md" />

// 레이블 포함
<Spinner size="lg" label="로딩 중..." />

// 전체 페이지 로딩
<div className="flex items-center justify-center min-h-screen">
  <Spinner size="xl" label="데이터를 불러오는 중..." />
</div>
```

### 10. 물품 카드

```tsx
<ItemCard
  item={{
    id: '1',
    name: '우유',
    type: 'FOOD',
    quantity: 2,
    location: { id: '1', name: '냉장고' },
    metadata: {
      expiry_date: '2024-12-31',
      purchase_date: '2024-12-01',
    },
  }}
/>
```

### 11. 위치 트리

```tsx
<LocationTree
  location={{
    id: '1',
    name: '주방',
    level: 0,
    icon: '🏠',
    itemCount: 10,
    children: [...],
  }}
  selectedId={selectedId}
  onSelect={(loc) => setSelectedId(loc.id)}
/>
```

### 12. 유통기한 상태

```tsx
<ExpiryStatus
  expiryDate="2024-12-31"
  showIcon
  showDays
  size="md"
/>
```

### 13. 필터

```tsx
<ItemFilter
  onFilterChange={(filters) => {
    console.log(filters)
    // { search, type, status, location, expiryFilter }
  }}
  locationOptions={locations}
/>
```

### 14. 페이지 헤더

```tsx
<PageHeader
  title="물품 관리"
  description="등록된 물품을 확인하세요"
  backHref="/"
  actions={
    <Button leftIcon={<Plus />}>추가</Button>
  }
/>
```

### 15. 플로팅 버튼

```tsx
<QuickAddButton
  onAddItem={() => router.push('/items/new')}
  onAddLocation={() => router.push('/locations/new')}
/>
```

## 스타일링 유틸리티

### cn() 사용법

```tsx
import { cn } from '@/lib/utils/cn'

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  anotherCondition ? 'true-class' : 'false-class',
  customClassName
)} />
```

### 조건부 스타일

```tsx
// 상태에 따른 색상
const statusColor = status === 'active' ? 'text-success-600' : 'text-secondary-600'

// variant 매핑
const variants = {
  primary: 'bg-primary-500 text-white',
  secondary: 'bg-secondary-200 text-secondary-900',
}

<div className={variants[variant]} />
```

## 반응형 패턴

```tsx
// 그리드 레이아웃
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// 숨기기/보이기
<div className="hidden md:block">데스크톱 전용</div>
<div className="md:hidden">모바일 전용</div>

// 조건부 패딩
<div className="px-4 md:px-6 lg:px-8">내용</div>
```

## 이벤트 핸들링

```tsx
// 폼 제출
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // 로직
}

// 버튼 클릭
<Button onClick={() => console.log('clicked')}>클릭</Button>

// 입력 변경
<Input onChange={(e) => setValue(e.target.value)} />

// 선택 변경
<Select onChange={(e) => setValue(e.target.value)} />
```

## 타입 정의

```tsx
// 물품 타입
type ItemType = 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL'

// 상태 타입
type ItemStatus = 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'DISCARDED'

// 필터 상태
interface FilterState {
  search: string
  type: string[]
  status: string[]
  location: string
  expiryFilter: string
}
```

## 에러 처리

```tsx
const [error, setError] = useState<string | null>(null)

try {
  await saveItem(data)
} catch (err) {
  setError('저장에 실패했습니다')
}

{error && (
  <Alert variant="danger" onClose={() => setError(null)}>
    {error}
  </Alert>
)}
```

## 로딩 상태

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSave = async () => {
  setIsLoading(true)
  try {
    await saveItem(data)
  } finally {
    setIsLoading(false)
  }
}

<Button isLoading={isLoading}>저장</Button>
```

## 접근성 속성

```tsx
// ARIA 레이블
<Button aria-label="닫기">
  <X />
</Button>

// 역할
<div role="dialog" aria-modal="true">
  모달 내용
</div>

// 설명
<Input
  aria-describedby="helper-text"
  aria-invalid={!!error}
/>
<span id="helper-text">도움말</span>
```

## 성능 최적화

```tsx
// 메모이제이션
import { memo } from 'react'

export const ItemCard = memo(({ item }) => {
  // 컴포넌트 로직
})

// useCallback
const handleClick = useCallback(() => {
  // 로직
}, [dependencies])

// useMemo
const filteredItems = useMemo(() => {
  return items.filter(item => /* 필터 조건 */)
}, [items, filterCondition])
```

## 디버깅 팁

```tsx
// 개발 모드에서만 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data)
}

// 에러 바운더리
<ErrorBoundary fallback={<ErrorMessage />}>
  <YourComponent />
</ErrorBoundary>
```

---

## 자주 하는 실수와 해결책

### 1. Key prop 누락
```tsx
// ❌ 잘못됨
{items.map(item => <ItemCard item={item} />)}

// ✅ 올바름
{items.map(item => <ItemCard key={item.id} item={item} />)}
```

### 2. 조건부 렌더링
```tsx
// ❌ 잘못됨 (0이 렌더링됨)
{items.length && <ItemList items={items} />}

// ✅ 올바름
{items.length > 0 && <ItemList items={items} />}
```

### 3. 이벤트 핸들러
```tsx
// ❌ 잘못됨 (즉시 실행)
<Button onClick={handleClick()}>클릭</Button>

// ✅ 올바름
<Button onClick={handleClick}>클릭</Button>
<Button onClick={() => handleClick(arg)}>클릭</Button>
```

### 4. 상태 업데이트
```tsx
// ❌ 잘못됨 (이전 상태 기반이 아님)
<Button onClick={() => setCount(count + 1)}>+</Button>

// ✅ 올바름
<Button onClick={() => setCount(prev => prev + 1)}>+</Button>
```

### 5. useEffect 의존성
```tsx
// ❌ 잘못됨 (의존성 누락)
useEffect(() => {
  fetchData(id)
}, [])

// ✅ 올바름
useEffect(() => {
  fetchData(id)
}, [id])
```
