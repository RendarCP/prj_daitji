-- ============================================================================
-- DAITJI Database Migration v1.0 - Initial Schema
-- ============================================================================
-- Description: 계층형 위치 관리 및 물품 재고 시스템
-- Stage: 1차 MVP (인증 없이 기본 CRUD 기능)
-- Created: 2026-02-02
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 텍스트 검색 성능 향상

-- ============================================================================
-- 2. CUSTOM TYPES
-- ============================================================================

-- 물품 타입 ENUM
CREATE TYPE item_type AS ENUM (
  'FOOD',       -- 식품 (유통기한 기준)
  'COSMETIC',   -- 화장품 (개봉일 + PAO 기준)
  'MEDICINE',   -- 의약품 (유효기한 기준)
  'GENERAL'     -- 일반 물품 (만료일 없음)
);

-- 물품 상태 ENUM
CREATE TYPE item_status AS ENUM (
  'ACTIVE',     -- 사용 가능
  'CONSUMED',   -- 소진됨
  'EXPIRED',    -- 만료됨
  'DISCARDED'   -- 폐기됨
);

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1. locations (계층형 위치 관리)
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 2차 계획: 사용자 인증 시스템 연동 (현재는 NULL 허용)
  user_id UUID DEFAULT NULL, -- REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 계층 구조 (최대 5단계)
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  
  -- 시각적 속성
  icon TEXT,          -- 아이콘 이름 (예: 'home', 'refrigerator', 'drawer')
  color TEXT,         -- HEX 컬러 코드 (예: '#FF6B6B')
  
  -- 정렬 및 메타데이터
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 계층 유효성 검증: level 1은 parent_id가 NULL이어야 함
  CONSTRAINT valid_level_hierarchy CHECK (
    (level = 1 AND parent_id IS NULL) OR
    (level > 1 AND parent_id IS NOT NULL)
  )
);

-- 설명: locations 테이블 주석
COMMENT ON TABLE locations IS '계층형 위치 관리 시스템 (방 > 가구 > 칸 > 서랍 > 구역)';
COMMENT ON COLUMN locations.level IS '1=방, 2=가구, 3=칸, 4=서랍, 5=구역';
COMMENT ON COLUMN locations.user_id IS '2차 계획에서 활성화 예정 (현재 NULL 허용)';

-- ----------------------------------------------------------------------------
-- 3.2. items (물품 정보)
-- ----------------------------------------------------------------------------
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 2차 계획: 사용자 인증 시스템 연동 (현재는 NULL 허용)
  user_id UUID DEFAULT NULL, -- REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 위치 정보 (필수)
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  
  -- 기본 정보
  name TEXT NOT NULL,
  type item_type NOT NULL DEFAULT 'GENERAL',
  status item_status NOT NULL DEFAULT 'ACTIVE',
  
  -- 식별 정보
  barcode TEXT,       -- 바코드 번호 (3차 계획: Open Food Facts 연동)
  image_url TEXT,     -- 물품 이미지 URL
  
  -- 수량 및 메타데이터
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  /*
    metadata 필드 예시:
    {
      "expiry_date": "2026-12-31",      -- 유통기한 (FOOD, MEDICINE)
      "opened_date": "2026-01-15",      -- 개봉일 (COSMETIC)
      "pao": 12,                         -- Period After Opening (개월, COSMETIC)
      "purchase_date": "2026-01-01",    -- 구매일
      "purchase_price": 15000,          -- 구매가격
      "brand": "Brand Name",            -- 브랜드
      "notes": "냉장보관 필수"          -- 메모
    }
  */
  
  -- 태그 (검색 및 분류용)
  tags TEXT[] DEFAULT '{}',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- -------------------------------------------------------------------------
  -- 계산된 만료일 컬럼 (자동 계산)
  -- -------------------------------------------------------------------------
  computed_expiry_date DATE GENERATED ALWAYS AS (
    CASE
      -- 식품/의약품: metadata.expiry_date 사용
      WHEN type IN ('FOOD', 'MEDICINE') THEN 
        (metadata->>'expiry_date')::DATE
      
      -- 화장품: 개봉일 + PAO(개월) 계산
      WHEN type = 'COSMETIC' AND metadata->>'opened_date' IS NOT NULL THEN
        (
          (metadata->>'opened_date')::DATE + 
          (COALESCE((metadata->>'pao')::INTEGER, 12) || ' months')::INTERVAL
        )::DATE
      
      -- 일반 물품: NULL
      ELSE NULL
    END
  ) STORED
);

-- 설명: items 테이블 주석
COMMENT ON TABLE items IS '물품 정보 및 재고 관리';
COMMENT ON COLUMN items.computed_expiry_date IS '타입별 자동 계산된 만료일 (FOOD/MEDICINE: expiry_date, COSMETIC: opened_date + pao)';
COMMENT ON COLUMN items.user_id IS '2차 계획에서 활성화 예정 (현재 NULL 허용)';

-- ============================================================================
-- 4. INDEXES (성능 최적화)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1. locations 인덱스
-- ----------------------------------------------------------------------------
CREATE INDEX idx_locations_user_id ON locations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_locations_parent_id ON locations(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_locations_level ON locations(level);
CREATE INDEX idx_locations_sort_order ON locations(sort_order);

-- 계층 구조 쿼리 최적화 (user + parent 복합)
CREATE INDEX idx_locations_user_parent ON locations(user_id, parent_id) WHERE user_id IS NOT NULL;

-- 텍스트 검색 최적화 (GIN 인덱스)
CREATE INDEX idx_locations_name_trgm ON locations USING gin(name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 4.2. items 인덱스
-- ----------------------------------------------------------------------------
CREATE INDEX idx_items_user_id ON items(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_items_location_id ON items(location_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_type ON items(type);

-- 만료일 기반 쿼리 최적화 (D-Day 계산용)
CREATE INDEX idx_items_expiry_date ON items(computed_expiry_date) 
  WHERE computed_expiry_date IS NOT NULL AND status = 'ACTIVE';

-- 바코드 검색 최적화
CREATE INDEX idx_items_barcode ON items(barcode) WHERE barcode IS NOT NULL;

-- 태그 검색 최적화 (GIN 인덱스)
CREATE INDEX idx_items_tags ON items USING gin(tags);

-- JSONB 메타데이터 검색 최적화
CREATE INDEX idx_items_metadata ON items USING gin(metadata);

-- 텍스트 검색 최적화
CREATE INDEX idx_items_name_trgm ON items USING gin(name gin_trgm_ops);

-- 복합 인덱스: 유저별 활성 물품 + 만료일 정렬
CREATE INDEX idx_items_user_status_expiry ON items(user_id, status, computed_expiry_date) 
  WHERE user_id IS NOT NULL AND status = 'ACTIVE';

-- ============================================================================
-- 5. TRIGGERS (자동 업데이트)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1. updated_at 자동 갱신 함수
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 5.2. locations 테이블 트리거
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5.3. items 테이블 트리거
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) - 2차 계획용 (주석 처리)
-- ============================================================================

/*
-- 2차 계획: 사용자 인증 시스템 활성화 시 주석 해제

-- ----------------------------------------------------------------------------
-- 6.1. RLS 활성화
-- ----------------------------------------------------------------------------
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6.2. locations RLS 정책
-- ----------------------------------------------------------------------------

-- 사용자는 자신의 위치만 조회 가능
CREATE POLICY "Users can view their own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 위치만 생성 가능
CREATE POLICY "Users can create their own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 위치만 수정 가능
CREATE POLICY "Users can update their own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 위치만 삭제 가능
CREATE POLICY "Users can delete their own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6.3. items RLS 정책
-- ----------------------------------------------------------------------------

-- 사용자는 자신의 물품만 조회 가능
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 물품만 생성 가능
CREATE POLICY "Users can create their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 물품만 수정 가능
CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 물품만 삭제 가능
CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
*/

-- ============================================================================
-- 7. HELPER FUNCTIONS (유틸리티 함수)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1. 계층 구조 전체 경로 조회 함수
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_location_path(location_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_id UUID := location_uuid;
  current_name TEXT;
  current_parent UUID;
BEGIN
  LOOP
    SELECT name, parent_id INTO current_name, current_parent
    FROM locations
    WHERE id = current_id;
    
    EXIT WHEN current_name IS NULL;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' > ' || path;
    END IF;
    
    EXIT WHEN current_parent IS NULL;
    current_id := current_parent;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_location_path IS '위치의 전체 경로를 반환 (예: "주방 > 냉장고 > 야채칸")';

-- ----------------------------------------------------------------------------
-- 7.2. 만료 임박 물품 조회 함수 (D-Day 계산)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_expiring_items(days_threshold INTEGER DEFAULT 7)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_type item_type,
  expiry_date DATE,
  days_until_expiry INTEGER,
  location_path TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id AS item_id,
    i.name AS item_name,
    i.type AS item_type,
    i.computed_expiry_date AS expiry_date,
    (i.computed_expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
    get_location_path(i.location_id) AS location_path
  FROM items i
  WHERE 
    i.status = 'ACTIVE'
    AND i.computed_expiry_date IS NOT NULL
    AND i.computed_expiry_date <= CURRENT_DATE + days_threshold
  ORDER BY i.computed_expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_expiring_items IS '만료 임박 물품 조회 (기본: 7일 이내)';

-- ============================================================================
-- 8. VIEWS (자주 사용하는 쿼리)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8.1. 활성 물품 + 위치 정보 뷰
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_items_with_location AS
SELECT 
  i.id,
  i.name AS item_name,
  i.type,
  i.status,
  i.quantity,
  i.barcode,
  i.image_url,
  i.tags,
  i.metadata,
  i.computed_expiry_date,
  CASE 
    WHEN i.computed_expiry_date IS NULL THEN NULL
    WHEN i.computed_expiry_date < CURRENT_DATE THEN '만료'
    WHEN i.computed_expiry_date <= CURRENT_DATE + 3 THEN '긴급'
    WHEN i.computed_expiry_date <= CURRENT_DATE + 7 THEN '임박'
    ELSE '신선'
  END AS expiry_status,
  (i.computed_expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
  l.id AS location_id,
  l.name AS location_name,
  l.level AS location_level,
  get_location_path(l.id) AS location_path,
  i.created_at,
  i.updated_at
FROM items i
LEFT JOIN locations l ON i.location_id = l.id
WHERE i.status = 'ACTIVE';

COMMENT ON VIEW v_active_items_with_location IS '활성 물품 목록 + 위치 정보 + 만료 상태';

-- ----------------------------------------------------------------------------
-- 8.2. 위치별 물품 수량 집계 뷰
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_location_item_counts AS
SELECT 
  l.id AS location_id,
  l.name AS location_name,
  l.level,
  get_location_path(l.id) AS location_path,
  COUNT(i.id) AS total_items,
  COUNT(i.id) FILTER (WHERE i.status = 'ACTIVE') AS active_items,
  COUNT(i.id) FILTER (
    WHERE i.status = 'ACTIVE' 
    AND i.computed_expiry_date IS NOT NULL
    AND i.computed_expiry_date <= CURRENT_DATE + 7
  ) AS expiring_soon_items
FROM locations l
LEFT JOIN items i ON i.location_id = l.id
GROUP BY l.id, l.name, l.level;

COMMENT ON VIEW v_location_item_counts IS '위치별 물품 수량 집계 (전체/활성/만료임박)';

-- ============================================================================
-- 9. INITIAL DATA VALIDATION
-- ============================================================================

-- 스키마 생성 확인 로그
DO $$
BEGIN
  RAISE NOTICE '✅ DAITJI Database Schema v1.0 initialized successfully';
  RAISE NOTICE '📊 Tables created: locations, items';
  RAISE NOTICE '🔍 Indexes: 15 indexes created for performance optimization';
  RAISE NOTICE '⚡ Triggers: updated_at auto-update enabled';
  RAISE NOTICE '🔒 RLS: Disabled (Stage 1 MVP - will be enabled in Stage 2)';
  RAISE NOTICE '📝 Helper Functions: get_location_path, get_expiring_items';
  RAISE NOTICE '👁️ Views: v_active_items_with_location, v_location_item_counts';
END $$;
