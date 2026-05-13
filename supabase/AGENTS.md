# Supabase Guidelines

## Scope
Applies to migrations, seed SQL, RLS policy changes, and generated database types.

## Rules
- Place schema changes in `supabase/migrations/` with a clear, ordered migration name.
- Keep RLS policies explicit and verify user ownership boundaries.
- Regenerate database types with `npm run db:types` after schema changes.
- Document migration impact and required environment changes in the active plan document.

## Verification
- Run local Supabase migrations when possible: `npm run db:start`, then `npm run db:migration:up`.
- Run `npm run type-check` after regenerating DB types.
