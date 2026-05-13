# App Router Guidelines

## Scope
Applies to `app/` pages, layouts, route handlers, loading/error boundaries, and page-level client components.

## Rules
- Keep route files thin. Move shared data access to `lib/server`, `lib/api`, or domain helpers.
- Prefer Server Components by default; use `"use client"` only for browser APIs, local interaction state, or client hooks.
- Route handlers must export explicit HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) and return structured errors through shared API utilities when available.
- Preserve App Router conventions: colocate `loading.tsx`, `error.tsx`, `not-found.tsx`, and modal routes with their route segment.
- Before implementation, update the active `docs/plans/*.md` with affected routes, expected behavior, and UI/API acceptance checks.

## Verification
- Run `npm run type-check` for route or data-flow changes.
- Run Playwright MCP for user-facing navigation, modal, form, or visual-state changes.
