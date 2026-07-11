# ADR-001: Supabase PostgreSQL
**Status:** Accepted
## Decision
Use Supabase PostgreSQL as the first durable provider behind repository interfaces. Memory remains the default demo provider.
## Consequences
PostgreSQL supplies constraints, migrations, transactions, and RLS. Provider-specific rows remain isolated from domain contracts. Authentication and production deployment are separate decisions.
