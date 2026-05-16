# Test Convention

- Feature work starts with one behavior test or automation check before implementation.
- Prefer behavior-level checks through public interfaces.
- Use mock-backed checks only when the real dependency is impractical.
- Record untested areas, reasons, and substitute checks in the plan.
- Run `npm run test:workflow` after workflow script changes.
- Run `npm run workflow:verify` before PR readiness.
