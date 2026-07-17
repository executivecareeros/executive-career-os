# Opportunity Factory Status

Last updated: 2026-07-18 · Authority: ODS 3.0 and Executive Opportunity Universe Directive

## Measured network

| Measure | Current durable evidence | Change in this increment |
|---|---:|---:|
| Active canonical opportunities | 10,260 and increasing under the live scheduler | +9,218 from the pre-X100 baseline |
| Executive-classified opportunities | 960 | +803 |
| Commercial opportunities | 1,157 | Newly measured |
| Canonical employer records | 1,068 | +1,061 |
| Official-API-verified ATS employer sources | 1,100 | +1,100 |
| Strict domain-verified employers | 17 | +17 |
| Enabled employer schedules | 1,066: Greenhouse and Ashby | +1,062 |
| Opportunity freshness within 48 hours | 10,255 of 10,260 | 99.95% |
| Remote opportunities | 1,624 | Newly measured |
| Source observations consolidated | 10,759 into 10,260 canonical opportunities | 499 duplicate observations consolidated |
| Provider run failures in the latest 30-minute checkpoint | 0 of 26 completed runs | No failures |

Verified ATS source identity and strict corporate-domain verification are deliberately separate. A source is counted as verified only after an official public provider API returns active postings for that employer board. A company is counted as strict domain-verified only when the registry also holds a supported official domain, verification timestamp, and identity confidence of at least 80.

## Factory automation increment

- Versioned configuration boundary accepts up to 1,000 employer sources per batch.
- Automatic approved-provider detection selects Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee, Personio, Workable, or a bounded structured company career page.
- Duplicate inputs are removed before network or persistence work.
- Health checks run with bounded concurrency and isolate failed sources.
- Repeated schedule registration inserts zero duplicates.
- A local 1,000-employer configuration proof completed in 6.91 ms with zero AI tokens and zero deployments.
- Public-index discovery produced 2,618 candidate employer boards; official provider APIs verified a bounded 1,100-employer cohort with 37,693 advertised active postings.
- The durable registry deduplicated those 1,100 source identities into 1,068 canonical employer records without inventing missing corporate domains.
- The isolated network scheduler runs every minute with an authenticated staging-only secret and no production domain.
- Atomic queue claims supported bounded concurrent workers; the observed live checkpoint completed 26 runs with zero failures and 5,051 canonical changes in 30 minutes.
- Stable opportunity content fingerprints preserve current Atlas analysis for unchanged records and mark materially changed records for reassessment.
- Employer-scoped canonical matching replaces the former full-inventory read on every provider refresh. At the current 10,260-opportunity checkpoint, a 250-role employer board reduces the comparison set by approximately 41×; at 100,000 global opportunities the same bounded board reduces it by approximately 400×.
- Empty complete snapshots retain the safe global fallback so a provider can still close previously active observations. No lifecycle or canonical identity rule was weakened for the scaling gain.
- Durable employer and opportunity counts remain unchanged until a validated cohort runs in isolated staging.

## ODS 3.0 persistence boundary

- Provider runs now submit canonical changes through a bounded, transaction-safe persistence RPC instead of issuing employer and opportunity writes for every record.
- The runtime batch size defaults to 100 and is constrained to 1–250 records.
- A workspace-scoped batch identifier makes retries idempotent; successful replays return the original telemetry without creating duplicate records.
- Company identity, employer observations, source reassignment, canonical opportunity changes, and durable batch telemetry commit or roll back together.
- The pipeline collapses multiple changes to the same canonical opportunity within one provider run before persistence.
- The canonical world registry contains 249 ISO 3166 countries and territories. Missing region, language, currency, industry, and country evidence remains unknown rather than inferred.
- Deterministic country, industry, provider-health, queue, and batch-persistence metrics are available through the staging intelligence RPC.
- Application payload tests remained bounded at 10,000, 100,000, and 1,000,000 records with zero AI tokens. These are application-side capacity measurements, not substitutes for live database evidence.

## SmartRecruiters admission evidence

- Official interface: employer-scoped public Posting API.
- Authentication: not required for public postings under current official documentation.
- Live read-only validation: 9 of 9 current public postings collected for the SmartRecruiters Inc sample employer on 2026-07-17.
- Geography observed: Germany, United Kingdom, and Poland.
- Work arrangement observed: 9 remote postings.
- Field evidence: employer, role, location, country, industry, department, function, employment type, seniority, publication time, description, source URL, and application URL.
- Snapshot: complete for the bounded sample; no records persisted.
- Certification: discovery, replay, pagination, canonicalization, employer resolution, opportunity resolution, lifecycle, scheduler compatibility, metrics, regression, and deployment readiness passed.
- Safety: read-only public records, no credential, no candidate data, no application submission, six-request detail concurrency, and employer-scoped lifecycle.

Sources: [SmartRecruiters Posting API](https://developers.smartrecruiters.com/docs/posting-api), [Customer API overview](https://developers.smartrecruiters.com/docs/customer-overview), and [Endpoints](https://developers.smartrecruiters.com/docs/endpoints).

## Current constraint

The per-record write-amplification constraint has been removed in code and the required database functions are installed in isolated staging. The next constraint is live database throughput evidence under the scheduler: the 1,000,000-opportunity tier is not production-approved until database duration, failure, lock, queue-latency, replay, and rollback measurements pass. The measured G20 country-market check has evidence in 18 of 19 countries; Russia is the remaining zero-evidence market. HeadHunter activation is prohibited until the Founder accepts the provider process and Orendalis receives written permission compatible with building the canonical Opportunity Universe. Ashby public metadata proves the active ATS board but does not expose a supported corporate domain, so domain verification remains unknown unless independent evidence exists. No domain is inferred from an employer name.
