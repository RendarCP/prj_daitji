# README refresh

## Status
- Branch: `feature/readme-refresh`
- Created: 2026-05-13
- Owner: Codex

## Problem
README가 현재 구현 상태와 맞지 않는다. 존재하지 않는 `.env.local.example`, 오래된 로드맵, 누락된 workflow 명령, 최신 인증/알림/스캔/업로드 기능이 반영되지 않아 새 세션이나 기여자가 프로젝트를 잘못 이해할 수 있다.

## Scope
- In:
  - 현재 앱 기능, 라우트, API 라우트, 개발 명령어 정리.
  - 새 workflow 스크립트와 TDD/QA/커밋 절차 반영.
  - 존재하는 문서 링크 중심으로 README 문서 목록 정리.
  - 프로젝트 상태와 로드맵 최신화.
- Out:
  - 앱 코드 변경.
  - 새로운 환경 변수 예시 파일 추가.
  - 스크린샷 생성 또는 디자인 변경.

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | README를 열었을 때 현재 기능, 설치, workflow, 검증 방법을 바로 알 수 있어야 한다. | Resolved |
| What must not change? | 런타임 앱 코드, DB 스키마, 기존 workflow 스크립트는 변경하지 않는다. | Resolved |
| What is hard to test directly? | README 링크/설명의 완전한 의미 검증은 자동화하지 않고, 존재하는 파일/라우트 기준으로 수동 대조한다. | Resolved |

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
| 1 | README가 현재 workflow 명령을 안내한다. | README 내용 확인 + `npm run test:workflow` | 스크립트 자체 동작 검증. |
| 2 | README가 존재하는 주요 문서를 링크한다. | 파일 경로 수동 대조 | 존재하지 않는 오래된 docs 링크 제거. |
| 3 | README가 최신 라우트/API를 요약한다. | `find app` 결과와 대조 | 세부 API 스펙 문서는 범위 밖. |

## Implementation Notes
- Affected routes: none.
- Affected components: none.
- Affected lib/server modules: none.
- Data or migration changes: none.
- Affected docs: `README.md`, `docs/plans/readme-refresh.md`.

## QA Plan
- Automated checks: `npm run workflow:verify`
- Browser checks: Playwright MCP pass using `docs/process/playwright-mcp-qa.md`
- API checks: not applicable.

## QA Notes
- `npm run test:workflow` passed.
- `npm run workflow:verify` passed: workflow tests, lint, type-check, and build.
- Playwright MCP browser QA is not applicable because this change only updates documentation.

## Commit Plan
- Suggested commit: `docs: refresh README`
