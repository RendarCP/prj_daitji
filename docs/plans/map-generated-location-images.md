# Map generated location images

## Status
- Branch: `feature/map-generated-location-images`
- Created: 2026-05-13
- Owner: Codex

## Problem
위치 카드/탐색 화면에서 쓰는 기본 위치 이미지는 기존 SVG 프리셋을 가리키고 있다. 새로 생성한 DAITJI 재고관리 콘셉트의 방별 PNG 이미지를 앱 매핑에 연결해야 한다.

## Scope
- In:
  - 생성된 주방, 거실, 침실, 화장실, 서재, 옷방, 기본방 PNG를 `public/images/locations/`에 복사.
  - `lib/utils/location-images.ts`의 프리셋 `src`를 PNG 파일로 변경.
  - 기존 SVG 파일은 삭제하지 않고 보존.
- Out:
  - UI 레이아웃 변경.
  - 이미지 최적화 파이프라인 추가.
  - DB 스키마 변경.

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | 위치 이름이 기존 패턴과 매칭되면 새 PNG 이미지가 반환된다. | Resolved |
| What must not change? | 패턴 매칭 키/라벨과 fallback 동작은 유지한다. | Resolved |
| What is hard to test directly? | 생성 이미지의 시각 품질은 자동화하지 않고 파일 존재와 타입/빌드로 검증한다. | Resolved |

## Agent Team
- 플랜전문가: clarify scope, non-goals, risks, and first slice.
- 테스트전문가: define behavior checks and TDD order.
- 프론트전문가: own UI/interaction design when UI is affected.
- 코드리뷰전문가: review regression risk and test gaps.
- QA전문가: run verification and record QA notes.

## TDD Plan
Use vertical slices: one behavior check, smallest implementation, repeat.

| Order | Behavior | Test or automation | Notes |
| --- | --- | --- | --- |
| 1 | 모든 위치 프리셋이 PNG 경로를 반환한다. | `npm run type-check` | 타입/모듈 사용 검증. |
| 2 | PNG 파일이 public 경로에 존재한다. | `find public/images/locations` | 파일 복사 확인. |

## Implementation Notes
- Affected routes: none.
- Affected components: location image consumers only through existing utility.
- Affected lib/server modules: none.
- Data or migration changes: none.
- Affected utility: `lib/utils/location-images.ts`.
- Added assets: `public/images/locations/*.png`.

## QA Plan
- Automated checks: `npm run workflow:verify`
- Browser checks: not required unless a UI consumer needs visual inspection.
- API checks: not applicable.

## QA Notes
- PNG file validation passed: all seven generated assets are present under `public/images/locations/` as 1672x941 PNG files.
- `npm run type-check` passed.
- `npm run workflow:verify` passed: workflow tests, lint, type-check, and build.

## Commit Plan
- Suggested commit: `feat: map generated location images`
