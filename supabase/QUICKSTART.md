# 🚀 Supabase 데이터베이스 빠른 시작 가이드

DAITJI 프로젝트의 Supabase 데이터베이스를 빠르게 설정하는 가이드입니다.

## ⚡ 빠른 시작 (5분 설정)

### 1️⃣ Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속 및 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `daitji-mvp` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자용)
4. **Create new project** 클릭 (약 2분 소요)

### 2️⃣ 환경 변수 설정

1. 프로젝트 대시보드에서 **Settings** > **API** 메뉴 이동
2. `.env.local` 파일 생성 (프로젝트 루트):

```bash
cp .env.local.example .env.local
```

3. `.env.local` 파일에 다음 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

> **찾는 방법:**
> - `URL`: Project Settings > API > Project URL
> - `anon key`: Project Settings > API > Project API keys > `anon` `public`

### 3️⃣ 마이그레이션 실행

#### 방법 A: SQL Editor에서 실행 (가장 간단)

1. Supabase Dashboard > **SQL Editor** 메뉴
2. 다음 파일 내용을 순서대로 복사 & 실행:
   - `supabase/migrations/001_initial_schema.sql` (필수)
   - `supabase/migrations/002_seed_sample_data.sql` (선택)

#### 방법 B: CLI로 실행 (권장)

```bash
# Supabase CLI 설치 (한 번만 실행)
brew install supabase/tap/supabase  # macOS
# 또는
npm install -g supabase             # npm

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

### 4️⃣ TypeScript 타입 생성

```bash
# 로컬에서 실행 (Supabase CLI 필요)
npm run db:types

# 또는 원격 프로젝트에서 직접 생성
npm run db:types:remote
```

### 5️⃣ 확인

1. Supabase Dashboard > **Table Editor** 메뉴
2. 생성된 테이블 확인:
   - `locations` (26개 샘플 위치)
   - `items` (27개 샘플 물품)

```sql
-- SQL Editor에서 실행하여 데이터 확인
SELECT * FROM v_active_items_with_location LIMIT 10;
SELECT * FROM get_expiring_items(7);
```

## 📋 유용한 npm 스크립트

```bash
# TypeScript 타입 생성
npm run db:types            # 로컬 Supabase에서 생성
npm run db:types:remote     # 원격 프로젝트에서 생성

# 마이그레이션 관리
npm run db:migration:new my_migration  # 새 마이그레이션 생성
npm run db:migration:up                # 마이그레이션 적용

# 로컬 Supabase 관리
npm run db:start            # 로컬 Supabase 시작
npm run db:stop             # 로컬 Supabase 중지
npm run db:status           # 상태 확인
npm run db:reset            # 데이터베이스 리셋
```

## 🧪 테스트 쿼리

마이그레이션 완료 후 SQL Editor에서 실행하여 데이터 확인:

```sql
-- 1. 만료 임박 물품 확인 (7일 이내)
SELECT * FROM get_expiring_items(7);

-- 2. 활성 물품 목록 + 위치 정보
SELECT 
  item_name,
  location_path,
  expiry_status,
  days_until_expiry
FROM v_active_items_with_location
ORDER BY days_until_expiry ASC NULLS LAST
LIMIT 10;

-- 3. 위치별 물품 수량
SELECT 
  location_name,
  location_path,
  total_items,
  active_items,
  expiring_soon_items
FROM v_location_item_counts
WHERE total_items > 0
ORDER BY expiring_soon_items DESC;

-- 4. 계층 구조 확인
SELECT 
  id,
  name,
  level,
  get_location_path(id) AS full_path
FROM locations
ORDER BY level, sort_order;

-- 5. 물품 타입별 통계
SELECT 
  type,
  COUNT(*) AS count,
  SUM(quantity) AS total_quantity
FROM items
WHERE status = 'ACTIVE'
GROUP BY type
ORDER BY count DESC;
```

## 🔍 데이터 구조 확인

### 생성된 객체 목록

```sql
-- 테이블 목록
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 함수 목록
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 뷰 목록
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 인덱스 목록
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY indexname;
```

## ⚙️ 프로젝트 레퍼런스 찾기

프로젝트 레퍼런스는 다음 위치에서 확인:

1. **Supabase Dashboard URL**:
   ```
   https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]
                                          ^^^^^^^^^^^^^^^^^
   ```

2. **Project Settings > General > Reference ID**

3. **API URL**:
   ```
   https://[YOUR_PROJECT_REF].supabase.co
           ^^^^^^^^^^^^^^^^^
   ```

## 🐛 문제 해결

### "Project not found" 오류

```bash
# 프로젝트 재연결
supabase link --project-ref YOUR_PROJECT_REF
```

### "Database connection failed" 오류

1. Supabase Dashboard에서 프로젝트가 활성 상태인지 확인
2. 데이터베이스 비밀번호가 올바른지 확인
3. 방화벽/VPN 설정 확인

### 타입 생성 실패

```bash
# Supabase CLI 업데이트
brew upgrade supabase

# 수동 타입 생성
supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/types/database.types.ts
```

### 샘플 데이터 삭제 후 재생성

```sql
-- SQL Editor에서 실행
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE locations CASCADE;

-- 그 다음 002_seed_sample_data.sql 재실행
```

## 📚 다음 단계

1. **프론트엔드 연동 테스트**:
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 접속

2. **API 라우트 테스트**:
   - `/api/locations` - 위치 목록 조회
   - `/api/items` - 물품 목록 조회

3. **대시보드 확인**:
   - `/dashboard` - 만료 임박 물품 확인
   - `/explorer` - 계층형 위치 탐색

## 🔗 참고 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase CLI 가이드](https://supabase.com/docs/guides/cli)
- [PostgreSQL 함수 문서](https://www.postgresql.org/docs/current/functions.html)
- [DAITJI 프로젝트 구조](../PROJECT-STRUCTURE.md)

---

**문제가 계속 발생하면:**
- [Supabase Discord](https://discord.supabase.com) 커뮤니티 문의
- [GitHub Issues](https://github.com/supabase/supabase/issues) 검색
