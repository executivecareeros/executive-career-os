# Opportunity Factory Scale Path — 2026-07-18

## Decision

Keep the 250,000-employer and 3,000,000-active-opportunity objectives as operational targets, never as claimed inventory. Expansion remains restricted to employer-published public sources supported by the approved Coverage Engine.

## Scale constraints removed

- Scheduler reads are bounded to due schedules instead of growing linearly with every registered employer.
- Recoverable queued work remains independently discoverable when a schedule is no longer due.
- Claimed work resolves only its own schedule.
- Source registration uses database conflict handling and remains idempotent without preloading the registry.
- Common Crawl candidate verification rotates by scheduler window instead of repeatedly sampling the same alphabetical prefix.

## Safety retained

- Zero AI-token discovery.
- Employer-published public endpoints only.
- Provider policy and compliance records remain attached.
- Canonical deduplication remains mandatory.
- Retry isolation, leases, bounded execution, freshness, and lifecycle rules remain active.
- No synthetic employers or opportunities are created to meet targets.

## Validation

- Employer source factory and replay: passed.
- Scheduler security, bounded reads, and recovery: passed.
- Global employer target selection: passed.
- TypeScript: passed.
- ESLint: passed.
- Production build: passed, 134 routes generated.

## Measurement gate

The next factory decision is based on observed 24-hour yield: newly registered sources, active canonical employers, active canonical opportunities, duplicates merged, freshness, failed sources, scheduler latency, and database load. Execution concurrency must not increase without this evidence.
