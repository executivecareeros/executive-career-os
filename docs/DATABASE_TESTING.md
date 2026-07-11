# Database Testing

> Purpose: Explain the lightweight, repeatable database verification workflow.

## Test layers

- `npm run validate:database`: static migration, seed, policy, trigger, and secret checks.
- `npm run test:database`: live catalog, seed idempotency, constraints, and append-only behavior.
- `npm run test:rls`: transactional fictional identity and workspace isolation matrix.
- `npm run test:repositories`: mapper and provider-mode contract checks.

Runtime commands fail non-zero when Docker or local Supabase is unavailable and never print credentials. For clean-bootstrap evidence, reset twice before running them.

These tests prove database and adapter foundations, not production authentication. Authenticated PostgREST CRUD remains deferred until a cookie-backed session provider exists; no service-role workaround is permitted.
