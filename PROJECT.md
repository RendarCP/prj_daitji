# 🏠 DAITJI (다있지) - 하이브리드 앱 통합 기획서

> **"우리 집 모든 물건, 어디 있는지 다 있지!"**
> Next.js 기반의 웹 뷰와 React Native 네이티브 기능을 결합하여 집안 물건의 위치와 수명을 관리하는 하이브리드 서비스입니다.

---

## 📅 단계별 개발 계획 (Roadmap)

### 1차 계획: 핵심 로직 및 MVP 개발

- [ ] **Next.js 기반 웹 개발 및 RN 웹뷰 포팅**
- [ ] **Supabase DB 생성 및 연동**: 추후 인증 확장을 고려한 스키마 설계
- [ ] **기초 재고 관리 로직**:
  - [ ] 재고 등록 및 수정 기능
  - [ ] 재고 목록 확인 (필터 및 정렬)
  - [ ] 유통기한 확인 및 상태 표시 (신선/임박/만료)
  - [ ] 유통기한 임박 물품 대시보드 알림 (UI 기반)

### 2차 계획: 인증 및 위치 시스템 확장

- [ ] **사용자 인증 시스템 (Auth)**:
  - [ ] 구글 로그인 연동
  - [ ] 카카오 로그인 연동
  - [ ] 이메일/비밀번호 로그인 구현
- [ ] **위치 시스템 고도화**:
  - [ ] 집 내부 방(Room) 생성 및 관리 로직 개발
  - [ ] [방 - 가구 - 세부칸] 계층형 위치 관리 시스템 구축
  - [ ] 재고 물품과 위치 정보 연동 (위치별 물품 조회)

### 3차 계획: AI 스캐너 및 서비스 고도화

- [ ] **스마트 스캐너 시스템**:
  - [ ] **Open Food Facts**: 바코드 인식을 통한 물품 정보 자동 획득
  - [ ] **Google Cloud Vision / ML Kit**: AI OCR을 이용한 유통기한 날짜 자동 추출
- [ ] **AI 지능형 서비스**:
  - [ ] **"오늘 뭐 먹지?"**: 현재 재고 기반 AI 레시피 추천 및 메뉴 제안 기능

---

## 🗄️ 데이터베이스 설계 (Supabase / PostgreSQL)

### 1. locations (계층형 위치)

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- 2차 계획 시 활성화
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_level_hierarchy CHECK (
    (level = 1 AND parent_id IS NULL) OR
    (level > 1 AND parent_id IS NOT NULL)
  )
);
```

### 2. items (물품 정보)

```sql
CREATE TYPE item_type AS ENUM ('FOOD', 'COSMETIC', 'MEDICINE', 'GENERAL');
CREATE TYPE item_status AS ENUM ('ACTIVE', 'CONSUMED', 'EXPIRED', 'DISCARDED');

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  type item_type NOT NULL DEFAULT 'GENERAL',
  status item_status NOT NULL DEFAULT 'ACTIVE',
  barcode TEXT,
  image_url TEXT,
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb, -- expiry_date, opened_date 등 저장
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 만료일 자동 계산 컬럼
  computed_expiry_date DATE GENERATED ALWAYS AS (
    CASE
      WHEN type = 'FOOD' THEN (metadata->>'expiry_date')::DATE
      WHEN type = 'COSMETIC' AND metadata->>'opened_date' IS NOT NULL
        THEN ((metadata->>'opened_date')::DATE + (COALESCE((metadata->>'pao')::INTEGER, 12) || ' months')::INTERVAL)::DATE
      ELSE NULL
    END
  ) STORED
);
```

---

## 📱 주요 화면 설계 (View Specification)

1. **Dashboard (`/dashboard`)**:

   - 1차: 유통기한 임박 물품(D-Day) 리스트 및 전체 재고 요약.
   - 2차: 등록된 방(위치) 별 바로가기 카드.

2. **Explorer (`/explorer`)**:

   - 계층형 위치 탐색 (Breadcrumbs 지원).
   - 선택된 위치의 하위 구역 및 보관 물품 리스트업.

3. **Scanner (`/scan`)**:

   - 3차 개발 핵심 화면. 바코드 스캔 및 OCR 촬영 레이어.
   - 인식된 정보를 바탕으로 한 자동 입력 폼 제공.

4. **Item Detail (`/item/[id]`)**:
   - 물품 상세 정보, 메모, 태그 수정.
   - 위치 이동 이력 및 상태 변경 기능.

---

## 🛠️ 기술적 브릿지 (Hybrid 연동)

- **WebView**: Next.js 페이지를 RN `react-native-webview`를 통해 렌더링.
- **Bridge**:
  - `window.ReactNativeWebView.postMessage`: 웹에서 네이티브(카메라/알림) 호출.
  - `onMessage`: 네이티브에서 웹으로 스캔 데이터 전달.

---

**DAITJI v1.0** | 2026-02-02 작성
