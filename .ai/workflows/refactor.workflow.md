# Refactor Workflow

## Flow
```txt
Main Agent -> Planner Agent -> Test Agent -> Related Agent -> Reviewer Agent -> Main Agent
```

## Rules
- Planner Agent must state the invariant behavior that must not change.
- Test Agent identifies existing coverage or adds a characterization check before refactoring.
- Related Agent keeps public behavior stable.
- Reviewer Agent checks scope creep, shallow abstractions, and maintainability risk.
