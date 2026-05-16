# Feature Workflow

## Flow
```txt
User
  -> Main Agent
  -> Planner Agent
  -> Agent Execution Plan
  -> Test Agent
  -> Backend Agent and/or Frontend Agent
  -> Infra Agent when needed
  -> QA Agent
  -> Reviewer Agent
  -> Main Agent
  -> User
```

## Start
Run:

```bash
npm run workflow:new -- <feature-slug>
```

The workflow creates or switches to `feature/{YYYYMMDD}_{feature-slug}` and creates `docs/plans/<feature-slug>.md`.

## Plan Gate
Implementation can start only when Planner Agent confirms:
- concrete scope and non-goals,
- resolved or explicitly deferred ambiguity log,
- TDD checklist,
- QA plan,
- agent-team assignment,
- active branch matching `feature/{YYYYMMDD}_{feature-slug}`.

## Test-First Gate
Test Agent defines or adds the first failing behavior test or automation check before Backend Agent or Frontend Agent implementation.

## Agent Selection
| Work Type | Agents |
| --- | --- |
| UI change | Test, Frontend, QA, Reviewer |
| API addition | Test, Backend, Reviewer |
| DB change | Test, Backend, Reviewer |
| Deployment impact | Infra, Reviewer |
| User flow change | Test, Backend, Frontend, QA, Reviewer |
| Auth or permission change | Test, Backend, Frontend, QA, Reviewer |
| Performance improvement | Related Agent, Test, Reviewer |
| Refactor | Related Agent, Test, Reviewer |
| Release prep | Infra, QA, Test, Reviewer |
