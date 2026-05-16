# multi-agent-development-structure

## Status
- Branch: `feature/20260516_multi-agent-development-structure`
- Created: 2026-05-16
- Owner: Codex

## Problem
기능 개발 요청이나 PRD가 들어왔을 때 Main Agent가 모든 구현과 검증을 직접 처리하면 컨텍스트가 커지고 책임이 섞인다. 프로젝트에는 이미 전문 에이전트 문서가 있지만, Planner가 작업을 나누고 Sub Agent가 구조화된 결과만 반환하는 공통 실행 구조, 브랜치 제한, 테스트 우선 규칙이 아직 명시되어 있지 않다.

## Scope
- In:
  - `.ai/` 기반 멀티 에이전트 운영 문서, 스키마, 워크플로우, 컨텍스트 파일을 추가한다.
  - 기존 `docs/agents/` 전문 에이전트 문서를 Main/Planner/Frontend/Backend/Infra/Test/QA/Reviewer 책임 구조에 맞게 정리한다.
  - 기능 브랜치는 `feature/{YYYYMMDD}_{feature-slug}` 형식으로 생성 또는 전환하도록 워크플로우 스크립트와 테스트를 수정한다.
  - 구현 단계는 테스트 또는 자동화 체크를 먼저 작성한 뒤 Backend/Frontend 구현으로 넘어가도록 문서와 계획 템플릿을 수정한다.
- Out:
  - 실제 제품 기능 구현.
  - 외부 에이전트 런타임이나 별도 오케스트레이션 도구 도입.
  - GitHub Actions, 배포 설정, Supabase 스키마 변경.

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | 사용자는 프로젝트 문서에서 Main -> Planner -> Sub Agent -> Reviewer/QA 흐름, 결과 스키마, 최종 보고 형식을 확인할 수 있어야 한다. | Resolved |
| What must not change? | 기존 `npm run workflow:new -- <feature-slug>` 진입점과 `docs/plans/<feature-slug>.md` 계획 파일 위치는 유지한다. | Resolved |
| What is hard to test directly? | 에이전트 실제 위임 품질은 런타임이 없어서 직접 검증하기 어렵다. 문서 스키마와 워크플로우 브랜치 생성 규칙은 자동화로 검증한다. | Resolved |
| How should Planner gate implementation? | Planner는 활성 브랜치가 `feature/{YYYYMMDD}_{feature-slug}` 형식이고 계획 문서가 구체화된 경우에만 구현 단계로 넘긴다. | Resolved |
| What comes before frontend implementation? | Test Agent가 요구사항 기반 실패 테스트 또는 자동화 체크를 먼저 정의/추가한 뒤 Frontend Agent가 구현한다. | Resolved |

## Agent Team
- Main Agent: 사용자 요청 수신, Planner 호출, Sub Agent 결과 취합, 최종 보고.
- Planner Agent: 요구사항 분석, 실행 계획 생성, `feature/{YYYYMMDD}_{feature-slug}` 브랜치 게이트 확인.
- Test Agent: 구현 전 테스트/자동화 체크를 먼저 정의하고 워크플로우 테스트를 갱신.
- Frontend Agent: UI 영향이 있을 때 Test Agent 산출물 이후 구현.
- Backend Agent: API/DB/서버 로직 영향이 있을 때 구현.
- Infra Agent: 환경변수, 배포, 운영 영향 검토.
- QA Agent: 사용자 관점 체크리스트와 릴리즈 가능 여부 정리.
- Reviewer Agent: 에이전트 결과 충돌, 누락, 보안/성능/유지보수 리스크 검토.

## TDD Plan
Use vertical slices: one behavior check, smallest implementation, repeat.

| Order | Behavior | Test or automation | Notes |
| --- | --- | --- | --- |
| 1 | `workflow:new`이 날짜 포함 브랜치 `feature/{YYYYMMDD}_{slug}`를 생성한다. | `npm run test:workflow`의 브랜치 assertion 수정 | 구현 전 실패하도록 먼저 변경한다. |
| 2 | 계획 템플릿이 테스트 우선 실행 순서와 멀티 에이전트 팀을 포함한다. | `npm run test:workflow`에서 계획 파일 주요 문구 grep | 문서 템플릿 회귀 방지. |
| 3 | `.ai/`와 `docs/agents/` 문서가 공통 결과/최종 요약 스키마를 제공한다. | 파일 존재 및 주요 섹션 수동 확인 | 에이전트 런타임이 없어 문서 산출물 검증으로 대체. |

## Implementation Notes
- Affected routes: none
- Affected components: none
- Affected lib/server modules: none
- Data or migration changes: none
- Affected workflow scripts: `scripts/new-feature.sh`, `scripts/plan-feature.sh`, `scripts/test-workflow-scripts.sh`
- Affected docs: `AGENTS.md`, `docs/AGENTS.md`, `docs/process/feature-workflow.md`, `docs/agents/*`, `.ai/**`

## QA Plan
- Automated checks: `npm run test:workflow`
- Broader verification: `npm run workflow:verify` when time permits because it also runs lint, type-check, and build.
- Browser checks: none, no user-facing UI changed.
- API checks: none.

## QA Notes
- `npm run test:workflow` passed after adding the dated feature branch assertion and wrong-branch commit rejection.
- `npm run workflow:verify` first failed in the sandbox during Turbopack build because creating a process and binding to a port was not permitted.
- `npm run workflow:verify` passed after rerunning with escalated permissions: workflow tests, lint, type-check, and production build completed successfully.

## Commit Plan
- Suggested commit: `feat: multi-agent-development-structure`
