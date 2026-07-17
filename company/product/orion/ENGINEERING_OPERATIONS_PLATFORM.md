# Orion Engineering Operations Platform

Status: Authoritative architecture · Version: `orion-operations-v1` · Owner: Sol / Opportunity Coverage Engine · Last validated: 2026-07-17

## Purpose

The Engineering Operations Platform converts existing manifests, health probes, immutable provider runs, queue state, certification reports, and canonical inventory into one deterministic connector snapshot. It exists to make Connector #100 safer to operate without adding provider-specific diagnostics.

The authoritative implementation is `frontend/lib/discovery/connector-operations.ts`. It does not introduce a new database, scheduler, connector interface, or persistence path.

## Evidence model

Each snapshot reports:

- connector health and source status;
- manifest, SDK, lifecycle, and certification versions;
- discovery, inventory, request, retry, and scheduler statistics;
- freshness and replay diagnostics;
- searchable failure classifications;
- chronological operational history; and
- Operational Trust Score (OTS).

Unknown evidence remains `null`, `Unknown`, or `Insufficient evidence`. Timestamps are accepted only when present and parseable. The platform never synthesizes operational timestamps.

## Operational history

Immutable run and queue records produce events for discovery, replay, retry, backoff, failure, certification, manifest validation, and scheduler activity. The event projection is deterministic and can be rebuilt from source evidence. Failure searches support provider, class, and exact code.

## Health contract

| State | Evidence rule |
|---|---|
| Healthy | Deployable health probe, successful run evidence, passed certification, freshness within 1.5 configured cadences, and no later failure or unsafe replay closure |
| Warning | Evidence exists but certification, freshness, or cadence confidence is incomplete or overdue |
| Degraded | Latest operational evidence contains a failure or unsafe lifecycle result |
| Recovering | A successful run follows the most recent failure |
| Offline | Provider probe is explicitly unavailable or disabled |
| Unknown | No run or probe evidence exists |

Health is a projection, not a manually assigned label.

## Scheduler and replay

Scheduler statistics report scheduled, completed, failed, skipped, queue depth, due backlog, average duration, and longest duration. This milestone measures scheduler behavior; it does not tune cadence or concurrency.

Replay diagnostics compare an explicitly identified replay with its immediately preceding immutable run. They report duration, observed inventory difference, canonical and opportunity delta, lifecycle changes, unsafe incremental closures, and evidence confidence. Employer delta remains Unknown because current run outcomes do not record employer-level change counts.

## Failure and recovery

Failure classes are deterministic code mappings: Authentication, Rate limiting, Timeout, Network, API schema, Mapping, Lifecycle, Certification, Replay, and Unknown. Unknown is preserved when no supported mapping exists. Recovery is evidenced only when a successful run follows a failed run.

## Persistence and rollback

Current durable sources remain `opportunity_provider_runs`, `opportunity_provider_jobs`, `opportunity_provider_schedules`, canonical opportunities, manifests, and certification reports. The operations model is a read-only projection and requires no migration. Rollback is removal of the projection and its tests; source history is unaffected.

## Validation

Greenhouse, Lever, Ashby, and Workable pass the identical deterministic operations harness. The harness validates healthy evidence, certification, replay determinism, zero unsafe closures, canonical inventory, operational history, failure classification, and OTS.

Live Workable validation was not performed. No approved Workable employer cohort exists in the current authoritative roadmap, and M3A does not authorize selecting or activating one. Fixture validation therefore remains the truthful evidence level.

## Engineering economics

The repeatable measurement command reports:

- Engineering Reuse Index: 100% across 11 shared certification concerns.
- Framework Stability Index: 100%; no public framework or connector contract changed.
- Connector responsibility count: 6 scaffold hooks.
- Framework responsibility count: 11 certification concerns plus 13 operational capabilities.
- SDK, manifest, certification, and scaffold reuse: unchanged from M3; all applicable shared contracts remain reused.
- Operational maintenance reduction: four certified connectors use one operations implementation and zero provider-specific operations implementations.
- Operational automation increase: 13 shared capabilities added.
- Repeatable operational procedures: 4 — snapshot, failure search, connector operations test, and complete provider certification.
- Operational investigation reduction: not yet measured in live operations.
- Financial ROI: Unknown; no cost or engineering-hour evidence was fabricated.

The highest future leverage is applying the projection to durable staging evidence and measuring investigation time before and after adoption.
