# 헤더 리팩토링 완료

## 변경 사항

### 1. 공통 헤더 컴포넌트 개선
- **파일**: `components/layout/Header.tsx`
- **변경 내용**:
  - 모바일 우선 반응형 디자인으로 전면 개편
  - 참고 이미지의 그라데이션 배경 스타일 적용 (emerald-green)
  - 바코드 스캔 버튼 추가 (ScanBarcode 아이콘)
  - 알림 버튼 개선 (배지 포함)
  - 반응형 텍스트 크기 및 간격 조정

### 2. 레이아웃 구조 변경
- **파일**: `app/layout.tsx`
- **변경 내용**:
  - 기존 헤더/푸터 제거
  - 각 페이지에서 독립적으로 헤더 관리
  - 배경색을 `bg-secondary-50`으로 설정

### 3. 페이지별 헤더 적용

#### 대시보드 페이지
- **파일**: `app/dashboard/page.tsx`, `app/dashboard/DashboardClient.tsx`
- 서버 컴포넌트에서 `<Header />` 추가
- 클라이언트 컴포넌트에서 중복 헤더 제거

#### 탐색 페이지
- **파일**: `app/explorer/page.tsx`
- 서버 컴포넌트에서 `<Header />` 추가
- ExplorerClient는 자체 모바일 헤더 유지

#### 물품 추가 페이지
- **파일**: `app/item/add/page.tsx`, `app/item/add/ItemAddClient.tsx`
- 서버 컴포넌트에서 `<Header />` 추가
- 클라이언트 컴포넌트에서 중복 헤더 제거

#### 물품 상세 페이지
- **파일**: `app/item/[id]/page.tsx`, `app/item/[id]/ItemDetailClient.tsx`
- 서버 컴포넌트에서 `<Header />` 추가
- 클라이언트 컴포넌트에서 중복 헤더 제거

#### 홈 페이지
- **파일**: `app/page.tsx`
- `<Header />` 추가

### 4. 새로운 스캔 페이지 추가
- **파일**: `app/scan/page.tsx`, `app/scan/ScanClient.tsx`
- 바코드 스캔 기능을 위한 새 페이지 생성
- 헤더의 스캔 버튼 클릭 시 이동
- 향후 카메라 스캔 기능 구현 예정

## 디자인 특징

### 헤더 스타일
- **배경**: `gradient-to-br from-emerald-700 via-emerald-600 to-teal-600`
- **높이**: 
  - 모바일: `h-14` (56px)
  - 태블릿: `h-16` (64px)
  - 데스크톱: `h-18` (72px)
- **텍스트 색상**: 흰색 (`text-white`)
- **그림자**: `shadow-lg`
- **테두리**: `border-emerald-800/20`

### 반응형 디자인
- 아이콘 크기: 모바일 `w-5 h-5`, 태블릿 이상 `w-6 h-6`
- 텍스트 크기: 모바일 `text-lg`, 태블릿 `text-xl`, 데스크톱 `text-2xl`
- 간격: 모바일 `gap-1`, 태블릿 이상 `gap-2`

### 인터랙션
- 버튼 호버: `hover:bg-white/10`
- 로고 호버: `hover:scale-105`
- 부드러운 전환 효과: `transition-colors`, `transition-transform`

## 사용 방법

### 기본 사용
```tsx
import { Header } from '@/components/layout/Header'

export default function Page() {
  return (
    <>
      <Header />
      {/* 페이지 콘텐츠 */}
    </>
  )
}
```

### 커스터마이징
```tsx
<Header
  title="커스텀 타이틀"
  subtitle="커스텀 서브타이틀"
  showScan={false}
  showNotifications={true}
  notificationCount={5}
  onScanClick={() => console.log('스캔 클릭')}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | 'DAITJI' | 헤더 타이틀 |
| subtitle | string | '다있지' | 헤더 서브타이틀 |
| showScan | boolean | true | 스캔 버튼 표시 여부 |
| showNotifications | boolean | true | 알림 버튼 표시 여부 |
| notificationCount | number | 0 | 알림 개수 |
| onScanClick | () => void | - | 스캔 버튼 클릭 핸들러 |
| className | string | - | 추가 CSS 클래스 |

## 향후 개선 사항

1. **바코드 스캔 기능 구현**
   - 카메라 API 연동
   - 바코드 인식 라이브러리 통합
   - 스캔 결과 처리

2. **알림 기능 구현**
   - 알림 목록 페이지
   - 실시간 알림 업데이트
   - 알림 읽음 처리

3. **검색 기능 추가**
   - 헤더에 검색 바 추가 옵션
   - 전역 검색 기능

4. **사용자 프로필**
   - 사용자 아바타 표시
   - 프로필 드롭다운 메뉴
