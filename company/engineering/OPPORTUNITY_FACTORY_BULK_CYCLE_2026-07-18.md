# Opportunity Factory Bulk Cycle — 2026-07-18

## Outcome

The production Opportunity Factory doubled its bounded default throughput from three to six provider jobs per scheduled invocation. A hard ceiling of twelve remains enforced. Existing queue leases, retries, canonical deduplication, workspace isolation and the 240-second execution boundary remain unchanged.

## Live cycle evidence

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Canonical active opportunities | 30,599 | 30,714 | +115 |
| Fresh opportunities | 30,594 | 30,709 | +115 |
| Active employers | 419 | 425 | +6 |
| Completed provider jobs | 458 | 464 | +6 |
| Failed jobs | 3 | 3 | 0 |
| Queued jobs | 1 | 1 | 0 net backlog growth |

The latest completed SmartRecruiters run discovered 17 records, changed 17 records and recorded zero errors. AI tokens used: 0.

## Validation

- Scheduler authentication and durability: passed.
- Transaction-safe batch persistence: passed.
- Canonical fingerprint/idempotency: passed.
- Lint and TypeScript: passed.
- Production build: passed, 133 routes.
- Deployment commit `6b3c7f0`: Ready.
