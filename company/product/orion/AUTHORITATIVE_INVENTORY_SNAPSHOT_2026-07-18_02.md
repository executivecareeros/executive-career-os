# Authoritative Opportunity Inventory Snapshot

> Snapshot version: `orion-inventory-2026-07-18-02`  
> Captured: 2026-07-18 11:02 UTC  
> Environment: isolated network staging  
> Status: authoritative point-in-time measurement; not a live counter  
> Evidence source: aggregate SQL measurement after the SmartRecruiters first-run and replay gate

## Inventory

| Measure | Value |
|---|---:|
| Active canonical opportunities | 24,014 |
| Executive-classified opportunities | 2,533 |
| Commercial opportunities | 1,788 |
| Remote opportunities | 3,948 |
| Employers with active opportunities | 358 |
| Observed within 48 hours | 23,999 (99.9%) |
| Enabled employer schedules | 1,168 |

## SmartRecruiters admission evidence

| Measure | Value |
|---|---:|
| Verified employers enabled | 102 |
| Employers completed at capture | 3 |
| Successful runs | 4/4 |
| Current failures | 0 |
| Records discovered | 1,000 |
| Canonical records changed | 750 |
| Active SmartRecruiters canonical opportunities | 750 |
| Idempotent replay | 250 rediscovered, 0 changed |

The 102-employer cohort is staggered at no more than three due jobs per 15-minute scheduler interval and at most 250 records per employer run. The remaining schedules continue after this point-in-time capture. Advertised source totals and unexecuted schedules are not counted as canonical inventory.

## Interpretation rules

- This file supersedes `AUTHORITATIVE_INVENTORY_SNAPSHOT.md`; the earlier file remains historical audit evidence.
- The 24,014 total is durable canonical inventory measured after completed persistence, not a discovery estimate.
- Founder profile and recommendation preferences do not influence network inventory.
- A later count requires a new versioned snapshot; do not silently revise this one.
- Country normalization was not remeasured in this capture, so the earlier 78-country evidence remains the latest country-quality checkpoint and is not combined into this snapshot.

## Operational conclusion

SmartRecruiters is admitted as a live isolated-staging provider. Its official public employer Posting API completed a first run and a zero-change replay through the common scheduler, normalization, canonicalization, provenance, lifecycle, and persistence engine.
