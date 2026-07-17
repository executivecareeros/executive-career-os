# Orion Execution Status

Last updated: 2026-07-17 · Owner: Sol · Handover: Provider acceleration framework validated; Workable certification ready

| Field | Current truth |
|---|---|
| Milestone | M2X — Provider Acceleration Initiative |
| Phase | Phase 2 — multi-provider expansion |
| Release | M2B Ashby Provider Expansion is deployed to isolated network staging |
| Current version | Greenhouse, Lever, and Ashby use Provider Manifest v1.0 and the shared SDK; common certification framework active |
| Canonical opportunities | 1,042 |
| Active opportunities | 1,042 |
| Executive opportunities | 157 |
| Canonical employers | 7 measured employers; 1,038 of 1,042 active opportunities linked to a canonical employer |
| Verified employers | 0 under strict domain + verified time + confidence ≥80 rule |
| Production providers | Greenhouse, Lever, and Ashby: scheduled in isolated network staging; Ashby certified across two employer cohorts and 238 source observations |
| Other providers | Adapters exist; none may be counted as live without schedule/run evidence |
| Freshness | 89.1% observed within the v1 48-hour window; stale rate 10.9% |
| Duplicate rate | 0.1% source-observation consolidation rate; zero duplicate source identities |
| GOCI | 63 overall: North America 83, Asia 80, Europe 78, UK 75, Oceania 62, Middle East 50, Latin America 47, Africa 41, Worldwide Remote 0 |
| M2 quality | PRI 82.1; ERA 99.7; OCI 89.1; RCI 62.9 |
| Employer Intelligence Coverage | Provider-scoped employer and opportunity provenance 100%; official domains remain Unknown unless verified |
| Latest deployment | Network staging Ready at commit `0b173c6`; migrations through `202607170011` applied |

## Blockers and priority

- **P0:** none. Ashby completed a 238-observation first pass and a post-fix 238-observation replay with zero changes, zero errors, and no cross-employer lifecycle closures.
- **P1:** freshness is 89.1%, just below the 90% warning threshold; Worldwide Remote coverage remains zero; retained seven-day provider success is 86.4% because failed certification attempts remain in audit history.
- **Next highest-value task:** certify Workable through the manifest, SDK, common certification harness, and isolated-staging first run/replay.
- **Last completed task:** shared provider manifest, request/retry/pagination SDK, minimal scaffold, and deterministic certification harness implemented and repository-certified without changing the Coverage Engine or adding a provider.

## Quality state

Passed: Greenhouse, Lever, and Ashby connector checks; common provider certification; Provider Pack Alpha; provider expansion; Coverage Engine; durable ingestion/replay/security; scoped provider lifecycle; canonical reactivation; Orion metrics; scheduler recovery; TypeScript; ESLint; and the 126-page production build. The first sandboxed build attempt could not reach the existing Google Fonts dependency; the authorized network-enabled rerun passed.

## Ownership

- Sol: metrics/schema/RLS, provider framework, canonical architecture, scaling, security, structural incidents.
- Luna after handover: provider cohorts within contracts, UI/UX, company/opportunity pages, routine bugs/releases, enrichment and accessibility.
- Founder gates: paid licensing, provider contracts/terms, legal ambiguity, material personal-data/cost change, irreversible architecture, employer governance or commercial commitments.
