# Orion Execution Status

Last updated: 2026-07-17 · Owner: Sol · Handover: Not ready

| Field | Current truth |
|---|---|
| Milestone | M2A — provider expansion engine |
| Phase | Phase 2 — multi-provider expansion |
| Release | M2A Lever Provider Expansion is deployed to isolated network staging |
| Current version | Greenhouse and Lever certified through the common Coverage Engine |
| Canonical opportunities | 804 |
| Active opportunities | 804 |
| Executive opportunities | 118 |
| Canonical employers | 3 Greenhouse employers, 1 Lever employer; 5 employers across the measured workspace |
| Verified employers | 0 under strict domain + verified time + confidence ≥80 rule |
| Production providers | Greenhouse and Lever: scheduled in isolated network staging; Lever completed 273-record first and replay runs with zero errors |
| Other providers | Adapters exist; none may be counted as live without schedule/run evidence |
| Freshness | 85.8% observed within the v1 48-hour window; stale rate 14.2% |
| Duplicate rate | 0.1% source-observation consolidation rate; zero duplicate source identities |
| GOCI | 58 overall: North America 75, Europe 74, Asia 72, UK 60, Oceania 51, Middle East 50, Latin America 47, Africa 41, Worldwide Remote 0 |
| Employer Intelligence Coverage | Provider-scoped employer and opportunity provenance 100%; official domains remain Unknown unless verified |
| Latest deployment | Network staging Ready at commit `490d56f`; migrations through `202607170011` applied |

## Blockers and priority

- **P0:** none. Lever first-run and replay certification completed with zero errors, zero duplicate source identities, and 100% provider-scoped provenance.
- **P1:** freshness is 85.8%, below the 90% warning threshold; Worldwide Remote coverage remains zero; provider seven-day success is 92.9% because historical failed-run evidence is retained.
- **Next highest-value task:** certify Ashby through the same provider locator, scheduler, canonicalization, provenance, and replay contracts, prioritizing worldwide-remote coverage.
- **Last completed task:** Lever production adapter, provider locator propagation, exact-employer cross-provider reconciliation, two live runs, and measured M2A evidence.

## Quality state

Passed: Greenhouse connector, durable ingestion/replay/security checks, Orion metrics, scheduler recovery, TypeScript, ESLint, database architecture, PostgreSQL migration replay, and the 126-page production build. Isolated HTTPS company and login routes return HTTP 200.

## Ownership

- Sol: metrics/schema/RLS, provider framework, canonical architecture, scaling, security, structural incidents.
- Luna after handover: provider cohorts within contracts, UI/UX, company/opportunity pages, routine bugs/releases, enrichment and accessibility.
- Founder gates: paid licensing, provider contracts/terms, legal ambiguity, material personal-data/cost change, irreversible architecture, employer governance or commercial commitments.
