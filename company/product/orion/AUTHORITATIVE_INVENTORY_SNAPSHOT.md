# Authoritative Opportunity Inventory Snapshot

> Snapshot version: `orion-inventory-2026-07-18-01`  
> Captured: 2026-07-18  
> Environment: isolated network staging  
> Status: authoritative point-in-time measurement; not a live counter  
> Evidence source: aggregate-only ODS 3.0 runtime telemetry recorded in `ODS3_SCALE_EVIDENCE.md`

## Inventory

| Measure | Value |
|---|---:|
| Active canonical opportunities | 16,102 |
| Executive-classified opportunities | 1,559 |
| Commercial opportunities | 1,148 |
| Remote opportunities | 2,490 |
| Canonical country/territory registry | 249 |
| Countries/territories with opportunity evidence | 78 |
| Countries/territories without opportunity evidence | 171 |

## Provider quality

| Provider | Freshness | Duplicate observation rate | Health |
|---|---:|---:|---|
| Ashby | 100% | 0% | Healthy |
| Greenhouse | 99.9% | 4.1% | Healthy |
| Lever | 100% | 0% | Healthy |
| LinkedIn observations | 20% | Unknown | Unknown; not an automated provider |

## Operations

| Measure | Value |
|---|---:|
| Scheduler jobs completed | 3/3 |
| Current-run failures | 0 |
| Records persisted in detailed run | 179 |
| Database batch calls | 3 |
| Batch transaction duration | 2,547 ms |
| End-to-end scheduler duration | 14,136 ms |
| Database/network requests | 40 |
| Database/network duration | 13,663 ms |
| Seven-day persistence batches | 70 |
| Seven-day persisted records | 4,703 |
| AI tokens | 0 |

## Interpretation rules

- This file is the single authoritative inventory checkpoint until replaced by a newer versioned snapshot generated from the same aggregate telemetry contract.
- Older totals remain historical audit evidence and must be labelled as baselines.
- Ingestion continued after capture; therefore the current live count is **Unknown** until another authenticated measurement is recorded.
- A read-only discovery proof, advertised provider posting count, or indexed candidate count is not durable canonical inventory.
- Founder profiles never influence global inventory or coverage metrics.

## Known gaps

- A global aggregate freshness percentage was not captured at this checkpoint; provider-level freshness is authoritative.
- Current live totals after the capture time are Unknown.
- Provider-level salary completeness and compensation confidence are Unknown.
- Live database capacity above 16,102 active opportunities is not approved by this snapshot.

## Replacement procedure

1. Run the authenticated aggregate telemetry endpoint in isolated staging.
2. Record capture time, environment, scheduler outcome, canonical totals, provider health and data-quality metrics.
3. Create a new versioned snapshot; never overwrite historical evidence.
4. Update `ORION_EXECUTION_STATUS.md` to point to the new snapshot.
5. Preserve this file for audit history.
