# ODS 3.0 Scale Evidence

Last updated: 2026-07-18 · Scope: bounded batch persistence and global coverage foundations

## Selected approach

Use the existing PostgreSQL database as the transaction coordinator. The application normalizes and canonically matches records deterministically, consolidates repeated canonical IDs, and submits bounded groups to one idempotent RPC. PostgreSQL resolves employers, preserves aliases and source observations, reassigns duplicate source identities, upserts canonical opportunities, and records batch telemetry in one transaction.

Batch size defaults to 100 and is configuration-tunable from 1 to 250. A durable workspace-and-batch identity makes successful retries read-only. A failed RPC rolls back the whole group. Earlier completed groups remain safe to replay. Empty complete snapshots retain the validated full-inventory fallback and lifecycle closure behavior.

## Alternatives rejected

- Per-record REST writes: rejected because network calls grow linearly with every opportunity.
- New queue, warehouse, graph database, or paid telemetry service: rejected because existing PostgreSQL capabilities provide the required safety at lower cost and complexity.
- One unbounded provider transaction: rejected because it creates parameter, memory, timeout, and retry risk.
- Weak employer merging for higher throughput: rejected because uncertain aliases must remain separate until evidence exists.

## Controlled application simulation

These results measure deterministic batch payload construction only. They do not claim remote database throughput.

| Records | Batches at 100 | Duration | Throughput | Encoded payload | Peak heap | CPU | AI tokens |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10,000 | 100 | 5 ms | 2,002,136/s | 2.9 MiB | 4.8 MiB | 5 ms | 0 |
| 100,000 | 1,000 | 44 ms | 2,295,638/s | 29.4 MiB | 9.7 MiB | 45 ms | 0 |
| 1,000,000 | 10,000 | 443 ms | 2,255,947/s | 298.9 MiB total streamed | 41.6 MiB | 450 ms | 0 |

The bounded loop prevents global materialization; total payload volume grows linearly while peak application memory remains bounded. Database capacity remains unverified until the migration is applied to isolated staging and real RPC duration, rows, queue depth, retries, and failures are observed.

## Current capacity conclusion

- 10K: current live inventory; application and existing scheduler evidence accepted.
- 100K: application-side batching is validated; database-side capacity remains pending staging telemetry.
- 1M: bounded application simulation is successful; production readiness is not claimed.
- Current maximum production-safe capacity: 10,260 verified active opportunities until staging database evidence expands the bound.

## Economics

- New infrastructure: none.
- Paid dependency: none.
- AI-token cost: zero.
- Expected maintenance: one RPC, one telemetry table, existing scheduler integration, and deterministic reporting.
- Ten-times-cheaper path: batch network writes and reuse unchanged canonical data.
- Hundred-times-more-data path: retain bounded batches, partition schedule execution, tune worker concurrency from measured database latency, and archive closed inventory without weakening provenance.

## Next bottleneck

Remote PostgreSQL transaction duration and source-reassignment query cost under concurrent provider runs. Measure before increasing concurrency.

## Knowledge graph recommendation

Keep the relational model. Existing country, company, opportunity, provider-source, role, industry, Atlas reasoning, application, and outcome relationships support required product queries. Add indexed relational projections where measured queries require them. A graph database is not justified by current evidence.
