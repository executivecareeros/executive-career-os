# Data Migrations
> **Purpose:** Define safe schema promotion, seed, reset, and recovery practices.
## Workflow
Migrations are timestamped SQL, reviewed in order, and repeatable from an empty database. Local reset applies all migrations then the idempotent fictional seed. `validate:database` checks static RLS, workspace ownership, append-only coverage, membership policies, demo labeling, and secret boundaries.
## Promotion
Generate and review a schema diff, test on a disposable database, back up before promotion, apply forward-only changes, validate counts/references/RLS, then enable provider reads before writes. Never embed credentials or personal records.
## Rollback
Production rollback is not assumed. Prefer corrective forward migrations. Destructive changes require verified backups, restore rehearsal, and explicit data-owner impact review.
## Atomicity
Single PostgREST mutations are database-atomic. Independent browser calls are not a transaction. Multi-step workflows require future database functions or thin authenticated server operations. Current memory operations are process-local and non-atomic. Append-only writes are individually durable only when Supabase mode is configured and authorized.
