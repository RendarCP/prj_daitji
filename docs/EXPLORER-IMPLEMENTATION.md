# Explorer 페이지 구현 완료

## 📋 구현 개요

Explorer 페이지는 사용자가 계층형 위치 구조를 탐색하고 물품을 검색/필터링할 수 있는 DAITJI의 핵심 페이지입니다.

## 🎯 구현된 기능

### 1. 위치 탐색 기능 ✅

#### LocationBreadcrumb
- 현재 위치 경로 표시 (예: "주방 > 냉장고 > 냉장실")
- 경로의 각 항목 클릭 시 해당 위치로 이동
- 홈 아이콘으로 최상위 위치 표시
- 반응형 디자인으로 모바일에서도 사용 가능

#### LocationTree
- 계층형 위치 트리 표시 (사이드바)
- 확장/축소 가능한 폴더 구조
- 위치 아이콘 및 색상 표시
- 물품 개수 뱃지 표시
- 선택된 위치 하이라이트
- 재귀적 렌더링으로 무제한 깊이 지원

#### 위치 선택 및 네비게이션
- 위치 클릭 시 해당 위치의 물품 표시
- URL 쿼리 파라미터로 현재 위치 관리 (`?location_id=xxx`)
- 브라우저 뒤로가기/앞으로가기 지원
- 초기 로딩 시 Level 1 (방) 위치 카드 표시

### 2. 물품 목록 표시 ✅

- **ItemList 컴포넌트 활용**
  - 그리드/리스트 뷰 전환
  - 물품 카드 표시
  - 빈 상태 처리
  
- **물품 클릭 시 상세 페이지 이동** (`/item/[id]`)

- **API 통합**
  - `GET /api/items?location_id={id}` - 위치별 물품 조회
  - `GET /api/locations?tree=true` - 위치 트리 구조 조회
  - `GET /api/locations/[id]/path` - 위치 경로 조회

### 3. 필터링 기능 ✅

#### ItemFilter 컴포넌트 활용
- **타입 필터**: FOOD, COSMETIC, MEDICINE, GENERAL
- **상태 필터**: ACTIVE, EXPIRED 등
- **검색**: 물품 이름, 태그로 검색
- **유통기한 필터**:
  - 전체
  - 신선 (7일 이상 남음)
  - 3일 이내 만료
  - 7일 이내 만료
  - 만료됨

#### 실시간 필터링
- 클라이언트 사이드에서 즉시 필터링 적용
- 여러 필터 조합 가능
- 활성화된 필터 개수 표시

### 4. 정렬 옵션 ✅

- 이름순 (가나다 순)
- 이름순 (역순)
- 최근 추가순
- 오래된 순
- 유통기한 임박순

### 5. 반응형 레이아웃 ✅

#### 데스크톱 (1024px 이상)
- 고정된 사이드바 (320px)
- 메인 콘텐츠 영역
- 2-column 레이아웃

#### 태블릿 (768px - 1023px)
- 토글 가능한 사이드바
- 1-column 메인 콘텐츠

#### 모바일 (767px 이하)
- 전체 화면 레이아웃
- 햄버거 메뉴로 사이드바 토글
- 오버레이 사이드바
- 터치 최적화된 UI

### 6. 추가 기능 ✅

- **QuickAddButton**: 플로팅 버튼으로 빠른 물품/위치 추가
- **로딩 상태**: Spinner 표시
- **에러 처리**: Alert 컴포넌트로 에러 메시지 표시
- **빈 상태**: 물품이 없을 때 안내 메시지
- **URL 상태 관리**: 쿼리 파라미터로 탐색 상태 유지

## 📁 파일 구조

```
app/explorer/
├── page.tsx              # 서버 컴포넌트 (메타데이터, Suspense)
├── ExplorerClient.tsx    # 클라이언트 컴포넌트 (메인 로직)
├── loading.tsx           # 로딩 스켈레톤 UI
└── error.tsx             # 에러 바운더리
```

## 🔌 API 엔드포인트

### 사용된 API

1. **GET /api/locations?tree=true**
   - 계층형 위치 트리 구조 조회
   - 응답: `{ success: true, data: Location[] }`

2. **GET /api/locations/[id]/path**
   - 위치의 전체 경로 조회 (루트부터 현재 위치까지)
   - 응답: `{ success: true, data: { path: Array<{id, name, icon}> } }`

3. **GET /api/items?location_id={id}**
   - 특정 위치의 물품 조회
   - 쿼리 파라미터:
     - `location_id`: 위치 UUID (선택사항)
     - `page`, `per_page`: 페이지네이션
     - `sort_by`, `sort_dir`: 정렬

## 🎨 컴포넌트 사용

### Layout 컴포넌트
- ❌ `Header` - 루트 레이아웃에서 제공
- ❌ `BottomNav` - 미구현 (추후 추가 예정)
- ✅ `PageHeader` - 페이지 제목 (직접 구현)

### Feature 컴포넌트
- ✅ `LocationBreadcrumb` - 위치 경로 표시
- ✅ `LocationTree` - 위치 트리
- ✅ `ItemList` - 물품 목록
- ✅ `ItemFilter` - 필터
- ✅ `QuickAddButton` - 빠른 추가 버튼

### UI 컴포넌트
- ✅ `Card` - 위치 카드
- ✅ `Button` - 액션 버튼
- ✅ `Spinner` - 로딩 인디케이터
- ✅ `Alert` - 에러 메시지
- ✅ `EmptyState` - 빈 상태

## 🚀 사용 방법

### 기본 탐색

1. 페이지 접속: `/explorer`
2. Level 1 위치 카드에서 원하는 위치 클릭
3. 사이드바의 위치 트리에서 하위 위치 탐색
4. 선택된 위치의 물품 목록 확인

### 필터링

1. "필터" 버튼 클릭
2. 원하는 필터 옵션 선택
3. 실시간으로 필터링된 결과 확인

### 검색

1. 검색 입력창에 물품 이름 또는 태그 입력
2. 실시간으로 검색 결과 확인

### 정렬

1. 정렬 드롭다운에서 원하는 정렬 옵션 선택
2. 즉시 정렬 적용

## 🔧 기술적 세부사항

### Next.js 14 App Router 활용

- **Server Component**: `page.tsx`에서 메타데이터 설정
- **Client Component**: `ExplorerClient.tsx`에서 상태 관리 및 인터랙션
- **Suspense Boundary**: 로딩 상태 처리
- **Error Boundary**: `error.tsx`로 에러 처리

### URL 상태 관리

```typescript
// useSearchParams로 현재 쿼리 파라미터 읽기
const searchParams = useSearchParams()
const locationId = searchParams.get('location_id')

// useRouter와 usePathname으로 URL 업데이트
const router = useRouter()
const pathname = usePathname()
router.push(`${pathname}?location_id=${id}`)
```

### 재귀적 위치 트리 렌더링

`LocationTree` 컴포넌트는 재귀적으로 자식 위치를 렌더링합니다:

```typescript
{isExpanded && hasChildren && (
  <div className="ml-6 mt-1 space-y-1">
    {location.children!.map((child) => (
      <LocationTree
        key={child.id}
        location={child}
        onSelect={onSelect}
        selectedId={selectedId}
        depth={depth + 1}
      />
    ))}
  </div>
)}
```

### 클라이언트 사이드 필터링

서버에서 가져온 데이터를 클라이언트에서 필터링:

```typescript
// 검색 필터
if (filters.search) {
  filtered = filtered.filter(item => 
    item.name.toLowerCase().includes(searchLower) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
  )
}

// 타입 필터
if (filters.type.length > 0) {
  filtered = filtered.filter(item => filters.type.includes(item.type))
}
```

## 📊 성능 최적화

1. **useCallback 훅**: 함수 재생성 방지
2. **조건부 렌더링**: 필요한 컴포넌트만 렌더링
3. **클라이언트 사이드 필터링**: 빠른 필터링 응답
4. **Suspense**: 점진적 로딩
5. **Loading States**: 사용자 경험 개선

## 🎯 향후 개선 사항

### 추가 기능
- [ ] 위치 생성/수정/삭제 모달
- [ ] 물품 추가 모달 (QuickAddButton 통합)
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 위치별 통계 표시
- [ ] 드래그 앤 드롭으로 물품 이동
- [ ] 즐겨찾기 위치

### 성능 개선
- [ ] 가상 스크롤링 (react-window)
- [ ] 위치 트리 메모이제이션
- [ ] 검색 디바운싱
- [ ] 이미지 레이지 로딩

### UX 개선
- [ ] 키보드 네비게이션
- [ ] 위치 검색 기능
- [ ] 최근 방문한 위치
- [ ] 브레드크럼 드롭다운 메뉴

## 🧪 테스트 시나리오

### 기본 탐색
1. ✅ 페이지 로딩 시 Level 1 위치 카드 표시
2. ✅ 위치 카드 클릭 시 해당 위치의 물품 표시
3. ✅ 사이드바에서 하위 위치 탐색
4. ✅ 브레드크럼에서 상위 위치로 이동

### 필터링 및 정렬
1. ✅ 타입 필터 적용
2. ✅ 검색어 입력
3. ✅ 유통기한 필터 적용
4. ✅ 여러 필터 조합
5. ✅ 정렬 옵션 변경

### 반응형
1. ✅ 데스크톱: 고정 사이드바
2. ✅ 태블릿: 토글 사이드바
3. ✅ 모바일: 오버레이 사이드바

### 에러 처리
1. ✅ API 에러 시 Alert 표시
2. ✅ 네트워크 오류 처리
3. ✅ 빈 상태 표시

## 📝 주요 코드 스니펫

### URL 쿼리 파라미터 관리

```typescript
const createQueryString = useCallback(
  (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  },
  [searchParams]
)

// 사용
router.push(`${pathname}?${createQueryString('location_id', locationId)}`)
```

### 위치 경로 조회

```typescript
const fetchLocationPath = useCallback(async (locationId: string) => {
  try {
    const response = await fetch(`/api/locations/${locationId}/path`)
    const result = await response.json()
    
    if (result.success && result.data?.path) {
      setBreadcrumbPath(result.data.path)
    }
  } catch (err) {
    console.error('Failed to fetch location path:', err)
  }
}, [])
```

### 반응형 사이드바

```typescript
<aside
  className={cn(
    'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-secondary-200 z-20',
    'transition-transform duration-300 lg:translate-x-0',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
    'w-80'
  )}
>
  {/* ... */}
</aside>
```

## 🎓 학습 포인트

이 구현에서 배울 수 있는 Next.js 14 App Router 패턴:

1. **Server/Client Component 분리**: 메타데이터와 로직 분리
2. **useSearchParams 활용**: URL 상태 관리
3. **Suspense Boundary**: 로딩 상태 처리
4. **Error Boundary**: 에러 처리
5. **재귀적 컴포넌트**: 무한 깊이 트리 구조
6. **반응형 디자인**: Tailwind CSS 활용
7. **API 통합**: fetch를 통한 데이터 로딩

## 📚 참고 자료

- [Next.js 14 App Router 문서](https://nextjs.org/docs/app)
- [useSearchParams 훅](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Suspense for Data Fetching](https://react.dev/reference/react/Suspense)
- [Tailwind CSS 반응형 디자인](https://tailwindcss.com/docs/responsive-design)

---

**구현 완료일**: 2026-02-02  
**구현자**: Claude Sonnet 4.5 (React Next.js Expert)  
**프로젝트**: DAITJI - 다있지
