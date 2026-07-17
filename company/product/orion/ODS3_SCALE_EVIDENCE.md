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
| 10,000 | 100 | 5 ms | 2,181,520/s | 2.9 MiB | 4.8 MiB | 5 ms | 0 |
| 100,000 | 1,000 | 43 ms | 2,343,151/s | 29.4 MiB | 9.7 MiB | 44 ms | 0 |
| 1,000,000 | 10,000 | 443 ms | 2,259,456/s | 298.9 MiB total streamed | 41.6 MiB | 449 ms | 0 |

The bounded loop prevents global materialization; total payload volume grows linearly while peak application memory remains bounded.

## Isolated staging execution evidence

Checkpoint captured 2026-07-18 from aggregate-only runtime telemetry:

- Scheduler completed three of three jobs with zero execution failures and zero retries.
- 179 provider records were persisted in three database batch calls; batch transaction time was 2,547 ms.
- End-to-end scheduler duration was 14,136 ms.
- The execution made 40 database/network requests: 18 reads and 22 writes, totaling 13,663 ms of observed request time.
- CPU was 566 ms user and 59 ms system; heap used was 44.7 MiB; RSS changed by 0.8 MiB.
- AI-token use was zero. No opportunity contents, identifiers, credentials, or personal data were logged.
- Seven-day persistence telemetry recorded 70 batches and 4,703 records, with a 67.2-record mean batch and 761 ms mean transaction duration.
- The bounded coverage query initially exceeded the statement timeout. Aggregating active country evidence once reduced it below the timeout and made country, industry, provider, and persistence evidence observable in the same run.
- Three historical failed queue records remain visible beside three newly queued records. Current executions are succeeding; the historical failures require operational disposition rather than concealment.

## Coverage checkpoint

- Active canonical inventory: 16,102.
- Registry: 249 ISO 3166 countries and territories; 78 currently contain opportunity evidence and 171 do not.
- Provider freshness: Ashby 100%, Greenhouse 99.9%, Lever 100%; LinkedIn observation freshness 20% and provider health Unknown because it is not an automated provider.
- Provider health: Ashby, Greenhouse, and Lever Healthy. Greenhouse consolidates a 4.1% duplicate observation rate; Ashby and Lever report 0% at this checkpoint.
- Opportunity mix: 1,559 executive-classified, 1,148 commercial, and 2,490 remote.
- Industry classification is the next material data-quality gap: 16,101 of 16,102 active opportunities are `not specified`; the remaining record is `unclassified`. Classification confidence is therefore 0% and no industry-level claim is production-ready.

## Current capacity conclusion

- 10K: live inventory, transaction batching, scheduler execution, and aggregate telemetry accepted.
- 100K: application-side batching is validated; database-side capacity remains pending staging telemetry.
- 1M: bounded application simulation is successful; production readiness is not claimed.
- Current maximum production-safe capacity: the measured 16,102 active opportunities. A higher bound requires a staged load test with database lock-wait, rollback, queue-latency, and concurrent-worker evidence.

## Economics

- New infrastructure: none.
- Paid dependency: none.
- AI-token cost: zero.
- Expected maintenance: one RPC, one telemetry table, existing scheduler integration, and deterministic reporting.
- Ten-times-cheaper path: batch network writes and reuse unchanged canonical data.
- Hundred-times-more-data path: retain bounded batches, partition schedule execution, tune worker concurrency from measured database latency, and archive closed inventory without weakening provenance.

## Next bottleneck

Industry classification is the highest product-data gap. The next scale bottleneck is remote PostgreSQL transaction duration and source-reassignment cost under concurrent workers; current evidence uses one worker and cannot approve the 100K database tier.

## Knowledge graph recommendation

Keep the relational model. Existing country, company, opportunity, provider-source, role, industry, Atlas reasoning, application, and outcome relationships support required product queries. Add indexed relational projections where measured queries require them. A graph database is not justified by current evidence.
