# Library Guidelines

## Scope
Applies to shared logic under `lib/`: hooks, Supabase clients, server data access, API helpers, validations, types, and utilities.

## Rules
- Keep public interfaces small and testable; avoid leaking database or UI details into unrelated modules.
- Prefer path alias imports (`@/*`).
- Use existing query-key, validation, and API error helpers before creating new variants.
- Hooks must keep server state in TanStack Query where appropriate and avoid duplicating derived state in effects.
- Shared utilities should be deterministic and easy to exercise with behavior-level tests.

## Verification
- Run `npm run type-check`.
- Add focused tests or script-level automation for shared behavior because these modules have broad blast radius.
