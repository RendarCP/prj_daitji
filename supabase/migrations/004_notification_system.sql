-- ============================================================================
-- DAITJI Database Migration v1.1 - Notification System
-- ============================================================================
-- Description: 만료 임박/재고 부족 알림 이벤트 큐 및 푸시 토큰 관리
-- Stage: 2차 인증 기반 확장
-- Created: 2026-03-07
-- ============================================================================

-- ==========================================================================
-- 1. CUSTOM TYPES
-- ==========================================================================

CREATE TYPE notification_event_type AS ENUM (
  'EXPIRY_SOON',
  'LOW_STOCK'
);

CREATE TYPE notification_channel AS ENUM (
  'PUSH',
  'IN_APP'
);

CREATE TYPE notification_event_status AS ENUM (
  'pending',
  'processing',
  'sent',
  'failed',
  'canceled'
);

CREATE TYPE notification_delivery_status AS ENUM (
  'success',
  'failed'
);

-- ==========================================================================
-- 2. TABLES
-- ==========================================================================

-- ----------------------------------------------------------------------------
-- 2.1. notification_settings (사용자별 알림 기본 설정)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  expiry_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  -- 예: {7,3,1} => 만료 7일/3일/1일 전 알림
  expiry_days_before SMALLINT[] NOT NULL DEFAULT ARRAY[7, 3, 1]::SMALLINT[],

  low_stock_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  low_stock_threshold INTEGER NOT NULL DEFAULT 1 CHECK (low_stock_threshold >= 0),

  -- 추후 조용한 시간대 제어용
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT notification_settings_user_unique UNIQUE (user_id)
);

COMMENT ON TABLE notification_settings IS '사용자별 알림 기본 설정';
COMMENT ON COLUMN notification_settings.expiry_days_before IS '만료 알림 기준 일자 배열 (예: {7,3,1})';

-- ----------------------------------------------------------------------------
-- 2.2. notification_push_tokens (디바이스 푸시 토큰)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  push_token TEXT NOT NULL,
  device_label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT notification_push_tokens_user_token_unique UNIQUE (user_id, push_token)
);

COMMENT ON TABLE notification_push_tokens IS '사용자별 푸시 토큰 저장';

-- ----------------------------------------------------------------------------
-- 2.3. notification_events (알림 이벤트 큐)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  event_type notification_event_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'PUSH',
  status notification_event_status NOT NULL DEFAULT 'pending',

  entity_type TEXT NOT NULL DEFAULT 'item',
  entity_id UUID NOT NULL,

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,

  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,

  -- 중복 방지 키 (예: EXPIRY_SOON:{item_id}:{days}:{yyyymmdd})
  dedupe_key TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT notification_events_dedupe_unique UNIQUE (dedupe_key)
);

COMMENT ON TABLE notification_events IS '발송 대상 알림 이벤트 큐';
COMMENT ON COLUMN notification_events.dedupe_key IS '알림 중복 생성을 방지하는 유니크 키';

-- ----------------------------------------------------------------------------
-- 2.4. notification_deliveries (발송 시도 로그)
-- ----------------------------------------------------------------------------
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES notification_events(id) ON DELETE CASCADE,
  token_id UUID REFERENCES notification_push_tokens(id) ON DELETE SET NULL,

  provider TEXT NOT NULL,
  provider_message_id TEXT,
  status notification_delivery_status NOT NULL,

  error_message TEXT,
  response_body JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notification_deliveries IS '알림 발송 시도/결과 로그';

-- ==========================================================================
-- 3. INDEXES
-- ==========================================================================

CREATE INDEX idx_notification_settings_user_id
  ON notification_settings(user_id);

CREATE INDEX idx_notification_push_tokens_user_active
  ON notification_push_tokens(user_id, is_active)
  WHERE is_active = TRUE;

CREATE INDEX idx_notification_events_pending_schedule
  ON notification_events(status, scheduled_at)
  WHERE status IN ('pending', 'processing');

CREATE INDEX idx_notification_events_user_created_at
  ON notification_events(user_id, created_at DESC);

CREATE INDEX idx_notification_events_entity
  ON notification_events(entity_type, entity_id);

CREATE INDEX idx_notification_deliveries_event_id
  ON notification_deliveries(event_id);

-- ==========================================================================
-- 4. TRIGGERS
-- ==========================================================================

CREATE TRIGGER trg_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notification_push_tokens_updated_at
  BEFORE UPDATE ON notification_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notification_events_updated_at
  BEFORE UPDATE ON notification_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================================
-- 5. RLS POLICIES
-- ==========================================================================

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

-- notification_settings: 본인 설정만 조회/수정 가능
CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notification_push_tokens: 본인 토큰만 조회/관리 가능
CREATE POLICY "Users can view own push tokens"
  ON notification_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON notification_push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON notification_push_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON notification_push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- notification_events: 본인 이벤트 조회만 허용 (생성/처리는 서버 워커 담당)
CREATE POLICY "Users can view own notification events"
  ON notification_events FOR SELECT
  USING (auth.uid() = user_id);

-- notification_deliveries: 본인 이벤트에 연결된 발송 로그 조회 허용
CREATE POLICY "Users can view own notification deliveries"
  ON notification_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM notification_events ne
      WHERE ne.id = notification_deliveries.event_id
        AND ne.user_id = auth.uid()
    )
  );

-- ==========================================================================
-- 6. QUEUE BUILD FUNCTIONS
-- ==========================================================================

-- ----------------------------------------------------------------------------
-- 6.1. 만료 임박 이벤트 큐 생성
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION queue_expiry_notification_events(
  p_reference_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  INSERT INTO notification_events (
    user_id,
    event_type,
    channel,
    entity_type,
    entity_id,
    title,
    body,
    payload,
    scheduled_at,
    dedupe_key
  )
  SELECT
    i.user_id,
    'EXPIRY_SOON'::notification_event_type,
    'PUSH'::notification_channel,
    'item',
    i.id,
    format('유통기한 임박: %s', i.name),
    format('%s의 만료일까지 %s일 남았어요.', i.name, (i.computed_expiry_date - p_reference_date)::INTEGER),
    jsonb_build_object(
      'item_id', i.id,
      'item_name', i.name,
      'days_until_expiry', (i.computed_expiry_date - p_reference_date)::INTEGER,
      'expiry_date', i.computed_expiry_date
    ),
    NOW(),
    concat_ws(
      ':',
      'EXPIRY_SOON',
      i.id::TEXT,
      (i.computed_expiry_date - p_reference_date)::INTEGER::TEXT,
      to_char(p_reference_date, 'YYYYMMDD')
    )
  FROM items i
  LEFT JOIN notification_settings ns ON ns.user_id = i.user_id
  WHERE
    i.user_id IS NOT NULL
    AND i.status = 'ACTIVE'
    AND i.computed_expiry_date IS NOT NULL
    AND (i.computed_expiry_date - p_reference_date)::INTEGER >= 0
    AND (i.computed_expiry_date - p_reference_date)::INTEGER = ANY(
      COALESCE(ns.expiry_days_before, ARRAY[7, 3, 1]::SMALLINT[])
    )
    AND COALESCE(ns.enabled, TRUE) = TRUE
    AND COALESCE(ns.push_enabled, TRUE) = TRUE
    AND COALESCE(ns.expiry_enabled, TRUE) = TRUE
  ON CONFLICT (dedupe_key) DO NOTHING;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END;
$$;

COMMENT ON FUNCTION queue_expiry_notification_events IS
  '만료 임박 조건에 해당하는 알림 이벤트를 큐에 생성';

-- ----------------------------------------------------------------------------
-- 6.2. 재고 부족 이벤트 큐 생성
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION queue_low_stock_notification_events(
  p_reference_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  INSERT INTO notification_events (
    user_id,
    event_type,
    channel,
    entity_type,
    entity_id,
    title,
    body,
    payload,
    scheduled_at,
    dedupe_key
  )
  SELECT
    i.user_id,
    'LOW_STOCK'::notification_event_type,
    'PUSH'::notification_channel,
    'item',
    i.id,
    format('재고 부족: %s', i.name),
    format('%s의 수량이 %s개로 부족합니다.', i.name, i.quantity),
    jsonb_build_object(
      'item_id', i.id,
      'item_name', i.name,
      'current_quantity', i.quantity,
      'threshold',
      COALESCE(
        CASE
          WHEN (i.metadata->>'low_stock_threshold') ~ '^\\d+$'
          THEN (i.metadata->>'low_stock_threshold')::INTEGER
          ELSE NULL
        END,
        ns.low_stock_threshold,
        1
      )
    ),
    NOW(),
    concat_ws(
      ':',
      'LOW_STOCK',
      i.id::TEXT,
      to_char(p_reference_date, 'YYYYMMDD')
    )
  FROM items i
  LEFT JOIN notification_settings ns ON ns.user_id = i.user_id
  WHERE
    i.user_id IS NOT NULL
    AND i.status = 'ACTIVE'
    AND i.quantity <= COALESCE(
      CASE
        WHEN (i.metadata->>'low_stock_threshold') ~ '^\\d+$'
        THEN (i.metadata->>'low_stock_threshold')::INTEGER
        ELSE NULL
      END,
      ns.low_stock_threshold,
      1
    )
    AND COALESCE(ns.enabled, TRUE) = TRUE
    AND COALESCE(ns.push_enabled, TRUE) = TRUE
    AND COALESCE(ns.low_stock_enabled, TRUE) = TRUE
  ON CONFLICT (dedupe_key) DO NOTHING;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END;
$$;

COMMENT ON FUNCTION queue_low_stock_notification_events IS
  '재고 부족 조건에 해당하는 알림 이벤트를 큐에 생성';

-- ==========================================================================
-- 7. WORKER FUNCTIONS
-- ==========================================================================

-- ----------------------------------------------------------------------------
-- 7.1. 처리 대상 이벤트 선점 (동시성 안전)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION claim_notification_events(
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF notification_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT ne.id
    FROM notification_events ne
    WHERE ne.status = 'pending'
      AND ne.scheduled_at <= NOW()
    ORDER BY ne.scheduled_at ASC, ne.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  ),
  updated AS (
    UPDATE notification_events ne
    SET
      status = 'processing',
      attempt_count = ne.attempt_count + 1,
      updated_at = NOW()
    FROM candidate c
    WHERE ne.id = c.id
    RETURNING ne.*
  )
  SELECT * FROM updated;
END;
$$;

COMMENT ON FUNCTION claim_notification_events IS
  'pending 이벤트를 선점하여 processing 상태로 변경 후 반환';

-- ----------------------------------------------------------------------------
-- 7.2. 이벤트 처리 성공 처리
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_notification_event_sent(
  p_event_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notification_events
  SET
    status = 'sent',
    sent_at = NOW(),
    updated_at = NOW(),
    last_error = NULL
  WHERE id = p_event_id;
END;
$$;

COMMENT ON FUNCTION mark_notification_event_sent IS
  '이벤트를 sent 상태로 종료';

-- ----------------------------------------------------------------------------
-- 7.3. 이벤트 처리 실패 및 재시도 스케줄링
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_notification_event_failed(
  p_event_id UUID,
  p_error_message TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_retry_delay_seconds INTEGER DEFAULT 300
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notification_events
  SET
    status = CASE
      WHEN attempt_count >= p_max_attempts THEN 'failed'::notification_event_status
      ELSE 'pending'::notification_event_status
    END,
    scheduled_at = CASE
      WHEN attempt_count >= p_max_attempts THEN scheduled_at
      ELSE NOW() + make_interval(secs => GREATEST(p_retry_delay_seconds, 0))
    END,
    last_error = p_error_message,
    updated_at = NOW()
  WHERE id = p_event_id;
END;
$$;

COMMENT ON FUNCTION mark_notification_event_failed IS
  '실패 이벤트를 재시도 가능 상태로 되돌리거나 최종 failed 처리';

-- ----------------------------------------------------------------------------
-- 7.4. 푸시 토큰 upsert (클라이언트 등록용)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upsert_notification_push_token(
  p_platform TEXT,
  p_push_token TEXT,
  p_device_label TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_token_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_platform NOT IN ('web', 'ios', 'android') THEN
    RAISE EXCEPTION 'Invalid platform: %', p_platform;
  END IF;

  INSERT INTO notification_push_tokens (
    user_id,
    platform,
    push_token,
    device_label,
    is_active,
    last_seen_at
  )
  VALUES (
    v_user_id,
    p_platform,
    p_push_token,
    p_device_label,
    TRUE,
    NOW()
  )
  ON CONFLICT (user_id, push_token)
  DO UPDATE SET
    platform = EXCLUDED.platform,
    device_label = COALESCE(EXCLUDED.device_label, notification_push_tokens.device_label),
    is_active = TRUE,
    last_seen_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

COMMENT ON FUNCTION upsert_notification_push_token IS
  '현재 로그인 사용자 기준 푸시 토큰 upsert';

-- ==========================================================================
-- 8. PERMISSIONS
-- ==========================================================================

REVOKE ALL ON FUNCTION queue_expiry_notification_events(DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION queue_low_stock_notification_events(DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_notification_events(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_notification_event_sent(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_notification_event_failed(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION queue_expiry_notification_events(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION queue_low_stock_notification_events(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION claim_notification_events(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_event_sent(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_event_failed(UUID, TEXT, INTEGER, INTEGER) TO service_role;

-- 인증 사용자가 자신의 토큰을 등록할 수 있게 허용
REVOKE ALL ON FUNCTION upsert_notification_push_token(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_notification_push_token(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_notification_push_token(TEXT, TEXT, TEXT) TO service_role;

-- ==========================================================================
-- 9. VALIDATION LOG
-- ==========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Notification system schema initialized';
  RAISE NOTICE '📬 Tables created: notification_settings, notification_push_tokens, notification_events, notification_deliveries';
  RAISE NOTICE '⚙️ Queue functions: queue_expiry_notification_events, queue_low_stock_notification_events';
  RAISE NOTICE '🧰 Worker functions: claim_notification_events, mark_notification_event_sent, mark_notification_event_failed';
END $$;
