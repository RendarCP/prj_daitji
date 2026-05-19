# remove-unused-pages

## Status
- Branch: `feature/20260516_remove-unused-pages`
- Created: 2026-05-16
- Owner: Codex

## Problem
실험용 페이지 라우트가 남아 있어 앱의 공개 라우트 표면이 불필요하게 넓다. `scan`과 `notification/test`는 유지하면서 현재 직접 사용하지 않는 실험 라우트만 제거한다.

## Scope
- In:
  - `/explorer-ex` 라우트 제거.
  - `/explorer-v2` 직접 페이지 라우트 제거.
  - `/explorer-v2` 활성 표시용 BottomNav 특수 처리 제거.
- Out:
  - `/scan` 페이지.
  - `/settings/notifications/test` 페이지.
  - `/explorer`에서 사용하는 `ExplorerV2Client`.
  - API route 정리.

## Ambiguity Loop

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | 빌드 라우트 목록에서 `/explorer-ex`, `/explorer-v2`가 사라지고 `/scan`, `/settings/notifications/test`는 유지된다. | Resolved |
| What must not change? | `/scan`, `/settings/notifications/test`, `/explorer`, `ExplorerV2Client` 동작은 유지한다. | Resolved |
| What is hard to test directly? | 실제 사용 여부는 런타임 분석이 아니라 코드 참조 기준으로 판단한다. | Resolved |

## Agent Team
- Planner Agent: 범위와 제외 범위 확정.
- Test Agent: 라우트 참조 검색과 빌드 라우트 목록 확인.
- Frontend Agent: 미사용 라우트 파일과 네비게이션 특수 처리 제거.
- QA Agent: 유지해야 하는 라우트가 빌드에 남는지 확인.
- Reviewer Agent: 삭제 범위가 합의 밖으로 넓어지지 않았는지 확인.

## TDD Plan
Before implementation, add or define one behavior test or automation check. Then use vertical slices: failing check, smallest implementation, repeat.

| Order | Behavior | Test or automation | Notes |
| --- | --- | --- | --- |
| 1 | 삭제 대상 라우트가 코드에서 직접 참조되지 않는다. | `rg` 참조 검색 | `/scan`, `/settings/notifications/test`는 유지 대상. |
| 2 | 제거 후 빌드 라우트 목록에서 실험 라우트만 사라진다. | `npm run workflow:verify` | 빌드 출력 확인. |

## Implementation Notes
- Affected routes: `/explorer-ex`, `/explorer-v2`
- Affected components: `components/layout/BottomNav.tsx`
- Affected lib/server modules: none
- Data or migration changes: none

## QA Plan
- Automated checks: `npm run workflow:verify`
- Browser checks: not required; no retained user flow is changed.
- API checks: none.

## QA Notes
- `rg`로 `/explorer-ex`, `/explorer-v2` 직접 라우트 참조 제거를 확인했다.
- `/scan`은 `app/scan/page.tsx`와 Header 진입 링크가 유지된다.
- `/settings/notifications/test` 페이지와 API route는 유지된다.
- `npm run workflow:verify` passed after clearing stale `.next` route types and rerunning with escalated permissions for Turbopack build.
- Build route output no longer includes `/explorer-ex` or `/explorer-v2`; it still includes `/scan` and `/settings/notifications/test`.

## Commit Plan
- Suggested commit: `refactor: remove unused experimental pages`
