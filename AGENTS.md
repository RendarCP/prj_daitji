# Repository Guidelines

이 파일은 저장소 전체 공통 규칙만 둔다. 세부 규칙은 가까운 폴더의 `AGENTS.md`를 우선 적용한다.

## Scoped Instructions
- `app/AGENTS.md`: Next.js App Router, route handlers, page/layout/error/loading boundaries.
- `components/AGENTS.md`: reusable UI and feature components.
- `lib/AGENTS.md`: shared hooks, Supabase access, utilities, validations, types, and API helpers.
- `supabase/AGENTS.md`: migrations, RLS, seed data, generated database types.
- `docs/AGENTS.md`: plans, process documents, specialist agent documents.
- `scripts/AGENTS.md`: workflow automation and shell script rules.

## Mandatory Feature Workflow
- Start every new feature session with `npm run workflow:new -- <feature-slug>`.
- The workflow script must create or switch to `feature/{YYYYMMDD}_{feature-slug}` and create `docs/plans/<feature-slug>.md`.
- Do not implement before the plan document has a concrete scope, ambiguity log, TDD checklist, QA plan, and agent-team assignment.
- Planner Agent must not move from planning to implementation unless the active branch matches `feature/{YYYYMMDD}_{feature-slug}`.
- Test Agent must define or add the first behavior test or automation check before Frontend Agent implementation.
- Commit only through `npm run workflow:commit -- "<type>: <summary>"`; the script blocks commits outside `feature/{YYYYMMDD}_{feature-slug}`.

## Build, Test, and Development Commands
- `npm run dev`: start local Next.js dev server (`http://localhost:3000`).
- `npm run build`: production build validation.
- `npm run start`: run built app.
- `npm run lint`: run ESLint (`next/core-web-vitals`).
- `npm run type-check`: strict TypeScript check (`tsc --noEmit`).
- `npm run workflow:verify`: run workflow script tests plus lint, type-check, and build.
- `npm run db:start` / `npm run db:stop`: start/stop local Supabase.
- `npm run db:migration:up`: apply migrations.
- `npm run db:types`: regenerate database TypeScript types.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`) with strict mode enabled.
- Imports: prefer path alias `@/*` (example: `@/lib/supabase/server`).
- Indentation: 2 spaces; keep modules small and focused.
- Components: PascalCase file and export names (`ItemDetailClient.tsx`).
- Hooks/utilities: camelCase (`useItems.ts`, `format.ts`).
- Route handlers: `route.ts` with explicit `GET/POST/PATCH/DELETE` exports.

## Testing Guidelines
- TDD is required for new feature work: one behavior test or automation check, then the smallest implementation, then repeat.
- When a feature cannot be directly asserted, document the reason in the plan and add the nearest useful automation or mock-backed check.
- Minimum pre-PR checks: `npm run workflow:verify`.
- For user-facing UI changes, also run a Playwright MCP browser pass using `docs/process/playwright-mcp-qa.md`.
- For API changes, run manual endpoint verification from `docs/API-TESTING-GUIDE.md` when available.

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`.
- Keep commits scoped and descriptive.
- Never commit directly on `main` or `master`.
- PRs should include summary/rationale, linked issue/task, screenshots or recordings for UI changes, and migration/env notes.
