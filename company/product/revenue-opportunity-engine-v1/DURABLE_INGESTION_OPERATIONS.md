# Durable Opportunity Ingestion Operations

> Purpose: Operate provider collection durably on the existing Vercel and Supabase stack before adding broader infrastructure.

- **Status:** Code and migration prepared; staging application and scheduler activation pending
- **Migration:** `202607170002_durable_opportunity_ingestion.sql`
- **Rollback boundary:** Staging first; no production activation until replay, isolation, failure, and recovery acceptance pass

## Operating Model

Supabase stores three workspace-scoped records:

1. **Provider schedules** define the provider/employer source, cadence, filters, priority, limits, compliance basis, and enabled state.
2. **Provider jobs** form the durable queue and retain retry, availability, lease, cancellation, and failure state.
3. **Provider runs** preserve immutable attempt outcomes and measurable record counts.

Workers claim jobs atomically with `FOR UPDATE SKIP LOCKED`. Claims expire, so an interrupted deployment cannot hold work indefinitely. Repeated run persistence is idempotent by workspace, job, and attempt. Cancellation remains an observable terminal state.

## Current Capacity

The current design is appropriate while collection consists of employer-scoped HTTP feeds and provider runs that complete within normal server execution limits. It deliberately avoids a separate queue vendor.

Initial operational bounds:

- one active lease per queued job;
- provider-specific cadence no faster than 15 minutes;
- maximum lease of 60 minutes;
- bounded provider result limits;
- retry behavior remains provider-policy controlled;
- run history queries are bounded to the latest 500 attempts per workspace for interactive metrics.

## Scheduler Activation Gate

Persistent schedules and jobs do not execute themselves. Autonomous daily operation requires an approved deployment-safe trigger, recommended as the existing Vercel scheduler calling a server-only route protected by a dedicated machine credential. That credential must be created and stored through provider secret controls; it must never enter Git, browser code, logs, or documentation.

Before activation:

1. apply migrations `202607170001` and `202607170002` to staging;
2. validate RLS and atomic claims against PostgreSQL;
3. configure the server-only scheduler credential;
4. enable one approved employer source;
5. run manual, scheduled, retry, interrupted-lease, cancellation, and replay acceptance;
6. verify source limits and compliance basis;
7. record live canonical inventory metrics;
8. promote only after rollback is rehearsed.

## Scale-Evolution Trigger

Reassess the current design when any sustained condition occurs:

- jobs regularly exceed server execution limits;
- more than 1,000 enabled employer sources require sub-hour cadence;
- queue depth cannot be cleared within one refresh interval;
- provider concurrency requires independent worker pools;
- run payload growth materially affects operational queries;
- database queue contention or lease recovery becomes measurable;
- regional execution or contractual isolation becomes necessary.

At that point, evaluate a dedicated managed queue and worker runtime. Do not migrate based on hypothetical scale.

## Rollback

Before provider activation, rollback is application-first:

1. disable all provider schedules;
2. stop the scheduler trigger;
3. allow running leases to expire or cancel queued jobs;
4. revert application code to the previous Coverage Engine;
5. preserve run history for audit;
6. remove the three new tables and claim function only after confirming no operational records are required.

No canonical Opportunity or source evidence is deleted by scheduler rollback.
