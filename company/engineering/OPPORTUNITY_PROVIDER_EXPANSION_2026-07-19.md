# Opportunity Provider Expansion — 2026-07-19

## Outcome

The zero-token Opportunity Factory now discovers, verifies, schedules, normalizes and canonicalizes public employer feeds from seven certified provider ecosystems: Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Recruitee and Personio.

Recruitee uses the authorization-free Careers Site API. Personio uses employer-enabled public XML job feeds. Both enter the existing Opportunity Coverage Engine; neither creates provider-specific persistence, identity or lifecycle logic.

## Live evidence

| Measure | Result |
|---|---:|
| Public-index employer candidates | 6,293 |
| Employer feeds verified in bounded sample | 44 |
| Verification failures isolated | 12 |
| Public-index failures | 0 |
| Healthy sources selected | 14 |
| Provider ecosystems represented | 7/7 |
| Provider-advertised active jobs | 1,520 |
| AI tokens | 0 |

The 1,520 figure is source-advertised inventory in the selected verification cohort, not yet canonical ORENDALIS inventory. Only normalized, provenance-preserving, deduplicated records count as live product inventory.

## Controls

- Common Crawl index requests are sequential and politely spaced rather than issued as a parallel burst.
- Wildcard source ecosystems rotate through indexed pages instead of repeatedly sampling the same prefix.
- Candidate verification is bounded, concurrent and failure-isolated.
- Source selection activates one healthy employer from every available certified ecosystem before filling remaining capacity by active-job yield.
- Employer feeds remain public and authorization-free; no account automation, cookies, access-control bypass or protected-page scraping is used.
- Existing workspace isolation, normalization, provenance, lifecycle and canonical deduplication remain unchanged.
- LinkedIn, Workday and any provider requiring contractual acceptance, paid licensing or ambiguous permission remain approval-gated.

## Validation

- Provider expansion: pass.
- Seven-provider certification and replay: pass.
- Scheduler security and durability: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass, 134 routes.
- Live mixed-provider discovery: pass.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| 3M Opportunity Inventory | 🟡 Factory expanding | 1.09% | Critical | Ingest the new source cohorts and measure canonical yield |
| 250K Employer Network | 🟡 Factory expanding | 0.50% | Critical | Convert verified public candidates into healthy monitored sources |
| Provider Ecosystem | 🟢 Seven certified public ecosystems | 70% | Critical | Evaluate the next lawful high-yield ecosystem without weakening gates |
| Global Employer Expansion | 🟢 Autonomous | 98% | Critical | Measure 24-hour source-to-canonical conversion |
| Company Intelligence | 🟢 Advanced | 94% | Critical | Enrich canonical employers from verified source evidence |
| Opportunity Intelligence | 🟢 Advanced | 87% | Critical | Recalibrate ranking on the expanded inventory |

