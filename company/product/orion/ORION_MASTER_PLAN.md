# Orion Master Plan

This is the execution source of truth for the Orion program. Strategy, metric definitions, provider decisions, employer intelligence, opportunity intelligence, major decisions, and the current operational snapshot are maintained in the sibling Orion documents.

## Mission and North Star

Build the world’s most comprehensive and trusted Executive Opportunity Intelligence Network: one canonical, attributable, fresh opportunity; verified employer truth; explainable Atlas guidance; global coverage; and executive action without job-board noise.

## Current production baseline

Phoenix II is present on `main` (`2b1d92c` is an ancestor of the current branch). The current verified network build is `986b164`. Isolated network staging runs one Greenhouse employer schedule every 15 minutes. The last two observed runs completed without errors and were idempotent. Verified evidence: 170 raw source records, 169 canonical opportunities, 41 executive-title opportunities, 1 active canonical employer, 0 strictly verified employers, 168 opportunities observed within 36 hours, and 0 duplicate source identifiers. These figures are a point-in-time staging baseline, not a claim about production-wide global coverage.

## Architecture baseline and current-state map

| Capability | Real implementation | State / gap |
|---|---|---|
| Canonical opportunity | `frontend/types/opportunity.ts`, `lib/opportunity-universe.ts` | Implemented; product and network lifecycle vocabulary need separation |
| Provider contract/registry | `lib/discovery/types.ts`, `registry.ts`, `providers/factory.ts`, `production-catalog.ts` | Stable extension point; contract health tests required per provider |
| Providers | `providers/{greenhouse,lever,ashby,workable,recruitee,personio,company-career-site}.ts` | Greenhouse live in network staging; others are adapters, not live providers |
| Normalization/deduplication | `normalizer.ts`, `pipeline.ts`, `opportunity-universe.ts` | Implemented; cross-provider evidence will test collision quality |
| Persistence/provenance | `supabase-ingestion.ts`, `opportunities.payload.sources` | Implemented atomically in canonical payload; append-only provenance expansion awaits transaction RPC |
| Durable scheduling/queue/runs | migrations `202607170002`–`004`, `scheduler-runtime.ts`, `/api/operations/opportunity-refresh` | Implemented and authenticated; provider-health surface missing |
| Employer registry | migrations `202607170005`–`006`, `upsertEmployer()` | Canonical identity implemented; verified-domain cohort missing |
| Network metrics/GOCI | migration `202607170007`, `orion-metrics.ts` | Implemented this increment; staging deployment/measurement pending |
| Opportunity pages/decisions | `app/opportunities`, migration `202607140002` | Usable decision loop; structured intelligence completeness varies by source |
| Company pages | `app/companies` | Live canonical foundation; useful hiring intelligence awaits M2 evidence |
| Search | `app/opportunities/page.tsx`, opportunity filtering/ranking modules | Product search exists; structured network search telemetry/semantic retrieval missing |
| Atlas | reasoning/decision migrations, opportunity intelligence modules | Evidence-led deterministic foundation; separate recommendation confidence/outcome metrics missing |
| Applications | `applications` and activity tables/routes | Existing product capability; network/application telemetry link incomplete |
| Compensation | `compensation_records`, opportunity salary fields | Storage exists; live coverage is zero in current cohort |
| Security | workspace RLS, service-role scheduler claim, SSRF tests | Strong boundary; every new RPC/provider requires isolation/security review |
| Deployment | Vercel projects, authenticated cron, Supabase migrations | Isolated network staging verified; production Orion metrics not yet deployed |
| Mobile/accessibility | responsive app routes and prior acceptance | Must be revalidated for every user-facing Orion change |

### Architecture risks

- Opportunity `status` mixes executive workflow and source lifecycle; resolve before mature closure automation.
- Canonical sources are embedded JSON; at M2 scale, normalized source observation queries/indexing may be required.
- Region/country values are not ISO-normalized, reducing GOCI precision.
- Provider schedules are workspace-scoped; a global network tenancy boundary must be made explicit before multi-customer scale.
- Append-only provenance tables are not yet transactionally expanded by ingestion.
- Search/interaction telemetry is incomplete, so success and recommendation metrics remain Unknown.

## Current milestone

**M1 — Measured canonical network.** Target: 1,000+ active canonical opportunities, 100+ verified canonical employers, three reliable production providers, measurable freshness/duplicates/health, executive classification, and geographic reporting. M1 is not complete.

## Milestones

- **M1:** targets above; acceptance requires secured metric evidence, healthy scheduled runs, canonical replay safety, and regional breakdown.
- **M2:** 10,000 active, 1,000 verified employers, six reliable providers, rich employer/opportunity intelligence, useful detail pages, regional GOCI/contribution/hiring metrics, structured search, trustworthy confidence/freshness. Then begin employer claim—not unrestricted publishing.
- **M3:** 100,000 active, 10,000 employers, mature intelligence/dedup/search/Atlas/global coverage, claim and verified administration, Employer Portal 1.0, and governed direct publishing through the same canonical pipeline.
- **M4:** 1,000,000 active + historical records, continuously refreshed global employer graph, provider diversity, strong GOCI, trend/demand/network intelligence, API-ready architecture, production employer platform, measurable Atlas quality, and enterprise observability/security/cost control.

Targets are unchanged from the Founder directive. Any change requires an entry in `ORION_DECISION_LOG.md`.

## Phase roadmap and acceptance

0. **Release-candidate completion:** Phoenix II code is pushed; close only with authenticated production truth, desktop/390px acceptance, tag, and release evidence.
1. **Measurement:** secured canonical/provider/employer/freshness/duplicate/geographic/executive metrics, GOCI breakdown, provider health, operational surface. Current phase.
2. **Provider expansion:** stable provider contract, retry/rate-limit/health/provenance/contract tests, staged Greenhouse → Lever → Ashby → structured career sources.
3. **Employer registry:** discovery, domain/career/ATS verification, canonical registration, continuous monitoring.
4. **Opportunity intelligence:** structured title/seniority/function/geography/remote/compensation/requirements/eligibility/confidence with provenance.
5. **Company intelligence experience:** evidence-led active/history/distribution/velocity/trend/provider timeline and relevance; no demo statistics.
6. **Search/discovery:** structured filters, saved/application/watch state, observable ranking, then semantic/similar/related explanations.
7. **Atlas:** traceable recommendation and non-recommendation, evidence, gaps, alignment, progression, demand, confidence and uncertainty.
8. **Employer claim:** after M2 only; verified ownership/admin/corrections/analytics/audit/disputes without truth suppression.
9. **Employer publishing:** after claim stability/M3 readiness; validated drafts through the existing pipeline and quality gates.
10. **Global scale:** partition/queue/region/backpressure/cache/cost/index/retention/DR/SLO/API work only when measured scale requires it.

## Current KPIs

The current point-in-time evidence is listed in the baseline and `ORION_EXECUTION_STATUS.md`. Metric definitions and thresholds are in `ORION_METRICS.md`. The secured RPC and GOCI implementation must be deployed before they become the authoritative repeating snapshot.

## Roadmap summaries

- **Providers:** activate the lowest-risk, highest-coverage public employer ecosystems through the common contract; never count an adapter as production. See `ORION_PROVIDER_ROADMAP.md`.
- **Employers:** move from canonical identity to strict domain verification, hiring evidence, relations, and later governed claims. See `ORION_EMPLOYER_INTELLIGENCE.md`.
- **Opportunities:** improve structured truth, lifecycle, closure accuracy, completeness, search, and explainable decision evidence. See `ORION_OPPORTUNITY_INTELLIGENCE.md`.
- **Atlas:** preserve deterministic evidence boundaries, add distinct confidence/outcome telemetry, and improve explanations only from canonical evidence.
- **Search:** structured searchable fields and telemetry first; semantic retrieval after M2 quality foundations.
- **Employer platform:** claim after M2, publishing after M3 readiness; all employer input passes the canonical intelligence pipeline.
- **Global scale:** scale on observed throughput/latency/cost/SLO evidence, not forecasted complexity.

## Dependency map

Metrics → trustworthy M1 decisions. Provider health + contract tests → safe provider expansion. Provider diversity → cross-source dedup proof. Verified domains → employer intelligence. Structured opportunity fields → search + Atlas. M2 acceptance → claim. Stable claim governance + M3 readiness → publishing. Volume/latency evidence → Phase 10 architecture.

## Risks and technical debt

| Risk/debt | Impact | Control / next action |
|---|---|---|
| One live provider/employer cohort | No coverage defensibility | Add Lever/Ashby cohorts after metrics deploy |
| Zero strictly verified employers | M1 employer target unproven | Domain verification workflow/cohort |
| JSON source observations | Query/index cost at scale | Measure first; normalize only with evidence |
| Mixed lifecycle/status | Incorrect active/closed truth | Versioned network lifecycle schema before automated closure |
| Geographic free text | Misleading coverage | ISO normalization and explicit remote scope |
| Missing telemetry | Cannot measure search/Atlas outcomes | Privacy-safe product events at M2 boundary |
| Provider terms change | Legal/availability risk | Provider registry review, pause/deprecate rules |
| Scheduler secret/service role | High-impact credential | Server-only storage, authenticated route, rotation runbook |
| Company-page sparsity | Trust risk | Show Unknown and evidence, never synthesized facts |

## Blockers and highest-value next task

No Founder gate blocks the next step. Apply `202607170007` to isolated network staging, deploy the matching code, read/verify the secured Orion snapshot, then activate compliant Lever and Ashby employer cohorts and strict employer-domain verification. Production changes require the existing release authorization gate.

## Completed work and release history

- Phoenix II foundation: `2b1d92c`.
- Scheduler/service isolation: `f15006c`, `a6f4068` and related authenticated route work.
- Canonical employer registry: `4aebafe`.
- Cross-provider employer identity protection: `7a00e7c`.
- Employer refresh repair: `986b164`.
- Orion program and M1 metrics: current increment (commit assigned after validation).

Historical Phoenix and Revenue Opportunity Engine records remain audit evidence. Major decisions are indexed in `ORION_DECISION_LOG.md`.

## Ownership and approval boundaries

- **Luna:** adapters inside established contracts, enrichment, company/opportunity/search UI, accessibility/mobile/performance, bugs and routine releases. Luna must not change metric definitions, RLS, canonical identity, scheduler security, or structural schemas without Sol review.
- **Sol:** provider/canonical/search/Atlas architecture, ingestion infrastructure, security/RLS/scaling, high-risk migrations and platform incidents.
- **Founder approval:** legal/provider terms, paid licensing or material cost, material personal-data change, irreversible architecture, employer governance, business model, or commercial commitment.

## Change log

- 2026-07-17: Orion operating system established; M1 baseline recorded; secured metrics/GOCI v1 implemented; existing target milestones preserved.
