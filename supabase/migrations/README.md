# 🗄️ Supabase Migrations - DAITJI

Supabase 데이터베이스 마이그레이션 파일 모음입니다.

## 📁 파일 구조

```
supabase/migrations/
├── 001_initial_schema.sql      # 초기 스키마 생성 (테이블, 인덱스, 함수, 뷰)
├── 002_seed_sample_data.sql    # 샘플 데이터 (개발/테스트용)
└── README.md                   # 이 파일
```

## 🚀 마이그레이션 실행 방법

### 1️⃣ Supabase CLI 설치

```bash
# Homebrew (macOS)
brew install supabase/tap/supabase

# npm
npm install -g supabase

# Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2️⃣ Supabase 프로젝트 연결

```bash
# 프로젝트 초기화 (이미 완료된 경우 생략)
supabase init

# Supabase 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 프로젝트 레퍼런스 확인: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

### 3️⃣ 마이그레이션 실행

#### 방법 A: Supabase CLI로 실행 (권장)

```bash
# 로컬 개발 환경 시작
supabase start

# 마이그레이션 적용
supabase db push

# 또는 특정 마이그레이션만 실행
supabase migration up
```

#### 방법 B: SQL Editor에서 수동 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **SQL Editor** 메뉴 선택
3. 마이그레이션 파일 내용 복사 & 붙여넣기
4. **Run** 버튼 클릭

**실행 순서:**
1. `001_initial_schema.sql` (필수)
2. `002_seed_sample_data.sql` (선택)

### 4️⃣ 마이그레이션 확인

```bash
# 마이그레이션 상태 확인
supabase migration list

# 데이터베이스 스키마 확인
supabase db diff
```

## 📊 생성되는 데이터베이스 객체

### 테이블 (2개)
- `locations` - 계층형 위치 관리 (방 > 가구 > 칸 > 서랍 > 구역)
- `items` - 물품 정보 및 재고 관리

### 커스텀 타입 (2개)
- `item_type` - 물품 타입 (FOOD, COSMETIC, MEDICINE, GENERAL)
- `item_status` - 물품 상태 (ACTIVE, CONSUMED, EXPIRED, DISCARDED)

### 인덱스 (15개)
성능 최적화를 위한 인덱스:
- 텍스트 검색 (GIN 인덱스)
- 계층 구조 쿼리 (부모-자식 관계)
- 만료일 기반 쿼리 (D-Day 계산)
- 바코드 검색
- 태그 검색
- JSONB 메타데이터 검색

### 함수 (3개)
- `update_updated_at_column()` - updated_at 자동 갱신 트리거 함수
- `get_location_path(UUID)` - 위치 전체 경로 조회
- `get_expiring_items(INTEGER)` - 만료 임박 물품 조회

### 뷰 (2개)
- `v_active_items_with_location` - 활성 물품 + 위치 정보 + 만료 상태
- `v_location_item_counts` - 위치별 물품 수량 집계

### 트리거 (2개)
- `trg_locations_updated_at` - locations 테이블 updated_at 자동 갱신
- `trg_items_updated_at` - items 테이블 updated_at 자동 갱신

## 📝 샘플 데이터 구성

`002_seed_sample_data.sql` 실행 시 생성되는 샘플 데이터:

### 위치 (26개)
- **Level 1 (방)**: 주방, 거실, 욕실, 침실
- **Level 2 (가구)**: 냉장고, 식품 선반, TV 선반, 세면대 수납 등
- **Level 3 (칸)**: 냉장실, 냉동실, 야채칸, 상단/중단/하단 등

### 물품 (27개)
- **FOOD (13개)**: 우유, 김치, 계란, 삼겹살, 라면, 통조림 등
- **COSMETIC (4개)**: 토너, 선크림, 립스틱, 샴푸
- **MEDICINE (3개)**: 타이레놀, 소화제, 밴드
- **GENERAL (5개)**: 건전지, USB 케이블, 수건 등
- **상태 테스트용 (2개)**: 만료된 요구르트, 소진된 휴지

## 🔒 RLS (Row Level Security) 정책

**현재 단계 (1차 MVP):** RLS 비활성화
- `user_id` 컬럼은 NULL 허용
- 인증 없이 모든 사용자가 데이터 접근 가능

**2차 계획:** RLS 활성화
- `001_initial_schema.sql` 파일 내 주석 처리된 RLS 정책 활성화
- 사용자별 데이터 격리
- auth.users(id) 연동

## 🧪 테스트 쿼리

마이그레이션 실행 후 다음 쿼리로 데이터 확인:

```sql
-- 1. 활성 물품 목록 + 위치 정보
SELECT * FROM v_active_items_with_location
ORDER BY days_until_expiry ASC NULLS LAST
LIMIT 10;

-- 2. 위치별 물품 수량 집계
SELECT * FROM v_location_item_counts
ORDER BY expiring_soon_items DESC, active_items DESC;

-- 3. 만료 임박 물품 조회 (7일 이내)
SELECT * FROM get_expiring_items(7);

-- 4. 특정 위치의 전체 경로 조회
SELECT get_location_path('11111111-1111-3333-0001-000000000001'::UUID);
-- 결과: "주방 > 냉장고 > 냉장실"

-- 5. 물품 타입별 통계
SELECT 
  type,
  status,
  COUNT(*) AS count,
  SUM(quantity) AS total_quantity
FROM items
GROUP BY type, status
ORDER BY type, status;

-- 6. 계층 구조 확인 (Recursive CTE)
WITH RECURSIVE location_tree AS (
  -- Level 1: 방
  SELECT id, name, level, parent_id, name AS path
  FROM locations
  WHERE level = 1
  
  UNION ALL
  
  -- Level 2+: 하위 위치
  SELECT l.id, l.name, l.level, l.parent_id, lt.path || ' > ' || l.name
  FROM locations l
  INNER JOIN location_tree lt ON l.parent_id = lt.id
)
SELECT * FROM location_tree
ORDER BY path;
```

## 🔄 TypeScript 타입 생성

Supabase CLI를 사용하여 TypeScript 타입 자동 생성:

```bash
# TypeScript 타입 생성
supabase gen types typescript --local > lib/types/database.types.ts

# 또는 프로젝트 레퍼런스로 생성
supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/types/database.types.ts
```

생성된 타입은 `lib/types/database.types.ts`에 저장되며, 프론트엔드 코드에서 사용 가능합니다.

## 🛠️ 추가 마이그레이션 생성

새로운 마이그레이션 파일 생성:

```bash
# 새 마이그레이션 파일 생성
supabase migration new your_migration_name

# 예시: 위치 아이콘 변경
supabase migration new update_location_icons
```

## 📚 참고 자료

- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

## 🐛 문제 해결

### 마이그레이션 실패 시

```bash
# 로컬 데이터베이스 리셋
supabase db reset

# 마이그레이션 다시 적용
supabase migration up
```

### 타입 생성 오류 시

```bash
# Supabase CLI 업데이트
brew upgrade supabase

# 또는
npm update -g supabase
```

### RLS 정책 오류 시

현재 1차 MVP 단계에서는 RLS가 비활성화되어 있습니다. 2차 계획에서 인증 시스템 구축 후 활성화할 예정입니다.

---

**Last Updated:** 2026-02-02  
**Version:** 1.0.0  
**Stage:** 1차 MVP
