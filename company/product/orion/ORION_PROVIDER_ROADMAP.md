# Orion Provider Roadmap

Status is evidence-based. “Production” requires successful scheduled runs and durable run records; an implemented adapter alone is not production.

| Provider | Status | Priority | Volume / geography | Approach and access | Terms / limits | Owner | Tests | Health / rollout | Maintenance / deprecation |
|---|---|---:|---|---|---|---|---|---|---|
| Greenhouse | Production (isolated network staging) | P0 | High; global technology employers | Public employer job-board API; no credentials | Public endpoints; cohort rate limits and attribution required | Luna within Sol contract | `test:greenhouse-connector`, `test:opportunity-scheduler` | 15-minute schedule; durable runs; last verified healthy 2026-07-17 | Low; pause on sustained source failure or terms change |
| Lever | Production (isolated network staging) | P0 | High; North America, Europe, and Asia | Official public Lever Postings API; no credentials | Read-only employer-published records; cohort rate limits and attribution required | Luna within Sol contract | `test:lever-connector`, provider expansion, scheduler, ingestion, universe, and company regression suites | 12-hour schedule; 273-record first run and replay completed; second run changed 0 and ignored 273 | Low; pause on sustained source failure or terms change |
| Ashby | Production (isolated network staging) | P0 | High-growth global technology | Official public Job Postings API; no credentials | Employer-board scope, attribution, and cohort rate limits required | Luna within Sol contract | `test:ashby-connector`, discovery pipeline, durable ingestion, scheduler, Orion metrics | Two 12-hour employer schedules; 238-record first pass and zero-change replay; scoped lifecycle verified healthy 2026-07-17 | Low; pause on source/terms change or sustained health failure |
| Company career / JobPosting | In development | P0 | Broad and strategically important | Official employer page and structured `JobPosting` data | SSRF, crawl permission, rate limit, and source-truth controls | Sol contract; Luna adapters | `test:provider-expansion`, `test:source-expansion` | Factory extension exists; cohort not active | Medium |
| SmartRecruiters | Production (isolated network staging) | P0 | High; global | Official public Posting API; employer-scoped and credential-free for public postings | Read-only public postings, source attribution, bounded concurrency, and cohort rate limits | Sol / Opportunity Factory | Connector, source-factory, scheduler, provider-expansion, connector-operations, type safety, lint, and build | 102 verified schedules; 4/4 successful runs; first run plus zero-change replay; 750 canonical records at 2026-07-18 capture | Low |
| Teamtailor | Research | P1 | Strong Europe | Public career-site data where permitted | Confirm terms/rate limits | Luna | Contract test required | Not registered live | Medium |
| Recruitee | Adapter ready | P1 | Europe / global SMB-midmarket | Public careers API | Per-employer validation | Luna | Provider expansion tests | No live schedule | Low |
| Workable | Production-certifiable; staging cohort pending | P0 | Global | Public account feed through six-hook scaffold | Per-employer validation; incremental lifecycle until completeness is evidenced | Luna | Manifest v1.0, common certification, provider expansion, scheduler, ingestion, metrics, lint, and build passed | No live schedule or inventory evidence | Low |
| Personio | Adapter ready | P1 | Europe | Public XML feed | Per-employer validation | Luna | Provider expansion tests | No live schedule | Low |
| Workday | Blocked | P1 | Very high; global enterprise | Authorized tenant or provider-approved interface | Legal/terms uncertainty; tenant variability | Founder gate + Sol | None until approved | No collection | High |
| iCIMS | Research | P1 | Enterprise North America | Authorized/public employer interface | Terms and tenant variability | Sol review | Contract test required | Not active | High |
| LinkedIn | Blocked for automated collection; user import approved | P1 | Very high; global | Consent-based URL/email observation; resolve employer source | No scraping, account automation, credentials, or cookies; partnership required for broader access | Founder partnership gate | `test:linkedin-bridge` | User import only | High |
| Manual / URL / PDF | Production product path | P1 | User-supplied | Authorized import into same canonical pipeline | Private/workspace scoped | Luna | import and bridge tests | User triggered | Medium |

## Global marketplace access classification

The provider portfolio is assessed by the access actually offered, not by consumer traffic. A large consumer marketplace is not an inventory source unless its official interface and terms permit Orendalis to retrieve, normalize and display its listings.

| Ecosystem | Official access found | Orendalis decision | Revisit trigger |
|---|---|---|---|
| Indeed | Job Sync API for ATS/job-distributor partners to create, update and expire jobs on Indeed | Not an inventory connector | Indeed offers a licensed job-search/inventory feed suitable for Orendalis |
| LinkedIn | Restricted Talent Solutions partner APIs for posting and apply workflows | User-consented bridge only; partnership application remains the compliant expansion path | Written inventory/data permission from LinkedIn |
| Glassdoor | No supported official bulk job-inventory retrieval interface evidenced | Do not automate or scrape | Official licensed retrieval program becomes available |
| Google for Jobs | Search feature plus Indexing API for notifying Google about publisher-owned job pages | SEO distribution channel, not an inventory source | Google publishes an authorized retrieval interface |
| ZipRecruiter | Partner Jobs API for jobs a partner posts and manages | Not an inventory connector | Licensed search-inventory access is offered |
| StepStone / Totaljobs | Job-ad feeds and ATS apply integrations that publish customer jobs to StepStone properties | Not an inventory connector | Licensed retrieval/syndication agreement is offered |
| SEEK | Contractual recruitment-software partner API for mutual advertiser customers | Approval-gated; not autonomous inventory access | SEEK approves Orendalis's retrieval use case and Founder accepts required terms |
| We Work Remotely | Public RSS exists, but official API terms prohibit using its data to build a job-search service | Do not ingest without written permission | Written permission for the Orendalis use case |
| Wellfound, FlexJobs, Monster, CareerBuilder, XING, InfoJobs, Naukri, Boss Zhipin, 51job, Zhaopin, Wantedly, Computrabajo, OCCMundial, Catho, Bayt, Jobberman, Careers24 | No supported official bulk inventory interface evidenced in this bounded review | No retries, scraping or protected-page automation | Provider publishes a suitable official interface or responds to a targeted partnership path |

Official evidence: [Indeed Job Sync API](https://docs.indeed.com/job-sync-api), [LinkedIn Talent Solutions APIs](https://learn.microsoft.com/en-us/linkedin/talent/), [Google Indexing API](https://developers.google.com/search/apis/indexing-api/v3/using-api), [Google JobPosting guidance](https://developers.google.com/search/docs/appearance/structured-data/job-posting), [ZipRecruiter Partner Jobs API](https://www.ziprecruiter.com/partner/documentation/job-api/), [StepStone API](https://api.stepstone.com/home/), [SEEK API terms](https://www.seek.com.au/content/terms/new-api-terms-seek-au.pdf), [We Work Remotely feed](https://weworkremotely.com/remote-job-rss-feed), and [We Work Remotely API terms](https://weworkremotely.com/api-terms-and-guidelines).

This classification prevents repeated unsuccessful attempts. Marketplaces in the final row receive one new review only when their official access or partnership conditions materially change.

## Provider contract

All adapters implement `OpportunityProvider` in `frontend/lib/discovery/types.ts`, declare Provider Manifest v1.0, register through `registry.ts` / `providers/factory.ts`, normalize through `normalizer.ts`, and persist through `OpportunityIngestionPipeline` and `SupabaseOpportunityIngestionSink`. Shared request, retry, pagination, batch, health, scaffold, and certification behavior lives in the Provider SDK. Required outcomes are provenance, canonicalization, deduplication, lifecycle, freshness, durable run health, retry behavior, and workspace isolation. Provider-specific persistence is prohibited.

## Rollout rule

Research → Approved → In Development → Staging → Production. A provider becomes Degraded after warning-threshold health failure, Paused when source truth cannot be protected, and Deprecated when terms, reliability, or maintenance cost no longer justify its canonical contribution. SmartRecruiters passed durable first-run and replay admission on 2026-07-18. Workable remains the next isolated-staging cohort candidate and is not counted as live before equivalent evidence.
