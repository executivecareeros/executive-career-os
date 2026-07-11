# Supabase Runtime Verification

> Purpose: Record reproducible runtime evidence for the local persistence and security foundation.

## Decision

**Passed with minor limitations.** A clean local database was built repeatedly from two ordered migrations and a fictional seed. PostgreSQL 15.8 reported 27 public tables, 63 RLS policies, seven append-only triggers, and two security-definer helpers. Supabase CLI 2.109.1 was used with Docker Desktop 29.6.1.

## Outcomes

- Clean reset, ordered migrations, and seed completed repeatedly.
- Direct seed re-execution preserves identity, workspace, and ledger counts.
- The RLS matrix proves workspace isolation, inactive-member denial, compensation permission separation, no-membership denial, and anonymous denial.
- All seven historical tables reject update and delete; an appended correction succeeds.
- Constraints reject duplicate memberships, invalid compensation, duplicate ledger sequences, and cross-workspace links.
- Mapper and data-mode tests preserve domain IDs, JSON payloads, optional values, memory-demo behavior, and safe explicit-Supabase failure.

## Issues found and fixed

1. Authenticated table privileges were absent. Migration 002 now grants select, insert, and update, revokes delete, and grants nothing to `anon`.
2. Cross-workspace foreign keys were possible. Composite workspace foreign keys now enforce relationship locality.
3. Foundational membership, workspace, relationship, and append-sequence indexes were missing. Migration 002 adds them.
4. Invalid explicit Supabase mode returned memory repositories. It now reports `configuration-error` without repositories.

## Security and performance

Both security-definer helpers have fixed `search_path`, no dynamic SQL, identity derived from `auth.uid()`, public execution revoked, and authenticated execution granted. No service-role credential is used or committed. Browser configuration contains only public configuration. Server calls accept an access token and do not fabricate sessions.

Foundational indexes cover active membership, identity, permission, workspace filters, relationships, and descending historical sequences. The fictional dataset is too small for meaningful latency benchmarking; PostgreSQL may prefer sequential scans at this scale.

## Reproduce

1. Start Docker Desktop.
2. From the repository root run `npx supabase start` and `npx supabase db reset` twice.
3. From `frontend`, run all validation commands documented in [DATABASE_TESTING.md](./DATABASE_TESTING.md).

Runtime tests require `supabase_db_executive-career-os-local`. They use fictional data and roll test identities back. Cookie-backed session acquisition remains blocked until production authentication; future auth can supply a verified token without replacing repository interfaces.
