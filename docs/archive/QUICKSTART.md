# DAITJI 빠른 시작 가이드 🚀

## 1단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 2단계: Supabase 설정

### A. Supabase 프로젝트 생성

1. https://supabase.com 방문
2. 새 프로젝트 생성
3. 프로젝트 URL과 anon key 복사

### B. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Supabase 정보 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### C. 데이터베이스 테이블 생성

Supabase SQL Editor에서 아래 SQL 실행:

```sql
-- 위치 테이블
create table locations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  parent_id uuid references locations(id),
  user_id uuid references auth.users(id) not null
);

-- 물건 테이블
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

-- RLS 정책 활성화
alter table locations enable row level security;
alter table items enable row level security;

-- 위치 테이블 정책
create policy "Users can manage their locations"
  on locations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 물건 테이블 정책
create policy "Users can manage their items"
  on items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 3단계: 기능 확인

### 홈페이지
- http://localhost:3000
- 프로젝트 소개 및 주요 기능 확인

### 대시보드
- http://localhost:3000/dashboard
- 물건 및 위치 통계 확인

### 탐색
- http://localhost:3000/explorer
- 물건 검색 기능

### 물건 추가
- http://localhost:3000/item/new
- 새 물건 등록 폼

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 타입 체크
npm run type-check

# 린트 실행
npm run lint
```

## 프로젝트 구조

```
app/
├── dashboard/         # 대시보드
├── explorer/          # 물건 탐색
├── item/[id]/        # 물건 상세/추가
└── api/              # API 라우트
    ├── items/
    └── locations/

components/
├── ui/               # 재사용 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
└── features/         # 기능별 컴포넌트
    ├── ItemCard.tsx
    └── LocationTree.tsx

lib/
├── supabase/         # Supabase 클라이언트
├── types/            # TypeScript 타입
└── utils/            # 유틸리티 함수
```

## 다음 단계

1. **인증 추가**: Supabase Auth를 사용한 사용자 인증 구현
2. **CRUD 구현**: API 라우트에 실제 Supabase 쿼리 추가
3. **이미지 업로드**: Supabase Storage를 사용한 물건 이미지 업로드
4. **알림 기능**: 유통기한/보증기간 만료 알림
5. **PWA 변환**: 모바일 앱처럼 사용할 수 있도록 PWA 설정

## 도움이 필요하신가요?

- 📖 [README-APP.md](README-APP.md) - 상세 문서
- 🔗 [Next.js 공식 문서](https://nextjs.org/docs)
- 🔗 [Supabase 공식 문서](https://supabase.com/docs)
- 🔗 [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 문제 해결

### 빌드 에러
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 타입 에러
```bash
# TypeScript 캐시 클리어
rm -rf .next
npm run type-check
```

### 환경 변수 오류
- `.env.local` 파일이 존재하는지 확인
- Supabase URL과 Key가 올바른지 확인
- 개발 서버 재시작 (Ctrl+C 후 npm run dev)
