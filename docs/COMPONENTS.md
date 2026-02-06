# DAITJI Component Library Documentation

## Overview

DAITJI의 UI 컴포넌트 라이브러리는 모던한 React 패턴, Tailwind CSS, 그리고 접근성을 중심으로 설계되었습니다. 모든 컴포넌트는 모바일 우선으로 제작되었으며, TypeScript로 완전한 타입 안전성을 제공합니다.

## 디자인 시스템

### 색상 테마
- **Primary (파랑)**: #0ea5e9 - 주요 액션 및 브랜딩
- **Success (초록)**: #22c55e - 신선한 상태, 성공 메시지
- **Warning (주황)**: #f59e0b - 임박 상태, 경고
- **Danger (빨강)**: #ef4444 - 만료 상태, 에러
- **Secondary (회색)**: #64748b - 보조 정보, 비활성 상태

### 타이포그래피
- **Font Family**: Geist Sans (기본), Geist Mono (코드)
- **Font Sizes**: sm (14px), md (16px), lg (18px), xl (20px)

### 간격 및 레이아웃
- **Spacing Scale**: 0.25rem (1), 0.5rem (2), 1rem (4), 1.5rem (6), 2rem (8)
- **Border Radius**: lg (0.5rem), xl (0.75rem), 2xl (1rem)

---

## Basic UI Components

### Button
다양한 variant와 size를 지원하는 버튼 컴포넌트.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'icon'
- `isLoading`: boolean - 로딩 상태 표시
- `loadingText`: string - 로딩 중 표시 텍스트
- `leftIcon`, `rightIcon`: ReactNode - 아이콘
- `fullWidth`: boolean - 전체 너비

**Usage:**
```tsx
import { Button } from '@/components/ui'
import { Plus } from 'lucide-react'

<Button variant="primary" leftIcon={<Plus />}>
  새로 추가
</Button>

<Button isLoading loadingText="저장 중...">
  저장
</Button>
```

### Card
컨텐츠를 그룹화하는 카드 컴포넌트.

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated'
- `hover`: boolean - 호버 효과
- `noPadding`: boolean - 패딩 제거

**Subcomponents:**
- `CardHeader` - 카드 헤더 (border-bottom 포함)
- `CardTitle` - 카드 제목
- `CardDescription` - 카드 설명
- `CardContent` - 카드 본문
- `CardFooter` - 카드 푸터 (border-top 포함)

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

<Card hover>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

### Input
에러 상태와 아이콘을 지원하는 입력 컴포넌트.

**Props:**
- `label`: string - 레이블
- `error`: string - 에러 메시지
- `helperText`: string - 도움말 텍스트
- `leftIcon`, `rightIcon`: ReactNode - 아이콘
- `fullWidth`: boolean - 전체 너비

**Usage:**
```tsx
import { Input } from '@/components/ui'
import { Search } from 'lucide-react'

<Input
  label="검색"
  placeholder="물품 이름 입력..."
  leftIcon={<Search />}
  error={errors.search}
/>
```

### Badge
상태나 레이블을 표시하는 배지 컴포넌트.

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean - 점 표시

**Usage:**
```tsx
import { Badge } from '@/components/ui'

<Badge variant="success" dot>
  신선
</Badge>

<Badge variant="danger" size="sm">
  만료
</Badge>
```

### Select
드롭다운 선택 컴포넌트.

**Props:**
- `options`: SelectOption[] - 선택 옵션
- `label`: string - 레이블
- `error`: string - 에러 메시지
- `placeholder`: string - 플레이스홀더
- `leftIcon`: ReactNode - 아이콘

**Usage:**
```tsx
import { Select } from '@/components/ui'

<Select
  label="물품 타입"
  placeholder="선택하세요"
  options={[
    { value: 'FOOD', label: '식품' },
    { value: 'COSMETIC', label: '화장품' },
  ]}
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
/>
```

### Modal
팝업 다이얼로그 컴포넌트.

**Props:**
- `isOpen`: boolean - 모달 표시 여부
- `onClose`: () => void - 닫기 핸들러
- `title`: string - 제목
- `description`: string - 설명
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean - 오버레이 클릭 시 닫기
- `closeOnEscape`: boolean - ESC 키로 닫기
- `footer`: ReactNode - 푸터 (버튼 등)

**Usage:**
```tsx
import { Modal, Button } from '@/components/ui'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="물품 삭제"
  description="정말 삭제하시겠습니까?"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        취소
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        삭제
      </Button>
    </>
  }
>
  <p>이 작업은 되돌릴 수 없습니다.</p>
</Modal>
```

### Alert
알림 메시지 컴포넌트.

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'danger'
- `title`: string - 제목
- `onClose`: () => void - 닫기 핸들러
- `icon`: ReactNode - 커스텀 아이콘

**Usage:**
```tsx
import { Alert } from '@/components/ui'

<Alert variant="success" title="저장 완료">
  물품이 성공적으로 저장되었습니다.
</Alert>

<Alert variant="warning" onClose={handleClose}>
  이 물품은 곧 만료됩니다.
</Alert>
```

### Spinner
로딩 인디케이터 컴포넌트.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'primary' | 'secondary' | 'white'
- `label`: string - 로딩 텍스트

**Usage:**
```tsx
import { Spinner } from '@/components/ui'

<Spinner size="lg" label="로딩 중..." />
```

### EmptyState
빈 상태 표시 컴포넌트.

**Props:**
- `icon`: ReactNode - 아이콘
- `title`: string - 제목
- `description`: string - 설명
- `action`: { label, onClick, icon } - 액션 버튼
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```tsx
import { EmptyState } from '@/components/ui'
import { Plus } from 'lucide-react'

<EmptyState
  title="물품이 없습니다"
  description="새로운 물품을 추가하여 관리를 시작하세요"
  action={{
    label: '물품 추가',
    onClick: handleAddItem,
    icon: <Plus />,
  }}
/>
```

---

## Feature Components

### ItemCard
물품 정보를 카드 형태로 표시하는 컴포넌트.

**Features:**
- 타입별 아이콘 및 색상 (식품, 화장품, 의약품, 일반)
- 유통기한 상태 배지 (신선, 임박, 만료)
- 이미지 표시 (placeholder 포함)
- 수량, 위치, 구매일 표시
- 클릭 이벤트 또는 Link 래퍼

**Usage:**
```tsx
import { ItemCard } from '@/components/features'

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

### LocationTree
계층형 위치 트리를 표시하는 컴포넌트.

**Features:**
- 접기/펴기 기능
- 선택 상태 표시
- 아이콘 및 색상 커스터마이징
- 물품 개수 배지
- 재귀적 렌더링

**Usage:**
```tsx
import { LocationTree } from '@/components/features'

<LocationTree
  location={{
    id: '1',
    name: '주방',
    level: 0,
    icon: '🏠',
    color: '#0ea5e9',
    itemCount: 5,
    children: [
      { id: '2', name: '냉장고', level: 1, itemCount: 3 },
    ],
  }}
  selectedId={selectedId}
  onSelect={(location) => setSelectedId(location.id)}
/>
```

### ItemList
물품 목록을 그리드/리스트 뷰로 표시하는 컴포넌트.

**Features:**
- 그리드/리스트 뷰 전환
- 정렬 옵션
- 빈 상태 처리
- 반응형 그리드

**Usage:**
```tsx
import { ItemList } from '@/components/features'

<ItemList
  items={items}
  viewMode="grid"
  onViewModeChange={setViewMode}
  sortBy="name_asc"
  onSortChange={setSortBy}
  emptyAction={{
    label: '물품 추가',
    onClick: handleAdd,
  }}
/>
```

### LocationBreadcrumb
위치 경로를 표시하는 breadcrumb 컴포넌트.

**Usage:**
```tsx
import { LocationBreadcrumb } from '@/components/features'

<LocationBreadcrumb
  path={[
    { id: '1', name: '주방', icon: '🏠' },
    { id: '2', name: '냉장고', icon: '❄️' },
    { id: '3', name: '냉장실' },
  ]}
  onNavigate={(id) => navigateToLocation(id)}
/>
```

### ExpiryStatus
유통기한 상태를 표시하는 컴포넌트.

**Features:**
- D-Day 계산
- 상태별 색상 (신선/임박/만료)
- 아이콘 표시
- 커스터마이징 가능

**Usage:**
```tsx
import { ExpiryStatus } from '@/components/features'

<ExpiryStatus
  expiryDate="2024-12-31"
  showIcon
  showDays
  size="md"
/>
```

### ItemFilter
물품 필터링 UI 컴포넌트.

**Features:**
- 검색
- 타입 필터 (식품, 화장품, 의약품, 일반)
- 유통기한 필터
- 위치 필터
- 고급 필터 토글

**Usage:**
```tsx
import { ItemFilter } from '@/components/features'

<ItemFilter
  onFilterChange={(filters) => setFilters(filters)}
  locationOptions={locationOptions}
  showLocationFilter
/>
```

### QuickAddButton
플로팅 액션 버튼 (FAB) 컴포넌트.

**Features:**
- 확장 가능한 메뉴
- 물품 추가 / 위치 추가
- 애니메이션 효과

**Usage:**
```tsx
import { QuickAddButton } from '@/components/features'

<QuickAddButton
  onAddItem={() => router.push('/items/new')}
  onAddLocation={() => router.push('/locations/new')}
/>
```

---

## Layout Components

### Header
앱 상단 헤더 컴포넌트.

**Features:**
- 메뉴 버튼 (모바일)
- 알림 배지
- 설정 및 프로필 링크
- Sticky positioning

**Usage:**
```tsx
import { Header } from '@/components/layout'

<Header
  title="DAITJI"
  onMenuClick={() => setMenuOpen(true)}
  notificationCount={5}
/>
```

### BottomNav
모바일 하단 네비게이션 컴포넌트.

**Features:**
- 현재 경로 하이라이트
- 아이콘 + 레이블
- Safe area 지원
- 터치 최적화

**Usage:**
```tsx
import { BottomNav } from '@/components/layout'

<BottomNav />
```

### PageHeader
페이지 헤더 컴포넌트.

**Features:**
- 뒤로 가기 버튼
- 제목 및 설명
- 액션 버튼 영역

**Usage:**
```tsx
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui'
import { Plus } from 'lucide-react'

<PageHeader
  title="물품 목록"
  description="등록된 물품을 관리합니다"
  backHref="/"
  actions={
    <Button leftIcon={<Plus />}>
      추가
    </Button>
  }
/>
```

---

## 아이콘 시스템

lucide-react 라이브러리 사용:

**타입별 아이콘:**
- `Apple` - 식품 (FOOD)
- `Sparkles` - 화장품 (COSMETIC)
- `Pill` - 의약품 (MEDICINE)
- `Package` - 일반 (GENERAL)

**공통 아이콘:**
- `MapPin` - 위치
- `Calendar` - 날짜
- `Clock` - 시간
- `Search` - 검색
- `Filter` - 필터
- `Plus` - 추가
- `X` - 닫기/삭제
- `ChevronDown/Up/Left/Right` - 방향
- `Folder/FolderOpen` - 폴더
- `Home` - 홈
- `Settings` - 설정
- `User` - 사용자
- `Bell` - 알림

---

## 접근성 (Accessibility)

모든 컴포넌트는 WCAG 2.1 AA 기준을 준수합니다:

- **Semantic HTML**: 적절한 HTML 요소 사용
- **ARIA Attributes**: aria-label, aria-describedby 등
- **Keyboard Navigation**: 키보드 접근 가능
- **Focus Management**: 포커스 상태 표시
- **Color Contrast**: 충분한 명암비
- **Touch Targets**: 최소 44x44px (모바일)

---

## 반응형 디자인

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**모바일 우선:**
- 기본 스타일은 모바일
- 더 큰 화면은 미디어 쿼리로 추가

---

## 애니메이션

Tailwind CSS 커스텀 애니메이션:

- `animate-fade-in` - 페이드 인 (0.3s)
- `animate-slide-up` - 위로 슬라이드 (0.3s)
- `animate-slide-down` - 아래로 슬라이드 (0.3s)
- `animate-spin` - 회전 (로딩)

---

## 개발 가이드

### 새 컴포넌트 추가

1. 컴포넌트 파일 생성 (예: `components/ui/NewComponent.tsx`)
2. TypeScript props 인터페이스 정의
3. forwardRef 사용 (필요시)
4. cn() 유틸로 className 병합
5. 접근성 속성 추가
6. index.ts에 export 추가

### 스타일 가이드

- Tailwind utility classes 사용
- 커스텀 CSS는 최소화
- 색상은 테마 변수 사용
- 간격은 Tailwind scale 사용

### 테스트

```tsx
// 컴포넌트 테스트 예시
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

---

## 참고 자료

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
