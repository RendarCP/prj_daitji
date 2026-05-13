# Agent workflow automation

## Status
- Branch: `feature/agent-workflow-automation`
- Created: 2026-05-13
- Owner: Codex

## Problem
새 기능 세션이 계획 없이 바로 구현되거나 `main`에서 커밋되는 흐름을 막아야 한다. 또한 폴더별 에이전트 지침, 역할별 전문가 문서, TDD/QA/커밋 자동화가 분리되어 반복 가능한 개발 절차로 실행되어야 한다.

## Scope
- In:
  - 폴더별 `AGENTS.md` 분리.
  - 새 기능 브랜치와 계획 문서를 생성하는 workflow 스크립트.
  - 계획 문서 템플릿에 모호함 제거 루프, TDD 계획, QA 계획, 에이전트 팀 배정 포함.
  - `main`/`master` 커밋 차단과 Conventional Commit 검증.
  - workflow 스크립트 자체 자동화 테스트.
  - Playwright MCP QA 절차 문서화.
- Out:
  - 실제 Playwright 테스트 러너 도입.
  - Git hook 설치 강제.
  - 기존 기능 코드 리팩터링.

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | `npm run workflow:new -- <slug>`가 `feature/<slug>` 브랜치와 `docs/plans/<slug>.md`를 만든다. | Resolved |
| What must not change? | 기존 앱 코드, DB 스키마, 런타임 UI는 건드리지 않는다. | Resolved |
| What is hard to test directly? | Playwright MCP 자체 실행은 MCP 환경 의존성이 있어 문서화하고, workflow shell 동작은 임시 git 저장소로 자동화 테스트한다. | Resolved |

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
| 1 | 새 기능 시작 시 브랜치와 계획 문서가 생성된다. | `scripts/test-workflow-scripts.sh` | 임시 git 저장소에서 검증. |
| 2 | 중복 계획 생성은 실패한다. | `scripts/test-workflow-scripts.sh` | 기존 계획 덮어쓰기 방지. |
| 3 | 잘못된 커밋 메시지는 실패한다. | `scripts/test-workflow-scripts.sh` | Conventional Commits 강제. |
| 4 | `main` 브랜치 커밋은 실패한다. | `scripts/test-workflow-scripts.sh` | 자동 커밋 안전장치. |

## Implementation Notes
- Affected routes: none.
- Affected components: none.
- Affected lib/server modules: none.
- Data or migration changes: none.
- Affected docs: root and folder-scoped `AGENTS.md`, `docs/agents/*`, `docs/process/*`.
- Affected scripts: `scripts/workflow-lib.sh`, `scripts/new-feature.sh`, `scripts/plan-feature.sh`, `scripts/commit-feature.sh`, `scripts/verify-feature.sh`, `scripts/test-workflow-scripts.sh`.

## QA Plan
- Automated checks: `npm run workflow:verify`
- Browser checks: Playwright MCP pass using `docs/process/playwright-mcp-qa.md`
- API checks: not applicable.

## QA Notes
- `npm run test:workflow` passed.
- `npm run workflow:verify` passed workflow tests, lint, and type-check inside the sandbox.
- `npm run workflow:verify` build step hit a sandbox-only Turbopack process/port permission error.
- `npm run build` passed when rerun with elevated permissions.
- Playwright MCP browser QA is not applicable because this change has no UI runtime behavior.

## Commit Plan
- Suggested commit: `chore: add agent workflow automation`
