# Opportunity Provider Expansion Record — 14 July 2026

## Scope

Expand employer-direct opportunity coverage through the existing Opportunity Coverage Engine without credentials, paid access, new infrastructure, personal-data processing changes, or provider-specific engine logic.

## Providers Added

| Provider | Public interface | Coverage contribution | Gate result |
| --- | --- | --- | --- |
| Recruitee | Careers Site API | Structured employer jobs across Recruitee-hosted career sites | Autonomous: no reserved founder gate |
| Personio | Employer-enabled XML career feed | European employer jobs, including multilingual feed support | Autonomous: no reserved founder gate |
| Workable | Public account jobs endpoint | Published employer jobs across Workable-hosted career sites | Autonomous: no reserved founder gate |
| Company Career Sites | Employer-published Schema.org `JobPosting` data | Target-company roles outside the named ATS adapters | Autonomous only within the bounded single-page structured-data policy |

LinkedIn Jobs and Workday were processed as mandatory Tier 1 priorities. Both remain explicit Founder Approval Gates: LinkedIn requires partner approval and contractual acceptance; Workday requires an authorized tenant or provider-confirmed collection path.

**Superseded 17 July 2026:** the earlier SmartRecruiters API-key statement was incorrect. Current official documentation identifies the Posting API as available for public postings without authentication, and a read-only live request to the official endpoint returned public employer postings without credentials. SmartRecruiters now has an employer-scoped adapter inside the shared engine; it is not counted as live until an isolated-staging cohort completes a first run and idempotent replay.

## Engine Compliance

All approved providers use the shared adapter catalog, collection boundary, validation, normalization, canonical matching, provenance, freshness, lifecycle, monitoring, retry, and quality controls. No provider creates a domain Opportunity directly.

## Evidence

- Deterministic provider schema and URL tests passed.
- Existing Alpha provider, ingestion-pipeline, coverage-engine, and canonical-opportunity regression tests passed.
- Read-only live checks connected successfully to one public employer feed per provider.
- Bounded live samples returned valid titles, public source URLs, and observation timestamps.
- Lint, TypeScript validation, and the production build passed.

## Residual Limits

- These are employer-scoped connectors; broad coverage requires a maintained, approved employer-source registry and scheduling.
- Personio feeds exist only when the employer enables its XML interface.
- Provider interfaces and terms require periodic revalidation.
- No staging deployment was performed as part of this local implementation mission.
