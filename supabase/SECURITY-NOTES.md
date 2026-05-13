# 🔐 보안 참고사항

Supabase 프로젝트의 현재 보안 상태와 향후 계획입니다.

## ⚠️ 현재 상태 (1차 MVP)

### 개발/테스트 전용 설정

`2026-04-21` 기준으로 `supabase/migrations/007_enable_rls_and_secure_views.sql` 마이그레이션을 통해
`public.locations`, `public.items` RLS 및 주요 view 보안 속성을 프로덕션 기준으로 정리하도록 반영했습니다.
아직 원격 프로젝트에 이 마이그레이션을 적용하지 않았다면 Supabase Advisor에는 기존 경고가 계속 보일 수 있습니다.

현재 프로젝트는 **1차 MVP 단계**로, 다음과 같은 보안 제한사항이 있습니다:

#### 1. RLS (Row Level Security) 비활성화

```sql
-- 현재 상태
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
```

**영향**:
- 모든 사용자가 모든 데이터에 접근 가능
- 사용자 인증 없이 CRUD 작업 가능
- 프로덕션 배포에 부적합

**권장 사항**:
- ⚠️ 로컬 개발 환경에서만 사용
- ⚠️ 프로덕션 배포 전 RLS 활성화 필수

#### 2. 사용자 인증 미구현

```sql
-- user_id 컬럼이 NULL 허용
user_id UUID DEFAULT NULL
```

**영향**:
- 사용자 구분 없음
- 데이터 격리 불가능
- 다중 사용자 환경 미지원

#### 3. 보안 권고사항 (Supabase Advisor)

Supabase가 감지한 보안 이슈:

##### ERROR 레벨

1. **RLS Disabled in Public**
   - `locations` 테이블: RLS 비활성화
   - `items` 테이블: RLS 비활성화
   - 해결: 2차 계획에서 RLS 활성화

2. **Security Definer View**
   - `v_active_items_with_location`: SECURITY DEFINER 속성
   - `v_location_item_counts`: SECURITY DEFINER 속성
   - 해결: 뷰 재정의 또는 RLS 정책 적용

##### WARN 레벨

3. **Function Search Path Mutable**
   - `calculate_expiry_date`: search_path 미설정
   - `update_updated_at_column`: search_path 미설정
   - `get_location_path`: search_path 미설정
   - `get_expiring_items`: search_path 미설정
   - 해결: 함수에 `SET search_path = public` 추가

4. **Extension in Public**
   - `pg_trgm` 확장이 public 스키마에 설치됨
   - 해결: extensions 스키마로 이동

## ✅ 2차 계획: 보안 강화

### 1. Supabase Auth 활성화

```sql
-- user_id를 auth.users와 연결
ALTER TABLE locations 
  ADD CONSTRAINT fk_locations_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE items 
  ADD CONSTRAINT fk_items_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
```

### 2. RLS 정책 적용

```sql
-- RLS 활성화
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- locations 정책
CREATE POLICY "Users can view their own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- items 정책 (동일한 패턴)
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- ... (나머지 정책)
```

### 3. 함수 보안 강화

```sql
-- search_path 설정
CREATE OR REPLACE FUNCTION calculate_expiry_date(
  item_type item_type,
  metadata JSONB
)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- 함수 본문
END;
$$;
```

### 4. 확장 이동

```sql
-- extensions 스키마 생성
CREATE SCHEMA IF NOT EXISTS extensions;

-- pg_trgm 이동
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
```

## 🔒 프로덕션 배포 체크리스트

프로덕션 배포 전 반드시 확인:

- [ ] Supabase Auth 활성화
- [ ] RLS 정책 적용 및 테스트
- [ ] 함수 search_path 설정
- [ ] 확장 스키마 이동
- [ ] API 키 로테이션
- [ ] 환경 변수 보안 검증
- [ ] HTTPS 강제 적용
- [ ] CORS 정책 설정
- [ ] Rate Limiting 설정
- [ ] 백업 정책 수립

## 📚 참고 문서

### Supabase 보안 가이드

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Auth Policies](https://supabase.com/docs/guides/auth/auth-policies)

### 보안 권고사항 상세

각 이슈에 대한 자세한 내용:

1. **RLS Disabled**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
2. **Security Definer View**: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
3. **Function Search Path**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
4. **Extension in Public**: https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

## 🛡️ 현재 권장 사용 방법

### 개발 환경

```bash
# 로컬 개발 서버
npm run dev

# 로컬 네트워크에서만 접근
# http://localhost:3000
```

### 테스트 데이터

```sql
-- 테스트용 데이터만 사용
-- 실제 개인정보 입력 금지
-- 민감한 데이터 저장 금지
```

### 환경 변수

```bash
# .env.local 파일 보안
# - Git에 커밋하지 않기 (.gitignore에 포함됨)
# - 팀원과 공유 시 안전한 방법 사용 (1Password 등)
# - 프로덕션 키와 개발 키 분리
```

## ⚡ 빠른 보안 체크

현재 프로젝트의 보안 상태 확인:

```bash
# Supabase Dashboard에서 확인
# https://supabase.com/dashboard/project/YOUR_PROJECT_REF
# Settings > Database > Advisors
```

또는 API를 통해:

```bash
# 보안 권고사항 조회
curl -X GET \
  'https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/advisors?type=security' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## 📞 보안 문의

보안 관련 문제 발견 시:

1. **즉시 조치**: 프로덕션 배포 중단
2. **이슈 제보**: [GitHub Security Advisory](https://github.com/your-username/prj-daitji/security/advisories)
3. **Supabase 지원**: [Supabase Support](https://supabase.com/support)

---

**마지막 업데이트**: 2026-02-06  
**보안 레벨**: 개발/테스트 전용  
**프로덕션 준비**: ❌ 2차 계획 완료 후 가능
