# Bugfix Workflow

## Flow
```txt
Main Agent -> Planner Agent -> Test Agent -> Related Agent -> QA Agent -> Reviewer Agent -> Main Agent
```

## Rules
- Reproduce the bug with a failing test, automation check, or documented manual step before fixing.
- Planner Agent narrows scope to the observed failure and expected behavior.
- Related Agent changes only the affected area.
- Reviewer Agent checks regression risk and test coverage.
