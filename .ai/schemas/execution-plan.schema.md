# Agent Execution Plan Schema

Planner Agent must produce this structure before implementation starts.

```md
# Agent Execution Plan

## 1. 기능 요약

## 2. 요구사항 해석

## 3. 기능 범위

## 4. 제외 범위

## 5. 프로젝트 영향 범위

## 6. 필요한 에이전트

## 7. 작업 순서

## 8. 에이전트별 작업 지시서

### 8.1 Frontend Agent Task

### 8.2 Backend Agent Task

### 8.3 Infra Agent Task

### 8.4 Test Agent Task

### 8.5 QA Agent Task

### 8.6 Reviewer Agent Task

## 9. 에이전트 간 의존성

## 10. 완료 기준

## 11. 테스트 전략

## 12. QA 기준

## 13. 리스크

## 14. Main Agent 전달 요약
```

## Mandatory Gates
- Active branch must match `feature/{YYYYMMDD}_{feature-slug}` before implementation.
- The plan must have concrete scope, ambiguity log, TDD checklist, QA plan, and agent-team assignment.
- Test Agent must define or add the first failing behavior check before Frontend Agent implementation.
