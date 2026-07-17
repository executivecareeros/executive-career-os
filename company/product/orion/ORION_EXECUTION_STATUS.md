# Orion Execution Status

Last updated: 2026-07-17 · Owner: Sol · Handover: Not ready

| Field | Current truth |
|---|---|
| Milestone | M1 — measured canonical network |
| Phase | Phase 1 — Network Measurement Foundation |
| Release | Phoenix II foundation is on `main`; authenticated production acceptance for Orion metric change is not applicable until deployed |
| Current version | `5f03a9f` deployed baseline; full-refresh recovery change awaiting deployment |
| Canonical opportunities | 169 |
| Active opportunities | 169 (last verified cohort snapshot; lifecycle RPC deployment pending) |
| Executive opportunities | 41 |
| Canonical employers | 2 active canonical employers in the measured workspace |
| Verified employers | 0 under strict domain + verified time + confidence ≥80 rule |
| Production providers | Greenhouse: scheduled in isolated network staging; seven-day success 88.9%, below the 97% warning threshold |
| Other providers | Adapters exist; none may be counted as live without schedule/run evidence |
| Freshness | 32.5% observed within the v1 48-hour window; stale rate 67.5% |
| Duplicate rate | 0.6% source-observation consolidation rate; no duplicate canonical records detected by source identity |
| GOCI | 28 overall: North America 42, Oceania 42, Latin America 41, Middle East 41, Asia 33, Europe 31, UK 7, Africa 0, Worldwide Remote 0 |
| Latest deployment | Network staging Ready for `ed6c077`; migration `202607170007` applied |

## Blockers and priority

- **P0:** restore provider success to at least 97% and opportunity freshness to at least 90%; identify whether stale records require complete-snapshot closure or broader refresh throughput.
- **P1:** activate two additional compliant providers to reach three reliable providers; verify 100 canonical employers; normalize geography; expose provider health and regional breakdown in Company Control.
- **Verified diagnosis:** the 10-record schedule limit refreshed only the first slice of the cohort. Raising it to 250 exposed two bounded runtime defects: repeated full-inventory reads made the run exceed its lease, and the scheduler did not reclaim an expired job unless the schedule itself was also due.
- **Correction prepared:** run-scoped inventory caching removes repeated reads; expired work is now reclaimable independently from schedule due state. The isolated staging schedule is configured for 250 records at the existing 12-hour cadence.
- **Work in progress:** deploy the recovery correction, allow the expired job to be reclaimed, then remeasure freshness, provider health and GOCI.
- **Next highest-value task:** complete and measure the first full-cohort refresh before expanding providers or employers.
- **Last completed task:** Orion operating system, secured metric snapshot and profile-independent GOCI v1 deployed to isolated network staging.

## Quality state

Passed: Orion metrics, geographic coverage, durable ingestion, scheduler security, Greenhouse, provider expansion, TypeScript, ESLint, database architecture, PostgreSQL migration replay, RLS, and the prior 126-page production build. Current build compilation is blocked only by restricted Google Fonts network access; TypeScript and ESLint pass for the recovery change.

## Ownership

- Sol: metrics/schema/RLS, provider framework, canonical architecture, scaling, security, structural incidents.
- Luna after handover: provider cohorts within contracts, UI/UX, company/opportunity pages, routine bugs/releases, enrichment and accessibility.
- Founder gates: paid licensing, provider contracts/terms, legal ambiguity, material personal-data/cost change, irreversible architecture, employer governance or commercial commitments.
