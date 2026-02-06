# DAITJI 프로젝트 구조

## 📁 디렉토리 구조

```
prj-daitji/
│
├── 📱 app/                          # Next.js App Router
│   ├── 🏠 page.tsx                  # 홈페이지
│   ├── 🎨 layout.tsx                # 루트 레이아웃
│   ├── 🌐 globals.css               # 글로벌 스타일
│   │
│   ├── 📊 dashboard/                # 대시보드
│   │   └── page.tsx                # 통계 및 최근 물건
│   │
│   ├── 🔍 explorer/                 # 물건 탐색
│   │   └── page.tsx                # 검색 및 필터
│   │
│   ├── 📦 item/                     # 물건 관리
│   │   └── [id]/                   # 동적 라우트
│   │       └── page.tsx            # 상세보기/추가/수정
│   │
│   └── 🔌 api/                      # API Routes
│       ├── items/                  # 물건 API
│       │   └── route.ts           # GET, POST
│       └── locations/              # 위치 API
│           └── route.ts           # GET, POST
│
├── 🧩 components/                   # React 컴포넌트
│   ├── ui/                         # 재사용 UI 컴포넌트
│   │   ├── Button.tsx             # 버튼 컴포넌트
│   │   ├── Card.tsx               # 카드 컴포넌트
│   │   └── Input.tsx              # 입력 컴포넌트
│   │
│   └── features/                   # 기능별 컴포넌트
│       ├── ItemCard.tsx           # 물건 카드
│       └── LocationTree.tsx       # 위치 트리
│
├── 📚 lib/                          # 유틸리티 & 설정
│   ├── supabase/                   # Supabase 클라이언트
│   │   ├── client.ts              # 브라우저 클라이언트
│   │   └── server.ts              # 서버 클라이언트
│   │
│   ├── types/                      # TypeScript 타입
│   │   ├── database.types.ts      # DB 타입
│   │   └── index.ts               # 앱 타입
│   │
│   └── utils/                      # 유틸리티 함수
│       ├── cn.ts                  # 클래스명 병합
│       └── format.ts              # 날짜 포맷팅
│
├── 🎨 public/                       # 정적 파일
│   └── favicon.ico
│
├── 🗄️ supabase/                    # Supabase 마이그레이션
│   └── migrations/                # SQL 마이그레이션 파일
│
├── ⚙️ 설정 파일
│   ├── next.config.js             # Next.js 설정
│   ├── tailwind.config.js         # Tailwind CSS 설정
│   ├── tsconfig.json              # TypeScript 설정
│   ├── postcss.config.js          # PostCSS 설정
│   ├── .eslintrc.json            # ESLint 설정
│   ├── .gitignore                # Git 제외 파일
│   ├── .env.local.example        # 환경 변수 템플릿
│   └── package.json              # 의존성 및 스크립트
│
└── 📖 문서
    ├── README-APP.md              # 프로젝트 상세 문서
    ├── QUICKSTART.md              # 빠른 시작 가이드
    └── PROJECT-STRUCTURE.md       # 이 문서
```

## 🎯 주요 페이지

### 홈페이지 (`/`)
- 프로젝트 소개
- 주요 기능 카드
- 통계 요약
- CTA 버튼

### 대시보드 (`/dashboard`)
- 전체 물건 수
- 저장 위치 수
- 다가오는 알림
- 최근 등록한 물건

### 탐색 (`/explorer`)
- 검색 바
- 필터 기능
- 물건 그리드/리스트
- 카테고리별 정렬

### 물건 상세 (`/item/[id]`)
- 물건 정보 보기
- 물건 수정
- 물건 삭제

### 물건 추가 (`/item/new`)
- 물건 등록 폼
- 이미지 업로드
- 카테고리 선택
- 위치 선택

## 🧩 컴포넌트 계층

```
RootLayout (app/layout.tsx)
│
├── Header (고정 헤더)
│   └── Logo + Navigation
│
├── Main Content (children)
│   │
│   ├── Page Components
│   │   ├── HomePage
│   │   ├── DashboardPage
│   │   ├── ExplorerPage
│   │   └── ItemDetailPage
│   │
│   └── Feature Components
│       ├── ItemCard
│       └── LocationTree
│
└── Footer (고정 푸터)
    └── Copyright
```

## 🎨 UI 컴포넌트

### Button
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Loading state 지원

### Card
- 기본 카드 스타일
- Hover 효과 옵션
- Header, Title, Description, Content, Footer

### Input
- Label 지원
- Error 상태
- Helper text
- Required 표시

## 🗄️ 데이터 모델

### Items (물건)
```typescript
{
  id: string
  name: string
  category?: string
  location?: Location
  purchaseDate?: Date
  expiryDate?: Date
  warrantyUntil?: Date
  notes?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### Locations (위치)
```typescript
{
  id: string
  name: string
  description?: string
  parent?: Location
  items?: Item[]
  createdAt: Date
  updatedAt: Date
}
```

## 🔌 API 엔드포인트

### Items API
- `GET /api/items` - 모든 물건 조회
- `POST /api/items` - 새 물건 생성
- `PUT /api/items/[id]` - 물건 수정 (TODO)
- `DELETE /api/items/[id]` - 물건 삭제 (TODO)

### Locations API
- `GET /api/locations` - 모든 위치 조회
- `POST /api/locations` - 새 위치 생성
- `PUT /api/locations/[id]` - 위치 수정 (TODO)
- `DELETE /api/locations/[id]` - 위치 삭제 (TODO)

## 🎨 디자인 시스템

### 컬러 팔레트

**Primary (파랑)**
- 50: #f0f9ff
- 500: #0ea5e9 (메인)
- 600: #0284c7 (호버)
- 900: #0c4a6e (진함)

**Secondary (회색)**
- 50: #f8fafc (배경)
- 500: #64748b (텍스트)
- 900: #0f172a (진한 텍스트)

**Status Colors**
- Success: #22c55e (성공/활성)
- Warning: #f59e0b (경고)
- Danger: #ef4444 (위험/오류)

### 타이포그래피
- 기본 폰트: Geist Sans
- 모노스페이스: Geist Mono
- 기본 크기: 16px
- 제목: 24px ~ 48px

### 간격 시스템
- 기본 간격: 4px 단위 (4, 8, 12, 16, 24, 32, 48, 64)
- 컨테이너 패딩: 16px (모바일), 32px (데스크톱)
- 카드 패딩: 24px
- 요소 간 간격: 16px

### 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px ~ 1024px
- Desktop: > 1024px

## 🔧 유틸리티 함수

### Date Formatting (`lib/utils/format.ts`)
- `formatDate()` - 날짜를 한국어 형식으로 포맷
- `formatRelativeDate()` - 상대 시간 (3일 전)
- `formatRelativeCalendar()` - 상대 캘린더 (어제 오후 2:30)
- `isExpired()` - 만료 여부 확인
- `isExpiringSoon()` - 곧 만료 여부 확인

### Class Name Merging (`lib/utils/cn.ts`)
- `cn()` - Tailwind 클래스를 병합하고 충돌 해결

## 🚀 다음 단계

### Phase 1: 핵심 기능
- [ ] Supabase Auth 통합
- [ ] CRUD API 구현
- [ ] 실시간 데이터 동기화

### Phase 2: 고급 기능
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 검색 및 필터링
- [ ] 알림 시스템

### Phase 3: UX 개선
- [ ] 로딩 스켈레톤
- [ ] 에러 핸들링
- [ ] 오프라인 지원 (PWA)

### Phase 4: 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 성능 모니터링

## 📝 코딩 컨벤션

### 파일명
- 컴포넌트: PascalCase (Button.tsx)
- 유틸: camelCase (format.ts)
- 페이지: camelCase (page.tsx)

### 컴포넌트
- 함수형 컴포넌트 사용
- Props 타입 정의
- forwardRef 사용 (UI 컴포넌트)

### 스타일
- Tailwind CSS 클래스 사용
- cn() 유틸로 조건부 스타일
- 커스텀 CSS는 globals.css에

### 타입
- 명시적 타입 정의
- interface 사용 (객체)
- type 사용 (유니온, 기본형)
