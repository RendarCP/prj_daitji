# React Query 캐싱 및 로딩 통합 작업 완료

## 작업 개요

페이지 전환 시마다 데이터를 다시 불러오는 문제를 해결하고, 중구난방이던 로딩 상태를 Skeleton으로 통일했습니다.

## 주요 변경사항

### 1. React Query 설정

- **패키지 설치**: `@tanstack/react-query` 설치 완료
- **Provider 설정**: `lib/providers/ReactQueryProvider.tsx` 생성
  - 기본 캐시 전략: 5분 staleTime, 10분 gcTime
  - 자동 refetch 비활성화로 불필요한 요청 방지
- **Layout 통합**: `app/layout.tsx`에 QueryClientProvider 추가

### 2. 커스텀 훅 생성

#### 대시보드 관련 (`lib/hooks/useDashboard.ts`)

- `useDashboardStats()`: 전체 통계 조회
- `useRecentItems()`: 최근 등록 물품 조회
- `useLocationSummary()`: 위치별 요약 정보 조회

#### 아이템 관련 (`lib/hooks/useItems.ts`)

- `useItems(params)`: 물품 목록 조회 (위치별 필터링 가능)
- `useExpiringItems()`: 만료 임박 물품 조회

#### 위치 관련 (`lib/hooks/useLocations.ts`)

- `useLocations(params)`: 위치 목록 조회 (트리 구조/하위 위치)
- `useLocationPath(locationId)`: 위치 경로 조회 (breadcrumb용)

### 3. 공통 타입 정의

`lib/types/index.ts` 생성:

- `Item`: 일반 물품 타입
- `ExpiringItem`: 만료 임박 물품 타입 (API 응답 구조)
- `Location`: 위치 타입
- `DashboardStats`: 대시보드 통계 타입

### 4. Skeleton 컴포넌트 통합

`components/ui/Skeleton.tsx` 생성:

- **기본 Skeleton**: 범용 사용
- **CardSkeleton**: 카드 레이아웃
- **ListItemSkeleton**: 리스트 아이템
- **StatCardSkeleton**: 통계 카드
- **LocationCardSkeleton**: 위치 카드
- **ExpiryItemSkeleton**: 만료 알림 아이템

### 5. 페이지별 적용

#### Dashboard (`app/dashboard/`)

- ✅ Server Component에서 Client Component로 데이터 페칭 이동
- ✅ React Query 훅으로 데이터 조회
- ✅ Skeleton 로딩 상태 적용
- ✅ 타입 안정성 개선

#### Explorer (`app/explorer/`)

- ✅ 위치 및 아이템 데이터 React Query로 전환
- ✅ Skeleton 로딩 상태 통일
- ✅ URL 파라미터 기반 상태 관리 유지

#### Items (`app/items/`)

- ✅ 새로 생성된 ItemsClient 컴포넌트
- ✅ React Query 기반 데이터 페칭
- ✅ Skeleton 로딩 상태

#### Item Add (`app/items/add/`)

- ✅ 위치 목록 React Query로 조회
- ✅ Server에서 Client로 데이터 페칭 이동
- ✅ 로딩 중 상태 처리

### 6. Loading 컴포넌트 통합

모든 페이지의 `loading.tsx`를 Skeleton 기반으로 교체:

- `app/dashboard/loading.tsx`
- `app/explorer/loading.tsx`
- `app/items/loading.tsx`
- `app/items/add/loading.tsx`
- `app/item/[id]/loading.tsx`

## 캐싱 전략

### Query Key 구조

```typescript
// Dashboard
["dashboard", "stats"][("items", "recent")][("items", "expiring")][
  ("locations", "summary")
][
  // Items
  ("items", { location_id: "...", filter: "..." })
][
  // Locations
  ("locations", { tree: true })
][("locations", { parent_id: "..." })][("location-path", locationId)];
```

### 캐싱 설정

- **staleTime**: 5분 (데이터가 "신선한" 상태로 유지되는 시간)
- **gcTime**: 10분 (캐시에서 제거되기 전 대기 시간)
- **refetchOnWindowFocus**: false (윈도우 포커스 시 자동 refetch 비활성화)
- **retry**: 1회 (에러 발생 시 재시도)

## 성능 개선 효과

### Before

- 페이지 전환마다 서버에서 데이터 재조회
- 동일한 데이터 중복 요청
- 느린 페이지 전환
- 일관성 없는 로딩 UI (Spinner 혼재)

### After

- ✅ 5분간 캐시된 데이터 재사용
- ✅ 중복 요청 제거
- ✅ 빠른 페이지 전환 (즉시 캐시된 데이터 표시)
- ✅ 통일된 Skeleton 로딩 UI
- ✅ 백그라운드 자동 갱신 (stale 상태일 때)

## 사용자 경험 개선

1. **즉각적인 반응**: 캐시된 데이터로 페이지 즉시 표시
2. **일관된 로딩**: 모든 페이지에서 동일한 Skeleton 패턴
3. **부드러운 전환**: 로딩 중에도 레이아웃 유지
4. **네트워크 절약**: 불필요한 요청 최소화

## 추가 개선 가능 사항

- [ ] Optimistic Updates (낙관적 업데이트)
- [ ] Infinite Query (무한 스크롤)
- [ ] Prefetching (페이지 사전 로딩)
- [ ] Mutation 훅 추가 (생성/수정/삭제)
- [ ] Error Boundary 통합

## 파일 변경 목록

```
생성:
- lib/providers/ReactQueryProvider.tsx
- lib/hooks/useDashboard.ts
- lib/hooks/useItems.ts
- lib/hooks/useLocations.ts
- lib/types/index.ts
- components/ui/Skeleton.tsx
- app/items/ItemsClient.tsx
- app/items/loading.tsx

수정:
- app/layout.tsx
- app/dashboard/page.tsx
- app/dashboard/DashboardClient.tsx
- app/dashboard/loading.tsx
- app/explorer/ExplorerClient.tsx
- app/explorer/loading.tsx
- app/items/add/page.tsx
- app/items/add/ItemAddClient.tsx
- app/items/add/loading.tsx
- app/item/[id]/loading.tsx
- components/ui/index.ts
- package.json
```

## 테스트 권장사항

1. 대시보드에서 Explorer로 이동 후 다시 대시보드로 돌아오기
2. 네트워크 탭에서 캐싱 확인 (동일 요청 중복 방지)
3. 로딩 상태 확인 (Skeleton 일관성)
4. 데이터 업데이트 후 자동 갱신 확인
