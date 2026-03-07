# Notification System Guide (Supabase)

`supabase/migrations/004_notification_system.sql` 기준 알림 시스템 운용 가이드입니다.

## 1. 구성 테이블

- `notification_settings`: 사용자별 알림 설정
- `notification_push_tokens`: 사용자 디바이스 푸시 토큰
- `notification_events`: 발송 대상 이벤트 큐
- `notification_deliveries`: 실제 발송 결과 로그

## 2. 핵심 함수

- `queue_expiry_notification_events(p_reference_date date default current_date)`
  - 만료 임박 이벤트를 큐에 적재
- `queue_low_stock_notification_events(p_reference_date date default current_date)`
  - 재고 부족 이벤트를 큐에 적재
- `claim_notification_events(p_limit int default 50)`
  - `pending` 이벤트를 `processing`으로 선점
- `mark_notification_event_sent(p_event_id uuid)`
  - 이벤트 성공 처리
- `mark_notification_event_failed(p_event_id uuid, p_error_message text, p_max_attempts int default 5, p_retry_delay_seconds int default 300)`
  - 이벤트 실패/재시도 처리
- `upsert_notification_push_token(p_platform text, p_push_token text, p_device_label text)`
  - 인증 사용자 기준 토큰 등록/갱신

## 3. 운영 플로우

1. 스케줄러가 큐 생성 함수를 주기적으로 호출
2. 워커가 `claim_notification_events()`로 이벤트 선점
3. FCM/웹푸시/APNs 발송
4. 성공 시 `mark_notification_event_sent()`
5. 실패 시 `mark_notification_event_failed()`

## 4. 스케줄 예시

### 4.1 큐 생성 작업 (5~15분 주기)

```sql
select queue_expiry_notification_events(current_date);
select queue_low_stock_notification_events(current_date);
```

### 4.2 워커 처리 예시

```sql
select * from claim_notification_events(100);
```

각 row 발송 후:

```sql
select mark_notification_event_sent('<event_id>'::uuid);
```

실패 시:

```sql
select mark_notification_event_failed(
  '<event_id>'::uuid,
  'provider timeout',
  5,
  300
);
```

## 5. 중복 방지 정책

- 만료 임박: `EXPIRY_SOON:item_id:days:yyyymmdd`
- 재고 부족: `LOW_STOCK:item_id:yyyymmdd`

`notification_events.dedupe_key` 유니크 제약으로 중복 생성 차단.

## 6. 권한/보안

- 사용자 직접 접근은 RLS로 본인 데이터만 허용
- 큐/워커 함수는 `service_role` 실행 권한만 부여
- 토큰 upsert 함수는 `authenticated` 실행 가능
