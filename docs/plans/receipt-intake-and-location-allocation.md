# DAITJI 영수증 인식 기반 품목 분배 계획

## 목적

현재 DAITJI는 `items`, `locations`, `scan`, Supabase 기반 API가 이미 갖춰져 있다.
따라서 영수증 기능은 새로운 재고 시스템을 별도로 만드는 방식보다, 기존 구조에 `영수증 업로드 -> OCR -> 품목 구조화 -> 위치 추천 -> 사용자 확인 -> 저장` 파이프라인을 추가하는 방식이 맞다.

이 문서는 모바일 사진 중심의 한국어 종이 영수증을 읽고, 관련 품목을 위치 기준으로 반자동 분배하는 기능의 기술 방향과 구현 범위를 정의한다.

---

## 전제

- 입력은 `모바일 사진`이 중심이다.
- 영수증 이미지를 외부 OCR/AI 서비스로 보내는 것이 가능하다.
- 1차 버전은 `반자동 분배`를 목표로 한다.
- 위치 추천은 `규칙 우선`, `AI fallback` 구조로 설계한다.
- 최종 저장 전에는 반드시 사용자 확인 단계를 둔다.

---

## 권장 기술 조합

### 1. OCR

추천 우선순위는 아래와 같다.

- 1순위: `Google Document AI`
- 2순위: `AWS Textract AnalyzeExpense`

일반 OCR보다 영수증 전용 파서가 유리한 이유는 다음과 같다.

- line item 단위 추출이 더 안정적이다.
- 상호명, 결제일, 총액, 개별 품목 구분 정확도가 높다.
- 후단 구조화 처리에 필요한 문서 구조를 더 잘 보존한다.

1차 기본안은 `Google Document AI`를 우선 추천한다.

- 영수증/문서 구조 추출 품질이 좋다.
- OCR 결과를 후단 LLM 입력으로 넘기기 수월하다.
- 모바일 사진 기반 입력에 적용하기 좋다.

### 2. 품목 구조화 및 정규화

OCR 결과는 그대로 저장하지 않고, 서버에서 `OpenAI Responses API`로 한 번 더 정규화한다.

이 단계의 목적은 다음과 같다.

- OCR이 읽어낸 line item을 사용 가능한 품목 데이터로 변환
- 축약된 영수증 표기를 사용자 친화적 이름으로 보정
- 수량, 브랜드, 카테고리 후보를 정리
- 앱 내부 `item type`으로 매핑

권장 출력 스키마는 아래와 같다.

- `merchant_name`
- `purchased_at`
- `line_items[]`
- 각 항목:
  - `raw_text`
  - `normalized_name`
  - `quantity`
  - `brand`
  - `candidate_type`
  - `confidence`

`candidate_type`은 기존 앱 enum에 맞춰 아래 값으로 고정한다.

- `FOOD`
- `COSMETIC`
- `MEDICINE`
- `GENERAL`

### 3. 위치 분배 로직

위치 추천은 AI가 단독으로 결정하지 않고, 내부 규칙 엔진을 먼저 적용한다.

권장 순서는 아래와 같다.

1. `item type -> 기본 위치` 규칙
2. `keyword/category -> 위치` 규칙
3. 동일 또는 유사 품목의 최근 저장 위치 조회
4. 그래도 모호하면 LLM fallback 추천

LLM fallback 입력에는 아래 정보를 포함한다.

- 품목명
- 브랜드
- 추정 타입
- 영수증 문맥
- 사용자의 `location` 트리
- 최근 유사 품목 저장 이력

LLM 출력은 아래 형태로 제한한다.

- `recommended_location_id`
- `reason`
- `confidence`

### 4. 저장소 및 앱 구조

- 저장소는 기존 `Supabase`를 그대로 사용한다.
- 최종 품목 저장은 기존 `items` 테이블을 재사용한다.
- 위치 정보는 기존 `locations` 계층 구조를 그대로 활용한다.
- UI는 기존 Next.js App Router 구조에 영수증 리뷰 흐름을 추가한다.

---

## 처리 플로우

### 1. 업로드/촬영

- 사용자가 영수증 사진을 업로드하거나 촬영한다.
- 이미 있는 업로드 방식과 유사하게 서버에 원본 이미지 저장 경로를 확보한다.
- 업로드 직후 `receipt` 레코드를 생성해 처리 상태를 추적한다.

### 2. OCR 실행

- 서버가 영수증 이미지를 OCR 서비스에 전달한다.
- OCR 결과 원문과 구조화된 line item 후보를 함께 저장한다.
- OCR 실패 시 재시도 가능한 상태로 남긴다.

### 3. 품목 정규화

- OCR line item을 OpenAI에 전달해 정규화된 품목 목록으로 변환한다.
- 축약된 상품명을 사람이 이해하기 쉬운 이름으로 보정한다.
- 수량이 불명확한 경우 기본값 `1`로 두고 `confidence`를 낮게 둔다.

### 4. 위치 추천

- 규칙 엔진으로 우선 위치를 추천한다.
- 규칙이 충돌하거나 후보가 없을 때만 AI fallback을 호출한다.
- 각 품목에 대해 추천 위치와 confidence를 계산한다.

### 5. 사용자 리뷰

- 사용자가 품목명, 수량, 타입, 추천 위치를 검토한다.
- confidence가 낮은 항목은 UI에서 더 눈에 띄게 표시한다.
- 사용자는 각 품목을 수정하거나 제외할 수 있어야 한다.

### 6. 최종 저장

- 사용자가 확인한 항목만 `items`에 저장한다.
- 저장 시 `receipt`와 연결 정보를 `metadata`에 남긴다.
- 저장 완료 후 Items/Explorer에서 즉시 조회 가능해야 한다.

---

## 데이터 모델 및 API 변경안

### 1. 신규 테이블

`receipts` 테이블을 추가한다.

권장 저장 항목은 아래와 같다.

- `id`
- `user_id`
- `image_url`
- `status`
- `merchant_name`
- `purchased_at`
- `ocr_payload`
- `normalized_payload`
- `created_at`
- `updated_at`

`status` 예시는 아래 정도면 충분하다.

- `UPLOADED`
- `OCR_DONE`
- `NORMALIZED`
- `REVIEW_READY`
- `COMPLETED`
- `FAILED`

### 2. 기존 items 활용 방식

기존 `items` 스키마는 유지하고, `metadata`에 영수증 유래 정보를 추가한다.

예시:

```json
{
  "source": "receipt",
  "receipt_id": "uuid",
  "merchant_name": "이마트",
  "purchase_date": "2026-04-28",
  "ocr_confidence": 0.88
}
```

### 3. 신규 API

1차 버전의 서버 API는 아래 정도로 나누는 것이 적절하다.

- `POST /api/receipts`
  - 업로드 등록
  - 원본 이미지와 receipt 레코드 생성

- `POST /api/receipts/{id}/extract`
  - OCR 실행
  - OCR raw payload 저장

- `POST /api/receipts/{id}/suggest-locations`
  - 정규화 및 위치 추천 실행
  - 리뷰용 line item 결과 생성

- `POST /api/receipts/{id}/commit`
  - 사용자가 수정한 항목을 최종 `items`로 저장

필요 시 조회 API를 추가할 수 있다.

- `GET /api/receipts/{id}`
  - 리뷰 화면 재진입용 상태 조회

---

## 위치 추천 규칙

1차 버전에서는 복잡한 자동화보다 예측 가능한 추천이 중요하다.

우선 적용할 규칙은 아래와 같다.

- `FOOD`
  - 냉장/냉동/팬트리 관련 위치 우선
- `MEDICINE`
  - 구급함/약 보관함 관련 위치 우선
- `COSMETIC`
  - 화장대/욕실/파우치 관련 위치 우선
- `GENERAL`
  - 과거 동일 품목 위치 또는 사용자가 자주 쓰는 기본 보관 위치 우선

추가 규칙 후보:

- `우유`, `계란`, `두부` -> 냉장고
- `라면`, `참치`, `통조림` -> 팬트리
- `타이레놀`, `소화제` -> 구급함
- `샴푸`, `클렌징`, `마스크팩` -> 욕실/화장대

동일 품목 재구매 시에는 최근 저장 위치를 강하게 우선시하는 편이 UX상 유리하다.

---

## 리뷰 UX 원칙

이 기능의 1차 목표는 `정확한 초안 생성`이지 `무인 자동 저장`이 아니다.

따라서 리뷰 화면은 아래 원칙을 따른다.

- 자동 저장하지 않는다.
- confidence가 낮은 항목을 먼저 수정하게 돕는다.
- 위치가 비어 있거나 모호한 항목은 저장 전에 반드시 확인하게 한다.
- 사용자가 개별 항목을 제외할 수 있어야 한다.
- 일괄 저장 전 최종 요약을 보여준다.

추천 UI 요소:

- 영수증 미리보기
- 품목 리스트 편집 영역
- 추천 위치 badge 또는 selector
- confidence 표시
- 저장 제외 토글

---

## 테스트 시나리오

### 영수증 인식

- 한국어 종이 영수증 10장 이상으로 line item 추출률 확인
- 흐리거나 기울어진 사진에서 실패 양상 확인
- 상호명, 날짜, 총액, line item 추출 여부 확인

### 품목 정규화

- 축약 상품명 정규화 여부 확인
- 브랜드명 포함 품목 처리 확인
- 수량 표현 변형 처리 확인
  - `x2`
  - `2입`
  - `1+1`

### 위치 추천

- 기본 type 규칙이 정상 적용되는지 확인
- 유사 품목의 과거 위치가 우선 추천되는지 확인
- 규칙 실패 시에만 AI fallback이 동작하는지 확인

### 사용자 리뷰

- 낮은 confidence 항목이 명확히 표시되는지 확인
- 사용자가 품목명/수량/위치를 수정 가능한지 확인
- 일부 항목 제외 후 나머지만 저장 가능한지 확인

### 실패 시나리오

- OCR timeout
- OCR 결과가 비어 있음
- 추천 위치 없음
- 외부 API 실패
- 중간 단계 이후 재진입 시 상태 복구 가능 여부

---

## 구현 우선순위

### 1차

- receipt 업로드/저장
- OCR 연동
- line item 정규화
- 규칙 기반 위치 추천
- 리뷰 화면
- 최종 `items` 저장

### 2차

- AI fallback 위치 추천 고도화
- 영수증 재처리
- 전자영수증/PDF 지원
- 사용자별 추천 규칙 개인화

---

## 최종 제안

현재 DAITJI 구조에는 `OCR + 구조화 LLM + 규칙 엔진 + AI fallback` 조합이 가장 현실적이다.

정리하면 1차 구현 기본안은 아래와 같다.

- OCR: `Google Document AI`
- 구조화: `OpenAI Responses API`
- 위치 추천: `규칙 우선 + LLM fallback`
- 저장소: `Supabase receipts + items + locations`
- UX: `반자동 리뷰 후 저장`

이 방식은 정확도, 구현 속도, 사용자 통제, 기존 코드 재사용성의 균형이 가장 좋다.
