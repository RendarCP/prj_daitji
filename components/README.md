# DAITJI Component Library

DAITJI 프로젝트의 공식 UI 컴포넌트 라이브러리입니다.

## 📚 빠른 시작

### 설치
모든 의존성이 이미 설치되어 있습니다 (lucide-react, clsx, tailwind-merge).

### Import
```tsx
// Basic UI
import { Button, Input, Card, Badge, Select, Modal, Alert } from '@/components/ui'

// Features
import { ItemCard, ItemList, LocationTree } from '@/components/features'

// Layout
import { Header, BottomNav, PageHeader } from '@/components/layout'
```

### 첫 번째 컴포넌트
```tsx
import { Button } from '@/components/ui'
import { Plus } from 'lucide-react'

export function MyComponent() {
  return (
    <Button variant="primary" leftIcon={<Plus />}>
      새로 추가
    </Button>
  )
}
```

## 📁 구조

```
components/
├── ui/                    # 기본 UI 컴포넌트 (9개)
│   ├── Button.tsx        # 버튼
│   ├── Card.tsx          # 카드
│   ├── Input.tsx         # 입력
│   ├── Badge.tsx         # 배지
│   ├── Select.tsx        # 선택
│   ├── Modal.tsx         # 모달
│   ├── Alert.tsx         # 알림
│   ├── Spinner.tsx       # 로딩
│   ├── EmptyState.tsx    # 빈 상태
│   └── index.ts          # Export
│
├── features/              # Feature 컴포넌트 (7개)
│   ├── ItemCard.tsx      # 물품 카드
│   ├── ItemList.tsx      # 물품 목록
│   ├── LocationTree.tsx  # 위치 트리
│   ├── LocationBreadcrumb.tsx  # 경로 표시
│   ├── ExpiryStatus.tsx  # 유통기한 상태
│   ├── ItemFilter.tsx    # 필터
│   ├── QuickAddButton.tsx # FAB
│   └── index.ts          # Export
│
└── layout/               # Layout 컴포넌트 (3개)
    ├── Header.tsx        # 헤더
    ├── BottomNav.tsx     # 하단 네비게이션
    ├── PageHeader.tsx    # 페이지 헤더
    └── index.ts          # Export
```

## 📖 문서

### 전체 문서
- **[COMPONENTS.md](../docs/COMPONENTS.md)** - 전체 컴포넌트 API 문서
- **[COMPONENT-EXAMPLES.md](../docs/COMPONENT-EXAMPLES.md)** - 실제 사용 예제
- **[COMPONENT-QUICK-REFERENCE.md](../docs/COMPONENT-QUICK-REFERENCE.md)** - 빠른 참조 가이드

### 요약 문서
- **[COMPONENT-LIBRARY-SUMMARY.md](../COMPONENT-LIBRARY-SUMMARY.md)** - 구축 요약

## 🎨 디자인 시스템

### 색상
- **Primary**: #0ea5e9 (파랑) - 주요 액션
- **Success**: #22c55e (초록) - 신선
- **Warning**: #f59e0b (주황) - 임박
- **Danger**: #ef4444 (빨강) - 만료
- **Secondary**: #64748b (회색) - 보조

### 타이포그래피
- **Font**: Geist Sans, Geist Mono
- **Sizes**: sm(14px), md(16px), lg(18px), xl(20px)

### 간격
- Tailwind spacing scale (0.25rem 단위)

## 🧩 컴포넌트 카테고리

### Basic UI (9개)
기본적인 UI 요소들

- `Button` - 버튼
- `Card` - 카드 컨테이너
- `Input` - 입력 필드
- `Badge` - 상태 배지
- `Select` - 드롭다운 선택
- `Modal` - 모달 다이얼로그
- `Alert` - 알림 메시지
- `Spinner` - 로딩 인디케이터
- `EmptyState` - 빈 상태 표시

### Features (7개)
도메인 특화 컴포넌트

- `ItemCard` - 물품 카드
- `ItemList` - 물품 목록 (그리드/리스트)
- `LocationTree` - 계층형 위치 트리
- `LocationBreadcrumb` - 위치 경로
- `ExpiryStatus` - 유통기한 상태
- `ItemFilter` - 필터 UI
- `QuickAddButton` - 플로팅 액션 버튼

### Layout (3개)
레이아웃 컴포넌트

- `Header` - 앱 헤더
- `BottomNav` - 하단 네비게이션 (모바일)
- `PageHeader` - 페이지 헤더

## 🔍 자주 사용하는 패턴

### 1. 폼 구성
```tsx
<Card>
  <CardHeader>
    <CardTitle>물품 등록</CardTitle>
  </CardHeader>
  <CardContent>
    <Input label="이름" required />
    <Select label="타입" options={[...]} />
    <Button type="submit">등록</Button>
  </CardContent>
</Card>
```

### 2. 목록 페이지
```tsx
<PageHeader title="물품 관리" />
<ItemFilter onFilterChange={handleFilter} />
<ItemList items={items} />
<QuickAddButton onAddItem={handleAdd} />
```

### 3. 모달 확인
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="삭제 확인"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>취소</Button>
      <Button variant="danger" onClick={handleDelete}>삭제</Button>
    </>
  }
>
  <Alert variant="warning">정말 삭제하시겠습니까?</Alert>
</Modal>
```

## ✨ 주요 특징

### 1. TypeScript 완전 지원
모든 컴포넌트가 타입 안전성 제공

### 2. 접근성 (A11y)
WCAG 2.1 AA 기준 준수

### 3. 반응형 디자인
모바일 우선, 모든 화면 크기 지원

### 4. 애니메이션
부드러운 트랜지션과 인터랙션

### 5. 커스터마이징
className prop으로 자유로운 스타일 확장

## 🎯 Examples

### Button 예제
```tsx
// Primary
<Button variant="primary">저장</Button>

// Loading
<Button isLoading>저장 중...</Button>

// With Icon
<Button leftIcon={<Plus />}>추가</Button>

// Full Width
<Button fullWidth>확인</Button>
```

### Card 예제
```tsx
<Card hover>
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

### ItemCard 예제
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
    },
  }}
/>
```

## 🔧 개발

### Type Check
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## 📱 반응형

모든 컴포넌트는 반응형으로 설계되었습니다.

### Breakpoints
- `sm`: 640px (모바일 가로)
- `md`: 768px (태블릿)
- `lg`: 1024px (데스크톱)
- `xl`: 1280px (대형 데스크톱)

### 예제
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

## 🎨 아이콘

lucide-react 사용:

### 타입별 아이콘
- `Apple` - 식품 (FOOD)
- `Sparkles` - 화장품 (COSMETIC)
- `Pill` - 의약품 (MEDICINE)
- `Package` - 일반 (GENERAL)

### 공통 아이콘
- `Plus` - 추가
- `X` - 닫기
- `Search` - 검색
- `Filter` - 필터
- `MapPin` - 위치
- `Calendar` - 날짜
- `Clock` - 시간

더 많은 아이콘: https://lucide.dev/icons

## 🔗 추가 리소스

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [lucide-react Icons](https://lucide.dev/icons)

## 💡 팁

1. **cn() 유틸 사용**: className 병합에 활용
2. **forwardRef**: ref를 전달할 때 사용
3. **aria-label**: 접근성을 위해 항상 추가
4. **memo**: 불필요한 리렌더링 방지

## ❓ FAQ

### Q: 커스텀 스타일을 추가하려면?
A: `className` prop을 사용하세요.
```tsx
<Button className="my-custom-class">버튼</Button>
```

### Q: 아이콘을 어떻게 사용하나요?
A: lucide-react에서 import하여 사용합니다.
```tsx
import { Plus } from 'lucide-react'
<Button leftIcon={<Plus />}>추가</Button>
```

### Q: 타입 에러가 발생합니다.
A: TypeScript props 인터페이스를 확인하세요.
```tsx
import type { ButtonProps } from '@/components/ui'
```

## 🚀 다음 단계

1. [전체 문서](../docs/COMPONENTS.md) 읽기
2. [예제](../docs/COMPONENT-EXAMPLES.md)로 학습
3. 실제 페이지에 적용
4. 피드백 및 개선

---

**버전**: 1.0.0
**최종 업데이트**: 2026-02-02
**컴포넌트 수**: 19개
