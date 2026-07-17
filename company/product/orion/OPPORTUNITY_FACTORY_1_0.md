# Opportunity Factory 1.0

Last updated: 2026-07-17 · Status: reusable cohort factory validated locally; live expansion pending isolated-staging activation

## Outcome and baseline

The limiting constraint is employer-source admission. The existing Coverage Engine already normalizes, canonicalizes, deduplicates, schedules, monitors, and preserves source history, but employer cohorts previously depended on individually constructed schedule records.

| Measure | Before | After this increment | Evidence boundary |
|---|---:|---:|---|
| Active registered employers | 7 | 7 | No cohort was activated |
| Healthy active employer sources | 7 measured employers across 3 providers | Unchanged | No durable run was performed |
| Raw source observations | 1,043 | 1,043 | Live read-only checks are excluded |
| Active canonical opportunities | 1,042 | 1,042 | No duplicate inflation |
| Executive opportunities | 157 | 157 | Commercial subset is not yet separately measured |
| Enabled provider platforms | 3 | 3 | Greenhouse, Lever, Ashby |
| Production-capable or production-certifiable platforms | 5 | 5 | Greenhouse, Lever, Ashby, Workable, and SmartRecruiters; configuration factory is provider-neutral |
| Valid company-logo coverage | Unknown | Unknown | No authoritative logo denominator exists yet |
| Freshness within 48 hours | 89.1% | Not remeasured | Requires a durable network snapshot |
| Duplicate consolidation | 0.1% | Not remeasured | Existing canonical inventory |

## Methods evaluated

| Method | Coverage leverage | Cost | Reliability / compliance | Decision |
|---|---|---|---|---|
| Configuration-driven cohorts on supported ATS platforms | High employer yield; eight adapter routes currently detectable | No license or AI cost; one shared deployment | Employer-published structured records with existing provenance and lifecycle controls | **Selected now** |
| EURES / national employment-service exchange | Potentially more than one million European vacancies | Interface and redistribution access not yet established | Official network, but no verified public collection API or reuse grant in current evidence | Pursue access discovery, not implementation |
| Adzuna multi-country API | High aggregation leverage across target markets | Credential required; commercial terms and production economics require review | Official API, but account and usage terms are an external gate | Evaluate after free employer-direct expansion |
| Public remote-job feeds | Fast raw volume | Low technical cost | Remotive public terms prohibit using its feed to collect signups; unsuitable for Orendalis acquisition without a paid agreement | Rejected for the public feed |
| Custom employer crawlers | Potentially broad | High engineering and maintenance cost | Fragile source truth, robots, layout, and legal risk | Last resort only |

Evidence: [EURES](https://employment-social-affairs.ec.europa.eu/european-employment-services-eures_en), [Adzuna API overview](https://developer.adzuna.com/overview), [Remotive public API terms](https://remotive.com/remote-jobs/api), [USAJOBS API](https://developer.usajobs.gov/api-reference/), and [SmartRecruiters Posting API](https://developers.smartrecruiters.com/docs/posting-api).

## Selected strategy

`EmployerSourceInput[]` is the versioned configuration boundary. A batch of up to 1,000 employers can now be prepared without provider-specific code or a deployment per employer. The factory:

1. normalizes the employer domain and careers URL;
2. detects the approved ATS or structured career-site adapter;
3. generates a stable employer-source key;
4. removes duplicate input sources;
5. validates sources with bounded concurrency;
6. isolates invalid or unavailable sources instead of rejecting the batch;
7. produces globally scoped schedule records with provenance and compliance basis;
8. inserts only missing schedules; and
9. makes replay idempotent through the existing workspace/provider/source uniqueness contract.

Founder geography and role preferences never filter the global inventory. They remain recommendation inputs.

## Factory economics

A deterministic local proof prepared 1,000 unique SmartRecruiters employer configurations in 6.91 ms, with zero provider requests, deployments, infrastructure changes, or AI tokens. This proves configuration-processing capacity, not source validity or inventory yield. Health validation and collection remain provider-bound operations.

- **Initial engineering cost:** one reusable admission layer and two deterministic test suites.
- **Ongoing engineering cost:** source-list qualification and failure review; not adapter code per supported employer.
- **Licensing cost:** zero for supported public employer sources; paid aggregators remain gated.
- **Infrastructure cost per 10,000 opportunities:** Unknown until a 1,000-employer staging cohort is measured. No new service or recurring cost was introduced.
- **AI-token cost per 10,000 imported opportunities:** zero for discovery, validation, normalization, fingerprints, scheduling, and unchanged-record processing.
- **Atlas token use:** new or materially changed records remain eligible; unchanged records retain the current analysis fingerprint and status.
- **Maintenance burden:** shared by provider platform, with one failing source isolated from the batch.

## Deterministic token control

Every normalized opportunity now receives a stable content fingerprint derived from source-controlled title, employer identity, location, country, description, employment type, and publication date. Observation timestamps do not alter it. An unchanged refresh preserves current Atlas analysis; a material content change marks analysis Pending. This avoids default reassessment of unchanged descriptions without changing Atlas reasoning.

## Rollback

- Remove the cohort factory export and module; existing schedules continue unchanged.
- Remove fingerprint fields; canonical opportunities and previous Atlas assessments remain intact.
- Disable any newly admitted schedule without deleting history.
- No schema or migration rollback is required for this increment.

## Next multiplication gate

The next bottleneck is a verified employer-source directory. The highest-return next mission is to build and validate the first demand-led configuration cohort across existing ATS platforms, then execute isolated-staging first runs and replays. Only those durable results may change employer, opportunity, country, industry, freshness, logo, or executive-coverage counts.
