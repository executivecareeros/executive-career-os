# Opportunity Factory Autonomous Expansion — 2026-07-18

## Outcome

Orion now expands verified public employer coverage during the existing protected scheduler cycle. It discovers publicly indexed Greenhouse, Ashby, SmartRecruiters and Lever employers, verifies active jobs through each provider's public endpoint, skips registered sources, prioritizes the highest-yield verified employers, and registers only a bounded cohort through the shared Opportunity Coverage Engine.

No AI model, embedding service or token-consuming process is used.

## Measured evidence

| Measure | Result |
|---|---:|
| Current canonical opportunities | 30,912 |
| Current active employers | 456 |
| Current represented countries | 131 |
| Fresh opportunities | 30,907 |
| Latest scheduled jobs | 6/6 completed |
| Latest newly changed records | 7 |
| AI tokens | 0 |
| Public-index candidates evaluated in expansion proof | 2,618 |
| Verified employer cohort | 1,000 |
| Advertised active jobs across verified cohort | 74,836 |
| Providers represented | Greenhouse, Ashby, SmartRecruiters |

The 74,836 figure is provider-advertised source inventory, not yet canonical ORENDALIS inventory. Every source must still run through normalization, provenance, lifecycle and canonical deduplication before it can increase the visible job count.

## Controls

- Maximum 50 new sources per cycle; default 18.
- Existing careers URLs are skipped before verification.
- Provider index failures are isolated from healthy providers.
- Discovery falls back across three recent public indexes when the newest index is unavailable.
- Global and EU Lever boards use the existing certified public Postings API adapter.
- Registration remains workspace scoped and replay safe.
- Public discovery failure cannot interrupt normal opportunity ingestion.
- No scraping of authenticated pages, credentials, cookies or access controls.
- Canonical inventory remains the only product count.

## Validation

- Live public discovery proof: pass.
- Public-index fallback proof: pass; 8 verified sources and 425 advertised active jobs recovered while four provider-index queries were unavailable.
- Provider-failure isolation: pass.
- Scheduler authentication/durability contract: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Global employer expansion | 🟢 Autonomous expansion ready | 96% | Critical | Deploy and measure the first registered expansion cohort |
| Company Intelligence | 🟢 Advanced | 94% | Critical | Enrich newly canonical employers from verified sources |
| Opportunity Intelligence | 🟢 Advanced | 87% | Critical | Preserve evidence and ranking as inventory expands |
| Search Quality | 🟢 Advanced | 88% | Critical | Validate relevance against the larger corpus |
| Atlas Improvements | 🟢 Advanced | 82% | Critical | Calibrate explanations on new canonical opportunities |
| Public Launch Readiness | 🟡 In Progress | 64% | Critical | Complete live executive acceptance after inventory expansion |
