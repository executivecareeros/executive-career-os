# Orion Execution Status

Last updated: 2026-07-17 · Owner: Sol · Handover: Not ready

| Field | Current truth |
|---|---|
| Milestone | M1 — measured canonical network |
| Phase | Phase 1 — Network Measurement Foundation |
| Release | Phoenix II foundation is on `main`; authenticated production acceptance for Orion metric change is not applicable until deployed |
| Current version | `986b164` before this Orion increment |
| Canonical opportunities | 169 |
| Active opportunities | 169 (last verified cohort snapshot; lifecycle RPC deployment pending) |
| Executive opportunities | 41 |
| Canonical employers | 1 active canonical employer in the live network cohort |
| Verified employers | 0 under strict domain + verified time + confidence ≥80 rule |
| Production providers | Greenhouse: scheduled and healthy in isolated network staging |
| Other providers | Adapters exist; none may be counted as live without schedule/run evidence |
| Freshness | 168/169 observed within 36h at last measurement (99.4%) |
| Duplicate rate | 0 duplicate source identifiers; Orion canonical duplicate-rate RPC pending deployment |
| GOCI | Not yet measured from deployed v1 contract; must remain Unknown |
| Latest deployment | Network staging Ready for `986b164` |

## Blockers and priority

- **P0:** deploy/apply `202607170007`, read the secured snapshot, and validate GOCI/metric outputs against the verified cohort.
- **P1:** activate two additional compliant providers to reach three reliable providers; verify 100 canonical employers; normalize geography; expose provider health and regional breakdown in Company Control.
- **Work in progress:** Orion program and M1 metrics contract.
- **Next highest-value task:** apply the metrics migration to isolated network staging and establish an approved employer/provider expansion cohort from Lever and Ashby.
- **Last completed task:** canonical employer identity repair and two idempotent Greenhouse runs.

## Quality state

Previous network increment passed opportunity-universe, discovery, Greenhouse, provider expansion, durable ingestion, TypeScript, lint, and production build checks. The current increment must additionally pass `test:orion-metrics`, migration safety/RLS review, and applicable regression tests.

## Ownership

- Sol: metrics/schema/RLS, provider framework, canonical architecture, scaling, security, structural incidents.
- Luna after handover: provider cohorts within contracts, UI/UX, company/opportunity pages, routine bugs/releases, enrichment and accessibility.
- Founder gates: paid licensing, provider contracts/terms, legal ambiguity, material personal-data/cost change, irreversible architecture, employer governance or commercial commitments.
