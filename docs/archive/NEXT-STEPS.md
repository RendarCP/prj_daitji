# 🚀 DAITJI 다음 단계 가이드

> Supabase 데이터베이스 마이그레이션이 완료되었습니다!  
> 이제 프론트엔드 연동 및 API 라우트 구현을 진행할 차례입니다.

---

## ✅ 완료된 작업 (2026-02-02)

### 데이터베이스 스키마
- ✅ `locations` 테이블 생성 (계층형 위치 관리)
- ✅ `items` 테이블 생성 (물품 정보)
- ✅ 15개 인덱스 (성능 최적화)
- ✅ 3개 함수 (경로 조회, 만료 임박 물품 조회)
- ✅ 2개 뷰 (활성 물품, 위치별 집계)
- ✅ 2개 트리거 (자동 updated_at 갱신)
- ✅ 샘플 데이터 (26개 위치, 27개 물품)

### 문서 및 스크립트
- ✅ 마이그레이션 파일 (001, 002)
- ✅ TypeScript 타입 생성 스크립트
- ✅ npm 스크립트 (8개 DB 관리 명령어)
- ✅ 문서 3개 (README, QUICKSTART, IMPLEMENTATION-REPORT)

---

## 🎯 즉시 실행 가능한 다음 단계

### 1단계: Supabase 프로젝트 설정 (5분)

```bash
# 1. Supabase 프로젝트 생성
# https://supabase.com/dashboard에서 New Project 클릭
# - Name: daitji-mvp
# - Region: Northeast Asia (Seoul)

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase URL과 Anon Key 입력

# 3. 마이그레이션 실행 (SQL Editor에서)
# - supabase/migrations/001_initial_schema.sql 복사 & 실행
# - supabase/migrations/002_seed_sample_data.sql 복사 & 실행
```

**상세 가이드**: `supabase/QUICKSTART.md` 참조

---

### 2단계: TypeScript 타입 생성 (2분)

```bash
# Supabase CLI 설치 (한 번만)
brew install supabase/tap/supabase

# 로컬 Supabase 시작
npm run db:start

# TypeScript 타입 생성
npm run db:types

# 생성된 파일 확인
cat lib/types/database.types.ts
```

---

### 3단계: API 라우트 테스트 (5분)

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 테스트
# http://localhost:3000/api/locations  (위치 목록)
# http://localhost:3000/api/items      (물품 목록)
```

**현재 상태 확인**:
```bash
# API 라우트 파일 확인
ls -la app/api/
# - items/route.ts ✅
# - locations/route.ts ✅
```

---

### 4단계: 프론트엔드 페이지 확인 (5분)

```bash
# 대시보드 페이지 확인
# http://localhost:3000/dashboard
# - 만료 임박 물품 리스트
# - 전체 재고 요약

# 탐색 페이지 확인
# http://localhost:3000/explorer
# - 계층형 위치 탐색
# - Breadcrumbs 네비게이션

# 물품 상세 페이지 확인
# http://localhost:3000/item/[id]
# - 물품 상세 정보
# - 수정/삭제 기능
```

---

## 📋 권장 작업 순서

### Phase 1: API 연동 테스트 (당일 완료 가능)

1. **API 라우트 동작 확인**
   - [ ] GET `/api/locations` - 위치 목록 조회
   - [ ] GET `/api/locations/[id]` - 특정 위치 조회
   - [ ] POST `/api/locations` - 위치 생성
   - [ ] PUT `/api/locations/[id]` - 위치 수정
   - [ ] DELETE `/api/locations/[id]` - 위치 삭제

2. **물품 API 동작 확인**
   - [ ] GET `/api/items` - 물품 목록 조회
   - [ ] GET `/api/items/[id]` - 특정 물품 조회
   - [ ] POST `/api/items` - 물품 생성
   - [ ] PUT `/api/items/[id]` - 물품 수정
   - [ ] DELETE `/api/items/[id]` - 물품 삭제

3. **특수 API 엔드포인트**
   - [ ] GET `/api/items/expiring` - 만료 임박 물품 조회
   - [ ] GET `/api/locations/[id]/items` - 특정 위치의 물품 조회
   - [ ] GET `/api/stats/dashboard` - 대시보드 통계

---

### Phase 2: 프론트엔드 컴포넌트 연동

1. **대시보드 페이지** (`app/dashboard/page.tsx`)
   - [ ] 만료 임박 물품 리스트 표시
   - [ ] 전체 재고 요약 카드
   - [ ] 상태별 물품 수 차트

2. **탐색 페이지** (`app/explorer/page.tsx`)
   - [ ] 계층형 위치 트리 컴포넌트
   - [ ] Breadcrumbs 네비게이션
   - [ ] 위치별 물품 리스트

3. **물품 상세 페이지** (`app/item/[id]/page.tsx`)
   - [ ] 물품 정보 표시
   - [ ] 수정 폼
   - [ ] 위치 이동 기능
   - [ ] 상태 변경 기능

---

### Phase 3: 기능 고도화

1. **검색 기능**
   - [ ] 물품명 텍스트 검색 (pg_trgm 인덱스 활용)
   - [ ] 태그 필터링
   - [ ] 위치 필터링
   - [ ] 타입/상태 필터링

2. **정렬 및 페이지네이션**
   - [ ] 만료일 기준 정렬
   - [ ] 이름 기준 정렬
   - [ ] 페이지네이션 (무한 스크롤 또는 페이지 번호)

3. **통계 및 차트**
   - [ ] 타입별 물품 수 파이 차트
   - [ ] 만료 임박 타임라인
   - [ ] 위치별 물품 분포 바 차트

---

## 🛠️ 개발 도구 활용

### npm 스크립트 활용

```bash
# 데이터베이스 관리
npm run db:start          # 로컬 Supabase 시작
npm run db:stop           # 로컬 Supabase 중지
npm run db:status         # 상태 확인
npm run db:reset          # 데이터베이스 리셋

# TypeScript 타입 관리
npm run db:types          # 로컬에서 타입 생성
npm run db:types:remote   # 원격에서 타입 생성

# 마이그레이션 관리
npm run db:migration:new my_migration  # 새 마이그레이션 생성
npm run db:migration:up                # 마이그레이션 적용

# 개발 서버
npm run dev               # Next.js 개발 서버
npm run type-check        # TypeScript 타입 체크
npm run lint              # ESLint 실행
```

---

## 📚 유용한 SQL 쿼리

### 개발 중 자주 사용할 쿼리

```sql
-- 1. 만료 임박 물품 확인 (7일 이내)
SELECT * FROM get_expiring_items(7);

-- 2. 활성 물품 + 위치 정보
SELECT 
  item_name,
  location_path,
  expiry_status,
  days_until_expiry
FROM v_active_items_with_location
ORDER BY days_until_expiry ASC NULLS LAST
LIMIT 10;

-- 3. 위치별 물품 수량
SELECT * FROM v_location_item_counts
WHERE total_items > 0
ORDER BY expiring_soon_items DESC;

-- 4. 특정 위치의 전체 경로
SELECT get_location_path('11111111-1111-3333-0001-000000000001'::UUID);

-- 5. 물품 타입별 통계
SELECT 
  type,
  COUNT(*) AS count,
  SUM(quantity) AS total_quantity
FROM items
WHERE status = 'ACTIVE'
GROUP BY type;

-- 6. 계층 구조 확인 (Recursive CTE)
WITH RECURSIVE location_tree AS (
  SELECT id, name, level, parent_id, name AS path
  FROM locations
  WHERE level = 1
  UNION ALL
  SELECT l.id, l.name, l.level, l.parent_id, lt.path || ' > ' || l.name
  FROM locations l
  INNER JOIN location_tree lt ON l.parent_id = lt.id
)
SELECT * FROM location_tree ORDER BY path;
```

---

## 🐛 문제 해결 체크리스트

### Supabase 연결 오류
- [ ] `.env.local` 파일이 존재하는가?
- [ ] `NEXT_PUBLIC_SUPABASE_URL`이 올바른가?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른가?
- [ ] Supabase 프로젝트가 활성 상태인가?

### 마이그레이션 오류
- [ ] 순서대로 실행했는가? (001 → 002)
- [ ] SQL 문법 오류가 없는가?
- [ ] PostgreSQL 버전이 호환되는가? (14+)

### TypeScript 타입 오류
- [ ] `npm run db:types`를 실행했는가?
- [ ] `lib/types/database.types.ts` 파일이 존재하는가?
- [ ] 타입 import 경로가 올바른가?

### API 응답 오류
- [ ] 브라우저 콘솔에서 네트워크 오류를 확인했는가?
- [ ] Supabase Dashboard > Logs에서 오류를 확인했는가?
- [ ] RLS 정책이 비활성화되어 있는가? (1차 MVP)

---

## 📖 참고 문서

### 프로젝트 문서
- [`PROJECT.md`](./PROJECT.md) - 전체 프로젝트 기획서
- [`PROJECT-STRUCTURE.md`](./PROJECT-STRUCTURE.md) - 프로젝트 구조
- [`SETUP-COMPLETE.md`](./SETUP-COMPLETE.md) - 초기 설정 완료 가이드

### Supabase 문서
- [`supabase/QUICKSTART.md`](./supabase/QUICKSTART.md) - 빠른 시작 가이드
- [`supabase/IMPLEMENTATION-REPORT.md`](./supabase/IMPLEMENTATION-REPORT.md) - 구현 완료 보고서
- [`supabase/migrations/README.md`](./supabase/migrations/README.md) - 마이그레이션 상세 가이드

### 외부 문서
- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

## 🎯 목표 및 마일스톤

### 1차 MVP 목표 (현재 단계)
- ✅ 데이터베이스 스키마 완성
- ⏳ API 라우트 구현 및 테스트
- ⏳ 프론트엔드 페이지 연동
- ⏳ 기본 CRUD 기능 완성
- ⏳ 만료 임박 알림 UI 구현

### 2차 계획 (인증 시스템)
- [ ] RLS 정책 활성화
- [ ] 구글/카카오 OAuth 연동
- [ ] 사용자별 데이터 격리
- [ ] 위치 시스템 고도화

### 3차 계획 (AI 스캐너)
- [ ] 바코드 스캔 기능
- [ ] OCR 유통기한 인식
- [ ] AI 레시피 추천

---

## 💡 추천 작업 흐름

**첫 개발 세션 (2-3시간)**
1. ✅ Supabase 프로젝트 생성 및 마이그레이션 (15분)
2. ✅ 환경 변수 설정 및 타입 생성 (10분)
3. ⏳ API 라우트 동작 확인 (30분)
4. ⏳ 대시보드 페이지 연동 (1시간)
5. ⏳ 탐색 페이지 연동 (1시간)

**두 번째 세션 (2-3시간)**
1. ⏳ 물품 생성/수정 폼 구현
2. ⏳ 위치 생성/수정 기능
3. ⏳ 검색 및 필터링 기능
4. ⏳ 통계 차트 구현

---

## ✨ 완료 시 체크리스트

- [ ] `/dashboard` 페이지에서 샘플 데이터가 표시됨
- [ ] 만료 임박 물품이 D-Day와 함께 표시됨
- [ ] `/explorer` 페이지에서 계층 구조 탐색 가능
- [ ] 물품 생성/수정/삭제 기능 동작
- [ ] 위치 생성/수정/삭제 기능 동작
- [ ] 텍스트 검색이 정상 동작
- [ ] TypeScript 타입 오류 없음
- [ ] ESLint 오류 없음

---

**현재 위치**: ✅ Phase 1 완료 (데이터베이스 스키마)  
**다음 목표**: ⏳ Phase 2 (API 연동 및 프론트엔드)

**시작하세요!** 🚀

```bash
npm run dev
# http://localhost:3000
```
