# DAITJI Subscription Plan v1

## 개요
DAITJI는 현재 개인 사용자 중심의 재고/위치 관리 앱 구조를 가지고 있으며, 아직 결제/구독 모델은 도입되지 않았다.

본 문서는 구독제 전환을 위한 1차 설계안을 정의한다.

이번 단계의 목표:
- `Free + Pro + Family` 플랜 구조 수용
- 결제 연동 전 단계에서 필요한 데이터 모델/권한/제한 구조 설계
- 기존 사용자 전환 정책 정의
- 설정 화면에서 플랜 상태와 사용량을 보여줄 수 있는 기반 마련

이번 단계에서 제외:
- Stripe 등 실제 결제 사업자 연동
- 자동 결제 갱신/실패 처리
- 환불/청구서/세금 처리
- Family 공동 편집 및 공유 인벤토리

---

## 플랜 구조

### Free
기본 무료 플랜이다.

의도:
- 신규 사용자 유입
- 핵심 가치 경험 제공
- 사용량과 일부 기능 제한을 통한 업그레이드 유도

### Pro
개인 유료 상위 플랜이다.

의도:
- 개인 사용자의 저장 한도 확장
- 고급 기능 제공
- 사용량 제한 대부분 해제

### Family
가족/동거인 등 다인 사용을 염두에 둔 플랜이다.

1차 범위에서는 실제 공유 워크스페이스를 만들지 않고, 초대 구조만 먼저 지원한다.

의도:
- 추후 가족 단위 협업 기능으로 확장 가능한 구조 선점
- 초대/수락 흐름 및 멤버십 관계를 먼저 정리

---

## 이번 단계 범위

### 포함
- 플랜 상태를 저장하는 데이터 모델 설계
- 계정별 entitlement(권한 상태) 관리 구조
- 사용량 제한을 위한 카운팅 구조
- Family 초대 구조 설계
- API 생성 시 플랜 제한 검사를 넣을 수 있는 공통 레이어 설계
- 설정 화면에서 현재 플랜/체험/사용량 표시 가능하도록 준비
- 기존 사용자 전환 정책 정의

### 제외
- 실제 결제 연동
- 카드 등록/결제 페이지
- 결제 웹훅
- 자동 갱신
- 해지/환불 운영 로직
- Family 공유 데이터 모델

---

## 기존 사용자 정책

### 기존 가입자
구독제 도입 시점 이전 가입자는 모두 `Pro Trial` 상태로 시작한다.

기본값:
- Trial 기간: 30일

Trial 종료 후:
- 별도 결제 연동이 없는 1차 단계에서는 `Free`로 전환
- 기존 데이터는 유지
- 단, Free 한도를 초과한 상태라면 새 생성만 제한
- 조회/수정/삭제는 계속 허용

### 신규 가입자
구독제 도입 이후 신규 사용자는 기본적으로 `Free` 플랜으로 시작한다.

---

## 플랜별 정책

### Free
제한:
- 위치 최대 20개
- 물품 최대 100개
- 이미지 업로드 월 20회

기능:
- 기본 위치/물품 관리 가능
- 기본 탐색/조회 가능
- 고급 알림 규칙 사용 불가
- Family 초대 생성 불가

### Pro
제한:
- 위치/물품/업로드 제한 사실상 없음

기능:
- Free 기능 전체 포함
- 고급 알림 규칙 사용 가능
- 향후 개인 고급 기능 연결 가능

### Family
제한:
- Pro 수준 권한 포함
- 초대 최대 4명까지 생성 가능

기능:
- Pro 기능 전체 포함
- Family 초대 생성 및 관리 가능

주의:
- 1차에서는 초대 상태만 관리
- 실제 공유 인벤토리/공동 편집은 아직 제공하지 않음

---

## 데이터 모델 초안

### subscription_plans
플랜 마스터 데이터 테이블

예상 필드:
- `code`: `free`, `pro`, `family`
- `name`
- `is_active`
- `created_at`
- `updated_at`

### account_entitlements
사용자별 현재 플랜 및 권한 상태 저장

예상 필드:
- `id`
- `user_id`
- `plan_code`
- `status`
- `trial_ends_at`
- `effective_from`
- `effective_until`
- `created_at`
- `updated_at`

상태 예시:
- `active`
- `trialing`
- `expired`
- `cancelled`

### family_invites
Family 초대 관리용 테이블

예상 필드:
- `id`
- `owner_user_id`
- `invitee_email`
- `status`
- `expires_at`
- `accepted_at`
- `created_at`
- `updated_at`

상태 예시:
- `pending`
- `accepted`
- `expired`
- `revoked`

### feature_usage_counters
사용량 제한 체크용 집계 테이블

예상 필드:
- `id`
- `user_id`
- `metric_key`
- `period_key`
- `count`
- `created_at`
- `updated_at`

metric 예시:
- `items_created`
- `locations_created`
- `image_uploads`

---

## 애플리케이션 레이어 설계

구독 관련 로직은 공통 서버 레이어로 분리한다.

예상 구성:
- 플랜 코드 및 상태 타입
- 플랜별 제한 상수 정의
- 현재 사용자 entitlement 조회
- Trial 만료 계산
- 기능 접근 가능 여부 검사
- 사용량 제한 검사
- 사용량 증가 처리

목표:
- 각 API가 구독 로직을 중복 구현하지 않도록 함
- 이후 Stripe 연동 시 entitlement 갱신만 연결하면 앱 전체에서 재사용 가능하게 함

---

## API 반영 대상

### 기존 API에 추가될 제한 검사
- `POST /api/items`
  - 아이템 생성 전 플랜 한도 확인

- `POST /api/locations`
  - 위치 생성 전 플랜 한도 확인

- `POST /api/uploads/presign`
  - 업로드 월간 제한 확인

### 신규 API
- `GET /api/account/plan`
  - 현재 플랜, trial 상태, 사용량, 제한값 조회

- `GET /api/account/family-invites`
  - 내 초대 목록 조회

- `POST /api/account/family-invites`
  - Family 사용자만 초대 생성 가능

- `POST /api/account/family-invites/accept`
  - 초대 수락 상태 기록

주의:
- 1차에서는 초대 수락 후에도 공유 데이터 권한까지 바로 연결하지 않음

---

## 설정 화면 반영

설정 화면에 `플랜 및 멤버십` 섹션을 추가한다.

표시 항목:
- 현재 플랜명
- Trial 여부 및 종료일
- 사용량 현황
- 플랜별 제한 정보
- 업그레이드 CTA
- Family 초대 관리

1차에서 업그레이드 CTA는 실제 결제가 아니라 아래 중 하나로 처리한다.
- `결제 준비 중`
- `문의하기`
- `출시 예정`

---

## UX 정책

### 제한 도달 시
사용자가 Free 한도를 초과해 새 데이터를 만들려고 하면:
- 생성은 차단
- 현재 사용량과 한도를 함께 안내
- 업그레이드 CTA 제공

### 한도 초과 상태의 기존 데이터
Trial 종료 또는 플랜 변경으로 Free 한도보다 많은 데이터를 이미 가진 경우:
- 기존 데이터는 유지
- 조회 가능
- 수정 가능
- 삭제 가능
- 새 생성만 차단

이 정책은 기존 사용자 반발을 줄이고 마이그레이션 리스크를 낮추기 위함이다.

---

## 후속 단계

다음 단계에서 연결할 수 있는 항목:
- Stripe Checkout
- Billing Portal
- Webhook 기반 entitlement 동기화
- 결제 성공/실패/해지 상태 반영
- Family 멤버 entitlement 연결
- 공유 인벤토리 및 공동 편집
- B2C/B2B 혼합 플랜 확장

---

## 결정 사항 요약

확정된 방향:
- 플랜 구조: `Free + Pro + Family`
- 제한 방식: 기능 제한 + 사용량 제한 혼합형
- 이번 단계 목표: 구조 먼저, 결제 다음
- 기존 사용자 정책: `30일 Pro Trial`
- Family 1차 범위: 초대 구조만 우선

보류된 항목:
- 실제 결제 사업자
- 청구 주기
- 가격 정책
- 환불/취소 정책
- Family 공유 편집 상세 정책
