# OGEU weekly expansion — 2026-07-20

> Run: `weekly-provider-permission-outreach`  
> Scope: bounded zero-cost public-source evaluation; no source registration or canonical write  
> Completed: 2026-07-20T08:36:48Z

## Measured result

| Measure | Result |
|---|---:|
| Public employer-feed candidates evaluated | 100 |
| Unique career-source URLs verified | 100 |
| Unique normalized employer names | 96 |
| Internal duplicate records avoided | 4 |
| Candidate employers accepted for later registry reconciliation | 96 |
| Sources verified healthy | 100 |
| Provider-advertised active opportunities discovered | 6,896 |
| Canonical opportunities created or updated | 0 |
| Live-registry duplicates avoided | Unknown |
| Countries verified | 0 |
| Official domains verified | 1 |

The 6,896 figure is public provider-advertised inventory only. It is not a canonical ORENDALIS opportunity count and was not added to product inventory.

## Evidence and boundaries

- Discovery source: Common Crawl `CC-MAIN-2026-25`, used only to find public ATS URLs.
- Verified provider endpoints: Greenhouse 34, Ashby 33, SmartRecruiters 33. All are approved public-feed ecosystems in the production provider catalog.
- The run made no account requests, did not accept terms, use cookies, scrape protected pages, or create credentials.
- Candidate evidence retained by the bounded run comprises canonical provider name, provider slug, public careers URL, observed active-job count, provider provenance, and verification time. Country, industry, ownership/status, aliases, employer tier, and most primary domains were not evidenced by these feeds and therefore remain Unknown/blank.
- The local environment has no authenticated, read-only Employer Universe/Coverage Engine access. Consequently the 96 candidates were not registered, scheduled, enriched, or reconciled against the 1,201-employer live snapshot. No claim is made about net-new live employers or canonical opportunities.

## Duplicates isolated

| Canonical candidate name | Provider slugs collapsed |
|---|---|
| American Iron and Metal | `AmericanIronandMetal`, `AmericanIronAndMetal` |
| Abridge | `abridge`, `Abridge` |
| Adaptive | `adaptive`, `Adaptive` |
| Acorns | `acorns`, `Acorns` |

## Provider health and failures

| Provider | Verified feeds | Health |
|---|---:|---|
| Greenhouse | 34 | healthy public API |
| Ashby | 33 | healthy public API |
| SmartRecruiters | 33 | healthy public API |

Fourteen candidates were excluded: 13 had no active public jobs and one returned HTTP 404. These failures were isolated; they did not affect the successful cohort.

## Founder approval gates

None created this cycle. The run stayed within already-approved public-feed providers. LinkedIn, Workday, Teamtailor, paid datasets, contract-only sources, and any source requiring permission remain outside this run.

## Next highest-value action

Run an authenticated, read-only registry reconciliation for these 96 normalized candidates, then register only the net-new, provider-healthy sources through the durable schedule path and measure canonical opportunity yield after ingestion.

## Verification

- `npm run test:employer-source-factory` — pass
- `npm run test:coverage-engine` — pass
