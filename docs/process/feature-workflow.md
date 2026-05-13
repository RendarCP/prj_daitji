# Feature Workflow

## Start

```bash
npm run workflow:new -- favorite-locations
```

This creates or switches to `feature/favorite-locations` and creates `docs/plans/favorite-locations.md`.

## Plan First

Implementation starts only after the plan has:
- clear scope and non-goals,
- ambiguity log with resolved or explicitly deferred questions,
- TDD behavior list,
- agent-team assignment,
- QA path with Playwright MCP where UI is affected.

## Implement With TDD

Use vertical slices:
1. Add one behavior test or automation check.
2. Implement the smallest change that passes.
3. Repeat for the next behavior.
4. Refactor only while checks are green.

If direct testing is not practical, write the limitation in the plan and add the closest useful automation or mock-backed check.

## Verify

```bash
npm run workflow:verify
```

For UI work, run a Playwright MCP pass using `docs/process/playwright-mcp-qa.md`.

## Commit

```bash
npm run workflow:commit -- "feat: add favorite locations"
```

The commit script stages changes, validates the Conventional Commit message, and refuses to run on `main` or `master`.
