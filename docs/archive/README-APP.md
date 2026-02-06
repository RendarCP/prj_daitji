# DAITJI (다있지) 🏠

> 집안 물건의 위치와 수명을 관리하는 하이브리드 앱

## 프로젝트 소개

DAITJI는 집안의 모든 물건을 체계적으로 관리할 수 있는 웹 애플리케이션입니다. 물건의 위치를 기억하고, 수명을 추적하며, 필요한 물건을 빠르게 찾을 수 있도록 도와줍니다.

## 주요 기능

- 📦 **물건 관리**: 집안의 모든 물건을 카테고리별로 등록하고 관리
- 📍 **위치 추적**: 물건이 어디에 있는지 계층적으로 관리하고 빠르게 찾기
- ⏰ **수명 관리**: 구매일, 유통기한, 보증기간 추적 및 알림
- 🔍 **빠른 검색**: 이름, 카테고리, 위치로 물건 검색
- 📱 **모바일 최적화**: 반응형 디자인으로 모든 기기에서 사용 가능

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 시작하기

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- Supabase 계정 (무료 사용 가능)

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd prj-daitji
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 Supabase 설정을 입력합니다:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 내용:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 프로젝트 구조

```
prj-daitji/
├── app/                      # Next.js App Router 페이지
│   ├── dashboard/           # 대시보드 페이지
│   ├── explorer/            # 물건 탐색 페이지
│   ├── item/[id]/          # 물건 상세/추가 페이지
│   ├── api/                # API Routes
│   │   ├── items/         # 물건 API
│   │   └── locations/     # 위치 API
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 글로벌 스타일
├── components/             # React 컴포넌트
│   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── features/          # 기능별 컴포넌트
│       ├── ItemCard.tsx
│       └── LocationTree.tsx
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트
│   │   ├── client.ts    # 브라우저 클라이언트
│   │   └── server.ts    # 서버 클라이언트
│   ├── types/           # TypeScript 타입 정의
│   │   ├── database.types.ts
│   │   └── index.ts
│   └── utils/           # 유틸리티 함수
│       ├── cn.ts       # 클래스명 병합
│       └── format.ts   # 날짜 포맷팅
├── public/              # 정적 파일
├── supabase/           # Supabase 마이그레이션
└── ...config files     # 설정 파일들
```

## 스크립트

- `npm run dev` - 개발 서버 시작 (localhost:3000)
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행
- `npm run type-check` - TypeScript 타입 체크

## Supabase 설정

### 1. Supabase 프로젝트 생성

[Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.

### 2. 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 테이블을 생성합니다:

#### locations 테이블

```sql
create table locations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  parent_id uuid references locations(id),
  user_id uuid references auth.users(id) not null
);

-- RLS 정책 설정
alter table locations enable row level security;

create policy "Users can view their own locations"
  on locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own locations"
  on locations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own locations"
  on locations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on locations for delete
  using (auth.uid() = user_id);
```

#### items 테이블

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  category text,
  location_id uuid references locations(id),
  purchase_date date,
  expiry_date date,
  warranty_until date,
  notes text,
  image_url text,
  user_id uuid references auth.users(id) not null
);

-- RLS 정책 설정
alter table items enable row level security;

create policy "Users can view their own items"
  on items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on items for delete
  using (auth.uid() = user_id);
```

### 3. 환경 변수 설정

Supabase 프로젝트 설정에서 API URL과 anon key를 복사하여 `.env.local`에 추가합니다.

## 개발 가이드

### 새 페이지 추가

1. `app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 생성
3. 메타데이터 및 컴포넌트 구현

### 새 컴포넌트 추가

- **UI 컴포넌트**: `components/ui/`에 추가
- **기능 컴포넌트**: `components/features/`에 추가

### API 라우트 추가

1. `app/api/` 디렉토리에 새 폴더 생성
2. `route.ts` 파일 생성
3. HTTP 메서드 핸들러 구현 (GET, POST, PUT, DELETE)

## 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 기타 플랫�폼

Next.js는 다양한 플랫폼에 배포할 수 있습니다:
- Netlify
- AWS Amplify
- Docker

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참고하세요.

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 기여

기여는 언제나 환영합니다! 이슈를 등록하거나 Pull Request를 보내주세요.

## 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
