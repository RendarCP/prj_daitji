# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, route handlers, and loading/error boundaries.
- `app/api/*/route.ts`: REST endpoints for items, locations, and dashboard stats.
- `components/`: UI and feature components (`ui/`, `features/`, `layout/`).
- `lib/`: shared logic (`supabase/`, `hooks/`, `validations/`, `types/`, `utils/`, `api/`).
- `supabase/migrations/`: schema and seed SQL files; `scripts/generate-types.sh` updates DB types.
- `docs/`: implementation and API references (see `docs/API-TESTING-GUIDE.md` for endpoint checks).

## Build, Test, and Development Commands
- `npm run dev`: start local Next.js dev server (`http://localhost:3000`).
- `npm run build`: production build validation.
- `npm run start`: run built app.
- `npm run lint`: run ESLint (`next/core-web-vitals`).
- `npm run type-check`: strict TypeScript check (`tsc --noEmit`).
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
- There is no dedicated unit test runner configured yet.
- Minimum pre-PR checks: `npm run lint`, `npm run type-check`, `npm run build`.
- For API changes, run manual endpoint verification from `docs/API-TESTING-GUIDE.md` (curl sequence).
- Add tests with any new test framework; colocate as `*.test.ts(x)` near target modules.

## Commit & Pull Request Guidelines
- Follow Conventional Commits, as used in history: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`.
- Keep commits scoped and descriptive (one logical change per commit).
- PRs should include:
  - concise summary and rationale,
  - linked issue/task,
  - screenshots or short recordings for UI changes,
  - notes on migrations/env updates (`.env.local`, `supabase/migrations/*`).
