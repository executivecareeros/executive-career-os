# Orion Provider Roadmap

Status is evidence-based. “Production” requires successful scheduled runs and durable run records; an implemented adapter alone is not production.

| Provider | Status | Priority | Volume / geography | Approach and access | Terms / limits | Owner | Tests | Health / rollout | Maintenance / deprecation |
|---|---|---:|---|---|---|---|---|---|---|
| Greenhouse | Production (isolated network staging) | P0 | High; global technology employers | Public employer job-board API; no credentials | Public endpoints; cohort rate limits and attribution required | Luna within Sol contract | `test:greenhouse-connector`, `test:opportunity-scheduler` | 15-minute schedule; durable runs; last verified healthy 2026-07-17 | Low; pause on sustained source failure or terms change |
| Lever | Production (isolated network staging) | P0 | High; North America, Europe, and Asia | Official public Lever Postings API; no credentials | Read-only employer-published records; cohort rate limits and attribution required | Luna within Sol contract | `test:lever-connector`, provider expansion, scheduler, ingestion, universe, and company regression suites | 12-hour schedule; 273-record first run and replay completed; second run changed 0 and ignored 273 | Low; pause on sustained source failure or terms change |
| Ashby | Production (isolated network staging) | P0 | High-growth global technology | Official public Job Postings API; no credentials | Employer-board scope, attribution, and cohort rate limits required | Luna within Sol contract | `test:ashby-connector`, discovery pipeline, durable ingestion, scheduler, Orion metrics | Two 12-hour employer schedules; 238-record first pass and zero-change replay; scoped lifecycle verified healthy 2026-07-17 | Low; pause on source/terms change or sustained health failure |
| Company career / JobPosting | In development | P0 | Broad and strategically important | Official employer page and structured `JobPosting` data | SSRF, crawl permission, rate limit, and source-truth controls | Sol contract; Luna adapters | `test:provider-expansion`, `test:source-expansion` | Factory extension exists; cohort not active | Medium |
| SmartRecruiters | Research | P1 | High; global | Official/public tenant postings where permitted | Confirm per-interface terms and limits | Luna | Contract test required | Not registered live | Medium |
| Teamtailor | Research | P1 | Strong Europe | Public career-site data where permitted | Confirm terms/rate limits | Luna | Contract test required | Not registered live | Medium |
| Recruitee | Adapter ready | P1 | Europe / global SMB-midmarket | Public careers API | Per-employer validation | Luna | Provider expansion tests | No live schedule | Low |
| Workable | Production-certifiable; staging cohort pending | P0 | Global | Public account feed through six-hook scaffold | Per-employer validation; incremental lifecycle until completeness is evidenced | Luna | Manifest v1.0, common certification, provider expansion, scheduler, ingestion, metrics, lint, and build passed | No live schedule or inventory evidence | Low |
| Personio | Adapter ready | P1 | Europe | Public XML feed | Per-employer validation | Luna | Provider expansion tests | No live schedule | Low |
| Workday | Blocked | P1 | Very high; global enterprise | Authorized tenant or provider-approved interface | Legal/terms uncertainty; tenant variability | Founder gate + Sol | None until approved | No collection | High |
| iCIMS | Research | P1 | Enterprise North America | Authorized/public employer interface | Terms and tenant variability | Sol review | Contract test required | Not active | High |
| LinkedIn | Blocked for automated collection; user import approved | P1 | Very high; global | Consent-based URL/email observation; resolve employer source | No scraping, account automation, credentials, or cookies; partnership required for broader access | Founder partnership gate | `test:linkedin-bridge` | User import only | High |
| Manual / URL / PDF | Production product path | P1 | User-supplied | Authorized import into same canonical pipeline | Private/workspace scoped | Luna | import and bridge tests | User triggered | Medium |

## Provider contract

All adapters implement `OpportunityProvider` in `frontend/lib/discovery/types.ts`, declare Provider Manifest v1.0, register through `registry.ts` / `providers/factory.ts`, normalize through `normalizer.ts`, and persist through `OpportunityIngestionPipeline` and `SupabaseOpportunityIngestionSink`. Shared request, retry, pagination, batch, health, scaffold, and certification behavior lives in the Provider SDK. Required outcomes are provenance, canonicalization, deduplication, lifecycle, freshness, durable run health, retry behavior, and workspace isolation. Provider-specific persistence is prohibited.

## Rollout rule

Research → Approved → In Development → Staging → Production. A provider becomes Degraded after warning-threshold health failure, Paused when source truth cannot be protected, and Deprecated when terms, reliability, or maintenance cost no longer justify its canonical contribution. Workable is the next P0 certification candidate after Ashby.
