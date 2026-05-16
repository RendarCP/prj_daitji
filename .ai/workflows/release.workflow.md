# Release Workflow

## Flow
```txt
Main Agent -> Planner Agent -> Infra Agent -> Test Agent -> QA Agent -> Reviewer Agent -> Main Agent
```

## Rules
- Infra Agent reviews environment variables, deployment impact, monitoring, and rollback.
- Test Agent confirms automated release checks.
- QA Agent confirms release scenarios and unresolved risks.
- Reviewer Agent gives the final release-readiness judgment.
