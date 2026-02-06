-- ============================================================================
-- DAITJI Database Seed Data - Sample Data for Development
-- ============================================================================
-- Description: 개발 및 테스트를 위한 샘플 데이터
-- Stage: 1차 MVP (인증 없이 샘플 데이터 제공)
-- Created: 2026-02-02
-- ============================================================================

-- ============================================================================
-- 1. SAMPLE LOCATIONS (계층형 위치 예시)
-- ============================================================================

-- 초기화 (기존 데이터 삭제)
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE locations CASCADE;

-- ----------------------------------------------------------------------------
-- Level 1: 방 (Room)
-- ----------------------------------------------------------------------------
INSERT INTO locations (id, name, level, icon, color, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', '주방', 1, 'utensils', '#FF6B6B', 1),
  ('22222222-2222-2222-2222-222222222222', '거실', 1, 'tv', '#4ECDC4', 2),
  ('33333333-3333-3333-3333-333333333333', '욕실', 1, 'bath', '#45B7D1', 3),
  ('44444444-4444-4444-4444-444444444444', '침실', 1, 'bed', '#96CEB4', 4);

-- ----------------------------------------------------------------------------
-- Level 2: 가구 (Furniture)
-- ----------------------------------------------------------------------------
INSERT INTO locations (id, parent_id, name, level, icon, color, sort_order) VALUES
  -- 주방 가구
  ('11111111-1111-2222-0000-000000000001', '11111111-1111-1111-1111-111111111111', '냉장고', 2, 'refrigerator', '#FF8787', 1),
  ('11111111-1111-2222-0000-000000000002', '11111111-1111-1111-1111-111111111111', '식품 선반', 2, 'cabinet', '#FFA07A', 2),
  ('11111111-1111-2222-0000-000000000003', '11111111-1111-1111-1111-111111111111', '싱크대 수납장', 2, 'cabinet', '#FFB347', 3),
  
  -- 거실 가구
  ('22222222-2222-2222-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'TV 선반', 2, 'tv-stand', '#5FD4DB', 1),
  ('22222222-2222-2222-0000-000000000002', '22222222-2222-2222-2222-222222222222', '서랍장', 2, 'drawer', '#7AE7C7', 2),
  
  -- 욕실 가구
  ('33333333-3333-3333-0000-000000000001', '33333333-3333-3333-3333-333333333333', '세면대 수납', 2, 'cabinet', '#6AB0DE', 1),
  ('33333333-3333-3333-0000-000000000002', '33333333-3333-3333-3333-333333333333', '욕실장', 2, 'shelf', '#87CEEB', 2),
  
  -- 침실 가구
  ('44444444-4444-4444-0000-000000000001', '44444444-4444-4444-4444-444444444444', '옷장', 2, 'closet', '#A8D8B9', 1),
  ('44444444-4444-4444-0000-000000000002', '44444444-4444-4444-4444-444444444444', '협탁', 2, 'nightstand', '#B8E6D5', 2);

-- ----------------------------------------------------------------------------
-- Level 3: 칸 (Compartment)
-- ----------------------------------------------------------------------------
INSERT INTO locations (id, parent_id, name, level, icon, color, sort_order) VALUES
  -- 냉장고 칸
  ('11111111-1111-3333-0001-000000000001', '11111111-1111-2222-0000-000000000001', '냉장실', 3, 'snowflake', '#FFB3B3', 1),
  ('11111111-1111-3333-0001-000000000002', '11111111-1111-2222-0000-000000000001', '냉동실', 3, 'ice', '#FF9999', 2),
  ('11111111-1111-3333-0001-000000000003', '11111111-1111-2222-0000-000000000001', '야채칸', 3, 'carrot', '#FFCCCC', 3),
  
  -- 식품 선반 칸
  ('11111111-1111-3333-0002-000000000001', '11111111-1111-2222-0000-000000000002', '상단', 3, 'arrow-up', '#FFBB99', 1),
  ('11111111-1111-3333-0002-000000000002', '11111111-1111-2222-0000-000000000002', '중단', 3, 'minus', '#FFCC99', 2),
  ('11111111-1111-3333-0002-000000000003', '11111111-1111-2222-0000-000000000002', '하단', 3, 'arrow-down', '#FFDD99', 3),
  
  -- 세면대 수납 칸
  ('33333333-3333-3333-0001-000000000001', '33333333-3333-3333-0000-000000000001', '왼쪽 서랍', 3, 'chevron-left', '#8CC5E8', 1),
  ('33333333-3333-3333-0001-000000000002', '33333333-3333-3333-0000-000000000001', '오른쪽 서랍', 3, 'chevron-right', '#A3D5F0', 2);

-- ============================================================================
-- 2. SAMPLE ITEMS (물품 예시)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1. FOOD 타입 물품 (식품)
-- ----------------------------------------------------------------------------
INSERT INTO items (name, location_id, type, status, quantity, metadata, tags, barcode) VALUES
  -- 냉장실 식품
  (
    '우유 (서울우유)',
    '11111111-1111-3333-0001-000000000001',
    'FOOD',
    'ACTIVE',
    2,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '5 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '2 days')::TEXT,
      'brand', '서울우유',
      'volume', '1000ml'
    ),
    ARRAY['유제품', '아침식사', '커피재료'],
    '8801234567890'
  ),
  (
    '김치 (종가집)',
    '11111111-1111-3333-0001-000000000001',
    'FOOD',
    'ACTIVE',
    1,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '30 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '5 days')::TEXT,
      'brand', '종가집',
      'weight', '500g'
    ),
    ARRAY['반찬', '발효식품'],
    NULL
  ),
  (
    '계란 (1판)',
    '11111111-1111-3333-0001-000000000001',
    'FOOD',
    'ACTIVE',
    10,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '14 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '3 days')::TEXT,
      'notes', '냉장보관 필수'
    ),
    ARRAY['단백질', '아침식사'],
    NULL
  ),
  
  -- 냉동실 식품
  (
    '삼겹살 (국내산)',
    '11111111-1111-3333-0001-000000000002',
    'FOOD',
    'ACTIVE',
    3,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '90 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '7 days')::TEXT,
      'weight', '600g'
    ),
    ARRAY['육류', '고기', '냉동'],
    NULL
  ),
  (
    '아이스크림 (하겐다즈 바닐라)',
    '11111111-1111-3333-0001-000000000002',
    'FOOD',
    'ACTIVE',
    2,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '180 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '10 days')::TEXT,
      'brand', '하겐다즈'
    ),
    ARRAY['디저트', '아이스크림'],
    '8809876543210'
  ),
  
  -- 야채칸 식품
  (
    '양배추',
    '11111111-1111-3333-0001-000000000003',
    'FOOD',
    'ACTIVE',
    1,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '7 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '1 days')::TEXT
    ),
    ARRAY['채소', '샐러드'],
    NULL
  ),
  (
    '토마토',
    '11111111-1111-3333-0001-000000000003',
    'FOOD',
    'ACTIVE',
    5,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '4 days')::TEXT,
      'purchase_date', (CURRENT_DATE)::TEXT
    ),
    ARRAY['채소', '과일'],
    NULL
  ),
  
  -- 식품 선반 (상온 보관)
  (
    '라면 (신라면 5개입)',
    '11111111-1111-3333-0002-000000000001',
    'FOOD',
    'ACTIVE',
    5,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '180 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '15 days')::TEXT,
      'brand', '농심'
    ),
    ARRAY['즉석식품', '비상식량'],
    '8801043010047'
  ),
  (
    '참기름 (오뚜기)',
    '11111111-1111-3333-0002-000000000002',
    'FOOD',
    'ACTIVE',
    1,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '365 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '30 days')::TEXT,
      'brand', '오뚜기',
      'volume', '320ml'
    ),
    ARRAY['조미료', '기름'],
    NULL
  ),
  (
    '통조림 (스팸)',
    '11111111-1111-3333-0002-000000000003',
    'FOOD',
    'ACTIVE',
    3,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '730 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '60 days')::TEXT,
      'brand', 'CJ'
    ),
    ARRAY['비상식량', '통조림'],
    '8801007032245'
  );

-- ----------------------------------------------------------------------------
-- 2.2. COSMETIC 타입 물품 (화장품)
-- ----------------------------------------------------------------------------
INSERT INTO items (name, location_id, type, status, quantity, metadata, tags) VALUES
  (
    '토너 (에스티로더)',
    '33333333-3333-3333-0001-000000000001',
    'COSMETIC',
    'ACTIVE',
    1,
    jsonb_build_object(
      'opened_date', (CURRENT_DATE - INTERVAL '90 days')::TEXT,
      'pao', 12,
      'brand', '에스티로더',
      'purchase_date', (CURRENT_DATE - INTERVAL '100 days')::TEXT
    ),
    ARRAY['스킨케어', '기초화장품']
  ),
  (
    '선크림 (라로슈포제)',
    '33333333-3333-3333-0001-000000000001',
    'COSMETIC',
    'ACTIVE',
    1,
    jsonb_build_object(
      'opened_date', (CURRENT_DATE - INTERVAL '30 days')::TEXT,
      'pao', 6,
      'brand', '라로슈포제',
      'spf', '50+'
    ),
    ARRAY['자외선차단', '여름용품']
  ),
  (
    '립스틱 (맥)',
    '33333333-3333-3333-0001-000000000002',
    'COSMETIC',
    'ACTIVE',
    1,
    jsonb_build_object(
      'opened_date', (CURRENT_DATE - INTERVAL '180 days')::TEXT,
      'pao', 24,
      'brand', 'MAC',
      'color', 'Ruby Woo'
    ),
    ARRAY['메이크업', '립제품']
  ),
  (
    '샴푸 (려)',
    '33333333-3333-3333-0000-000000000002',
    'COSMETIC',
    'ACTIVE',
    1,
    jsonb_build_object(
      'opened_date', (CURRENT_DATE - INTERVAL '45 days')::TEXT,
      'pao', 12,
      'brand', '려',
      'volume', '500ml'
    ),
    ARRAY['헤어케어', '샴푸']
  );

-- ----------------------------------------------------------------------------
-- 2.3. MEDICINE 타입 물품 (의약품)
-- ----------------------------------------------------------------------------
INSERT INTO items (name, location_id, type, status, quantity, metadata, tags) VALUES
  (
    '타이레놀 (진통제)',
    '44444444-4444-4444-0000-000000000002',
    'MEDICINE',
    'ACTIVE',
    20,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '365 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '60 days')::TEXT,
      'dosage', '500mg',
      'notes', '1일 3회, 식후 복용'
    ),
    ARRAY['진통제', '해열제', '상비약']
  ),
  (
    '소화제 (베아제)',
    '44444444-4444-4444-0000-000000000002',
    'MEDICINE',
    'ACTIVE',
    10,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '180 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '30 days')::TEXT,
      'notes', '소화불량 시 복용'
    ),
    ARRAY['소화제', '상비약']
  ),
  (
    '밴드 (큐어밴드)',
    '44444444-4444-4444-0000-000000000002',
    'MEDICINE',
    'ACTIVE',
    30,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE + INTERVAL '730 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '90 days')::TEXT,
      'size', '혼합형'
    ),
    ARRAY['구급용품', '밴드']
  );

-- ----------------------------------------------------------------------------
-- 2.4. GENERAL 타입 물품 (일반 물품)
-- ----------------------------------------------------------------------------
INSERT INTO items (name, location_id, type, status, quantity, metadata, tags) VALUES
  (
    '건전지 (AA)',
    '22222222-2222-2222-0000-000000000002',
    'GENERAL',
    'ACTIVE',
    8,
    jsonb_build_object(
      'purchase_date', (CURRENT_DATE - INTERVAL '120 days')::TEXT,
      'brand', 'Duracell',
      'voltage', '1.5V'
    ),
    ARRAY['전자제품', '소모품']
  ),
  (
    'USB 케이블 (C타입)',
    '22222222-2222-2222-0000-000000000002',
    'GENERAL',
    'ACTIVE',
    3,
    jsonb_build_object(
      'purchase_date', (CURRENT_DATE - INTERVAL '200 days')::TEXT,
      'length', '1m',
      'notes', '고속충전 지원'
    ),
    ARRAY['전자제품', '케이블']
  ),
  (
    '수건 (화이트)',
    '44444444-4444-4444-0000-000000000001',
    'GENERAL',
    'ACTIVE',
    4,
    jsonb_build_object(
      'purchase_date', (CURRENT_DATE - INTERVAL '365 days')::TEXT,
      'color', 'white',
      'material', 'cotton'
    ),
    ARRAY['생활용품', '욕실']
  );

-- ----------------------------------------------------------------------------
-- 2.5. 만료된/소진된 물품 (상태 테스트용)
-- ----------------------------------------------------------------------------
INSERT INTO items (name, location_id, type, status, quantity, metadata, tags) VALUES
  (
    '요구르트 (만료)',
    '11111111-1111-3333-0001-000000000001',
    'FOOD',
    'EXPIRED',
    1,
    jsonb_build_object(
      'expiry_date', (CURRENT_DATE - INTERVAL '3 days')::TEXT,
      'purchase_date', (CURRENT_DATE - INTERVAL '10 days')::TEXT
    ),
    ARRAY['유제품', '만료']
  ),
  (
    '휴지 (소진)',
    '33333333-3333-3333-0000-000000000002',
    'GENERAL',
    'CONSUMED',
    0,
    jsonb_build_object(
      'purchase_date', (CURRENT_DATE - INTERVAL '30 days')::TEXT,
      'consumed_date', (CURRENT_DATE)::TEXT
    ),
    ARRAY['생활용품', '소진']
  );

-- ============================================================================
-- 3. 데이터 확인 쿼리
-- ============================================================================

DO $$
DECLARE
  location_count INTEGER;
  item_count INTEGER;
  active_item_count INTEGER;
  expiring_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO location_count FROM locations;
  SELECT COUNT(*) INTO item_count FROM items;
  SELECT COUNT(*) INTO active_item_count FROM items WHERE status = 'ACTIVE';
  SELECT COUNT(*) INTO expiring_count FROM get_expiring_items(7);
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Sample Data Seeded Successfully';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📍 Locations: % (Level 1-3)', location_count;
  RAISE NOTICE '📦 Total Items: %', item_count;
  RAISE NOTICE '✅ Active Items: %', active_item_count;
  RAISE NOTICE '⚠️  Expiring Soon (7 days): %', expiring_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE '🔍 Test Queries:';
  RAISE NOTICE '  - SELECT * FROM v_active_items_with_location;';
  RAISE NOTICE '  - SELECT * FROM v_location_item_counts;';
  RAISE NOTICE '  - SELECT * FROM get_expiring_items(7);';
  RAISE NOTICE '============================================';
END $$;
