# Architecture Context

## Stack
- Next.js App Router.
- TypeScript strict mode.
- Supabase for database and auth access.
- TanStack Query for server state where client-side server state is needed.

## Ownership
- `app/`: routes, route handlers, page/layout/loading/error boundaries.
- `components/`: reusable UI and feature components.
- `lib/`: shared hooks, Supabase access, utilities, validations, types, and API helpers.
- `supabase/`: migrations, RLS, seed data, and generated database types.
- `scripts/`: workflow automation.
- `docs/`: plans, process documents, and specialist agent documents.
