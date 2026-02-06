# ✅ Supabase 설정 완료

이 문서는 Supabase MCP를 통해 자동으로 설정된 내용을 요약합니다.

## 📋 설정 요약

### 프로젝트 정보

- **프로젝트 이름**: daitji
- **프로젝트 ID**: raqcqnoipwgbmdqcskhj
- **리전**: ap-northeast-2 (Seoul)
- **조직**: RendarCP's Org
- **상태**: ACTIVE_HEALTHY
- **생성일**: 2026-02-06

### 데이터베이스

- **PostgreSQL 버전**: 15.x
- **마이그레이션**: ✅ 적용 완료
- **스키마**: 
  - `locations` 테이블 (계층형 위치 관리)
  - `items` 테이블 (물품 정보)
  - 2개의 뷰 (v_active_items_with_location, v_location_item_counts)
  - 3개의 함수 (calculate_expiry_date, get_expiring_items, get_location_path)

### 환경 변수

`.env.local` 파일이 자동으로 생성되었습니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://raqcqnoipwgbmdqcskhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_U0mufezVqVtw-mccBk6kUg_6k0JxG-v
```

### TypeScript 타입

데이터베이스 타입이 자동으로 생성되었습니다:

- `lib/types/database.types.ts` - 전체 데이터베이스 타입 정의
- Supabase 클라이언트에 타입 적용 완료

## 🚀 다음 단계

### 1. 개발 서버 시작

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2. 데이터베이스 확인

Supabase Dashboard에서 데이터 확인:
https://supabase.com/dashboard/project/raqcqnoipwgbmdqcskhj

### 3. 샘플 데이터 추가 (선택)

```bash
# Supabase Dashboard > SQL Editor에서 실행
# 또는 API를 통해 데이터 추가
```

## 📊 데이터베이스 스키마

### locations 테이블

계층형 위치 관리 (최대 5단계):

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  user_id UUID,                    -- 2차 계획 시 활성화
  parent_id UUID,                  -- 상위 위치 참조
  name TEXT NOT NULL,
  level INTEGER NOT NULL,          -- 1=방, 2=가구, 3=칸, 4=서랍, 5=구역
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### items 테이블

물품 정보 및 재고 관리:

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,
  user_id UUID,                    -- 2차 계획 시 활성화
  location_id UUID NOT NULL,       -- locations 참조
  name TEXT NOT NULL,
  type item_type,                  -- FOOD, COSMETIC, MEDICINE, GENERAL
  status item_status,              -- ACTIVE, CONSUMED, EXPIRED, DISCARDED
  barcode TEXT,
  image_url TEXT,
  quantity INTEGER DEFAULT 1,
  metadata JSONB,                  -- expiry_date, opened_date, pao 등
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 주요 함수

#### calculate_expiry_date

물품 타입에 따라 만료일 자동 계산:

```sql
SELECT calculate_expiry_date('FOOD'::item_type, '{"expiry_date": "2026-12-31"}'::jsonb);
-- 결과: 2026-12-31
```

#### get_expiring_items

만료 임박 물품 조회:

```sql
SELECT * FROM get_expiring_items(7);  -- 7일 이내 만료 물품
```

#### get_location_path

위치의 전체 경로 반환:

```sql
SELECT get_location_path('uuid-here');
-- 결과: "주방 > 냉장고 > 야채칸"
```

## 🔧 유용한 명령어

### TypeScript 타입 재생성

데이터베이스 스키마 변경 후:

```bash
npm run db:types:remote
```

### 데이터베이스 상태 확인

```bash
# Supabase CLI 사용 (로컬 개발 시)
npm run db:status
```

## 📚 참고 문서

- [Supabase 빠른 시작](./QUICKSTART.md) - 상세 설정 가이드
- [API 문서](../docs/API.md) - API 엔드포인트 목록
- [프로젝트 기획서](../PROJECT.md) - 전체 프로젝트 계획

## 🔐 보안 참고사항

### 현재 (1차 MVP)

- RLS (Row Level Security) 비활성화
- 인증 없이 모든 데이터 접근 가능
- 개발/테스트 용도로만 사용

### 2차 계획

- Supabase Auth 활성화
- RLS 정책 적용
- 사용자별 데이터 격리

## ❓ 문제 해결

### 환경 변수 오류

```bash
Error: supabaseUrl is required
```

해결: `.env.local` 파일이 프로젝트 루트에 있는지 확인

### 타입 오류

```bash
Type 'Database' does not satisfy the constraint
```

해결: TypeScript 타입 재생성

```bash
npm run db:types:remote
```

### 연결 오류

```bash
Failed to fetch
```

해결: Supabase 프로젝트 상태 확인
https://supabase.com/dashboard/project/raqcqnoipwgbmdqcskhj

## 📞 지원

문제가 발생하면:

1. [Supabase Dashboard](https://supabase.com/dashboard/project/raqcqnoipwgbmdqcskhj) 확인
2. [GitHub Issues](https://github.com/your-username/prj-daitji/issues) 제보
3. [Supabase 문서](https://supabase.com/docs) 참조

---

**설정 완료일**: 2026-02-06  
**설정 방법**: Supabase MCP (자동)  
**상태**: ✅ 준비 완료
