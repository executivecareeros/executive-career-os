# Product Truth & Runtime Security Closure

> Completed: 2026-07-18  
> Authority: approved next sprint from the ODS 4.0 CTO review  
> Scope: contract truth, runtime database isolation and authoritative inventory evidence only

## Outcomes

| Gate | Result | Evidence |
|---|---|---|
| English-only public acquisition | Pass | Metadata and sitemap tests reject active Turkish production alternates |
| Live product truth | Pass | Live roots, compensation, opportunity, company and application contracts pass |
| PostgreSQL runtime | Pass | 62 tables, 144 policies, 14 triggers and 15 security-definer helpers observed |
| Runtime constraints | Pass | Membership, compensation, ledger and workspace constraints reject invalid writes |
| Append-only protection | Pass | Seven historical tables reject update/delete; correction append succeeds |
| Bootstrap idempotency | Pass | Invitation, identity, workspace, owner membership, workflow, Blueprint and Atlas context create once |
| Runtime RLS | Pass | Owner=1, cross-workspace=0, unauthorized compensation=0, allowed compensation=1, invited=0, no membership=0, anonymous=0 |
| Inventory authority | Pass | Versioned snapshot and contract identify 16,102 as the latest authoritative measured active inventory |
| Provider certification | Pass | Greenhouse, Lever, Ashby, SmartRecruiters and shared provider contracts pass |
| Intelligence contracts | Pass | Company, Opportunity, Knowledge Graph, Executive Decision and Atlas integration tests pass |
| Lint / TypeScript / build | Pass | ESLint and 126-route optimized production build pass |

## Truth corrections

- The acquisition test previously asserted Turkish production metadata after the Founder approved English-only production. The contract now validates English-only output while localization architecture remains available internally.
- The company truth test referenced superseded labels. It now requires the current explicit `Identity confidence`, `Average executive relevance`, and no-inference disclosure.
- Historical opportunity totals are preserved as audit baselines. `AUTHORITATIVE_INVENTORY_SNAPSHOT.md` is the sole point-in-time authority until a newer authenticated snapshot replaces it.
- Current live inventory after the snapshot is Unknown; it is not extrapolated.

## Changes deliberately not made

- No product feature, schema, migration, infrastructure, provider, DNS or deployment change.
- No unsupported company fact, live inventory estimate or AI-generated metric.
- No historical evidence deleted.

## Remaining risks

1. No tested external founder alert path.
2. No complete production tracing/APM distribution.
3. Company identity enrichment remains incomplete.
4. Full authenticated executive and 390px acceptance remains outstanding.
5. Current live inventory requires a new authenticated snapshot to supersede the recorded checkpoint.

## Next highest-ROI sprint

Company Intelligence Enrichment: verify official domains, headquarters, products/services and provenance without inference, while replacing broad company/opportunity reads with targeted indexed access where measured.
