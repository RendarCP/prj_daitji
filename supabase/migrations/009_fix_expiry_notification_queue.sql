-- ============================================================================
-- DAITJI Database Migration v1.3 - Fix Expiry Notification Queue
-- ============================================================================
-- Description: 원격 DB에 없는 items.computed_expiry_date 대신 calculate_expiry_date 사용
-- Created: 2026-05-04
-- ============================================================================

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
    item_expiry.user_id,
    'EXPIRY_SOON'::notification_event_type,
    'PUSH'::notification_channel,
    'item',
    item_expiry.id,
    format('유통기한 임박: %s', item_expiry.name),
    format('%s의 만료일까지 %s일 남았어요.', item_expiry.name, (item_expiry.expiry_date - p_reference_date)::INTEGER),
    jsonb_build_object(
      'item_id', item_expiry.id,
      'item_name', item_expiry.name,
      'days_until_expiry', (item_expiry.expiry_date - p_reference_date)::INTEGER,
      'expiry_date', item_expiry.expiry_date
    ),
    NOW(),
    concat_ws(
      ':',
      'EXPIRY_SOON',
      item_expiry.id::TEXT,
      (item_expiry.expiry_date - p_reference_date)::INTEGER::TEXT,
      to_char(p_reference_date, 'YYYYMMDD')
    )
  FROM (
    SELECT
      i.id,
      i.user_id,
      i.name,
      i.status,
      calculate_expiry_date(i.type, i.metadata) AS expiry_date
    FROM items i
  ) item_expiry
  LEFT JOIN notification_settings ns ON ns.user_id = item_expiry.user_id
  WHERE
    item_expiry.user_id IS NOT NULL
    AND item_expiry.status = 'ACTIVE'
    AND item_expiry.expiry_date IS NOT NULL
    AND (item_expiry.expiry_date - p_reference_date)::INTEGER >= 0
    AND (item_expiry.expiry_date - p_reference_date)::INTEGER = ANY(
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
