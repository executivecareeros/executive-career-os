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
| Live active canonical opportunities | 34,444 |
| Live canonical employers | 1,201 |
| Live hiring employers | 490 |
| Live monitored employer sources | 1,339 |

The 1,520 figure is source-advertised inventory in the selected verification cohort, not yet canonical ORENDALIS inventory. Only normalized, provenance-preserving, deduplicated records count as live product inventory.

## Controls

- Common Crawl index requests are sequential and politely spaced rather than issued as a parallel burst.
- Wildcard source ecosystems rotate through indexed pages instead of repeatedly sampling the same prefix.
- Candidate verification is bounded, concurrent and failure-isolated.
- Source selection activates one healthy employer from every available certified ecosystem before filling remaining capacity by active-job yield.
- Employer feeds remain public and authorization-free; no account automation, cookies, access-control bypass or protected-page scraping is used.
- Existing workspace isolation, normalization, provenance, lifecycle and canonical deduplication remain unchanged.
- LinkedIn, Workday and any provider requiring contractual acceptance, paid licensing or ambiguous permission remain approval-gated.
- The 15-minute production cycle now processes six provider jobs by default (24/hour), gives public discovery a strict 45-second budget and caps each newly registered cohort at 20 sources (14 by default). This preserves continuous expansion without allowing provider work plus public-index latency to consume Vercel's 240-second execution ceiling.

## Operational recovery

The live project lacked its server-only scheduler credential. Restoring an obsolete credential correctly failed closed with HTTP 403. It was replaced through the existing secure Supabase/Vercel controls without exposing or committing the value. The next authorized cycle reached the factory but exposed a separate 240-second timeout caused by combining twelve provider jobs with public-index discovery. The measured six-job default and bounded discovery budget above are the corrective action; sanitized failure evidence remains available without secrets.

## Next provider gate

Teamtailor documents a partner job-board integration, public webhooks and XML delivery, but requires partnership onboarding or a secret token. A non-binding inquiry was sent from the authorized ORENDALIS operating mailbox asking for the correct no-cost prelaunch path, technical requirements and contractual/data-use conditions. No integration, terms acceptance or customer-data access will occur before written permission and any required Founder approval.

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
| 3M Opportunity Inventory | 🟡 Factory expanding | 1.15% | Critical | Ingest bounded source cohorts and measure canonical yield |
| 250K Employer Network | 🟡 Factory expanding | 0.48% | Critical | Convert verified public candidates into healthy monitored sources |
| Provider Ecosystem | 🟢 Seven certified public ecosystems | 70% | Critical | Evaluate the next lawful high-yield ecosystem without weakening gates |
| Global Employer Expansion | 🟢 Autonomous | 98% | Critical | Measure 24-hour source-to-canonical conversion |
| Company Intelligence | 🟢 Advanced | 94% | Critical | Enrich canonical employers from verified source evidence |
| Opportunity Intelligence | 🟢 Advanced | 87% | Critical | Recalibrate ranking on the expanded inventory |
