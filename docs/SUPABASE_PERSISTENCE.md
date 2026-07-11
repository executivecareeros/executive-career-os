# Supabase Persistence
> **Purpose:** Explain the configuration-dependent durable provider while preserving memory-demo operation.
## Modes
`memory-demo` is the default and requires no environment. `supabase` requires a URL and anonymous/publishable key. Missing configuration produces explicit diagnostics and retains safe memory repositories; it never invents a durable connection.
## Client Boundary
Typed PostgREST clients are isolated in `frontend/lib/supabase`. Repository adapters map rows and payloads into authoritative domain models and return `RepositoryResult`; Supabase response objects do not escape. Browser code accepts only anonymous credentials and a future user access token. Service-role credentials are prohibited.
## Authentication Dependency
RLS policies depend on `auth.uid()` and active workspace membership. No authenticated session is fabricated. Until authentication is implemented, configured database access cannot act as an executive.
## Setup
Install the Supabase CLI separately. Copy `.env.example` to an untracked environment file, keep `memory-demo` until local Supabase is ready, run `supabase start`, `supabase db reset`, and `npm --prefix frontend run validate:database`. Then set mode to `supabase` with local URL and anonymous key.
## Current Status
Schema, migrations, seeds, adapters, configuration validation, and static security checks are implemented. Live PostgreSQL, RLS, and repository execution were not run because the CLI/runtime was unavailable.
> Runtime verification: see [SUPABASE_RUNTIME_VERIFICATION.md](./SUPABASE_RUNTIME_VERIFICATION.md). Explicit Supabase mode fails closed when configuration is absent and never silently returns memory repositories.
