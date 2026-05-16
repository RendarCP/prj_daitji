# Final Summary Schema

Main Agent reports the integrated result to the user with this structure.

```md
# 작업 결과

## 1. 요약

## 2. 변경된 영역

## 3. 에이전트별 작업 결과

## 4. 주요 결정사항

## 5. 테스트 결과

## 6. QA 결과

## 7. 남은 리스크

## 8. 다음 액션
```

## Rules
- Summarize Sub Agent results instead of pasting logs.
- Call out blocked work and residual risk directly.
- Include test and QA status even when no UI or API changed.
