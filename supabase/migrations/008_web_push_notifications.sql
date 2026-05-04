-- ============================================================================
-- DAITJI Database Migration v1.2 - Web Push Notifications
-- ============================================================================
-- Description: Web Push 구독 저장 및 발송 워커용 토큰 메타데이터 확장
-- Created: 2026-05-04
-- ============================================================================

ALTER TABLE notification_push_tokens
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'webpush',
  ADD COLUMN IF NOT EXISTS provider_subscription JSONB;

ALTER TABLE notification_push_tokens
  DROP CONSTRAINT IF EXISTS notification_push_tokens_provider_check;

ALTER TABLE notification_push_tokens
  ADD CONSTRAINT notification_push_tokens_provider_check
  CHECK (provider IN ('webpush', 'fcm'));

CREATE INDEX IF NOT EXISTS idx_notification_push_tokens_provider_active
  ON notification_push_tokens(provider, is_active, last_seen_at DESC)
  WHERE is_active = TRUE;

CREATE OR REPLACE FUNCTION upsert_web_push_subscription(
  p_subscription JSONB,
  p_device_label TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_endpoint TEXT := p_subscription->>'endpoint';
  v_token_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_endpoint IS NULL OR length(v_endpoint) = 0 THEN
    RAISE EXCEPTION 'Invalid Web Push subscription: missing endpoint';
  END IF;

  IF p_subscription->'keys'->>'p256dh' IS NULL OR p_subscription->'keys'->>'auth' IS NULL THEN
    RAISE EXCEPTION 'Invalid Web Push subscription: missing keys';
  END IF;

  INSERT INTO notification_push_tokens (
    user_id,
    platform,
    provider,
    push_token,
    provider_subscription,
    device_label,
    is_active,
    last_seen_at
  )
  VALUES (
    v_user_id,
    'web',
    'webpush',
    v_endpoint,
    p_subscription,
    p_device_label,
    TRUE,
    NOW()
  )
  ON CONFLICT (user_id, push_token)
  DO UPDATE SET
    platform = 'web',
    provider = 'webpush',
    provider_subscription = EXCLUDED.provider_subscription,
    device_label = COALESCE(EXCLUDED.device_label, notification_push_tokens.device_label),
    is_active = TRUE,
    last_seen_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

COMMENT ON FUNCTION upsert_web_push_subscription IS
  '현재 로그인 사용자 기준 Web Push 구독 upsert';

REVOKE ALL ON FUNCTION upsert_web_push_subscription(JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_web_push_subscription(JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_web_push_subscription(JSONB, TEXT) TO service_role;
