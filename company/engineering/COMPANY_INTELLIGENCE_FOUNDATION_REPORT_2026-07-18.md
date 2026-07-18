# Company Intelligence Foundation — Engineering Report

> Date: 2026-07-18 · Governing specification: ODS 4.0 · Track: Product / Company Intelligence

## 1. Outcome
The canonical Company Intelligence foundation now accepts structured facts only from a company's verified domain, preserves source/confidence/time, exposes a bounded Atlas context, and no longer reads the complete opportunity inventory for company screens.

## 2. Highest-ROI Finding
Company pages combined two risks: weak company facts and inventory-wide database reads. The smallest high-leverage correction was a reusable official-fact contract plus targeted reads, not another provider or speculative enrichment system.

## 3. Founder Value Delivered
Headquarters is no longer guessed from hiring geography. Official overview, industry, headquarters, size, products and services can be reused when verified evidence exists. Unknown facts remain Unknown.

## 4. Implementation
- Added deterministic Schema.org/OpenGraph extraction bounded to 2 MB.
- Enforced verified-domain/subdomain provenance for extracted and cached facts.
- Upgraded employer intelligence fingerprint to `employer-intelligence-v2`.
- Added evidence-preserving Atlas company context with explicit unknowns.
- Replaced company-directory opportunity-universe reads with cached aggregates.
- Replaced company-detail inventory scans with one company read and one company-scoped opportunity read.

## 5. User-Facing Changes
Official facts can replace repetitive hiring-only summaries. Headquarters is truthful. Company detail remains role-linked and evidence-first. No live official-fact population is claimed in this sprint.

## 6. Internal Changes
New pure extractor, payload contract, Atlas adapter, bounded queries and regression suites. No schema, provider, infrastructure or external state changed.

## 7. ODS 4.0 Compliance
Evidence-first, Unknown-by-default, reusable intelligence, no opaque AI, no speculative claims, no external mutations.

## 8. Founder Backlog Changes
FB-007 65→75%; FB-008 55→80% and Founder Review Required; FB-018 60→70%. Completion remains withheld pending live activation and Founder review.

## 9. Architecture Review
The implementation extends the existing company payload and employer intelligence path. It creates no parallel registry, provider architecture or database table.

## 10. Company Intelligence Review
Supported facts: overview, industry, headquarters, company size, product/service. Accepted sources: structured facts and OpenGraph description from verified official domains. Hiring footprint stays distinct from headquarters and operating footprint.

## 11. Opportunity Intelligence Review
No ranking or opportunity behavior changed. Company-detail opportunity reads are now company-scoped and capped at 500 active records.

## 12. Atlas Review
Atlas can consume only confirmed facts, unknowns, freshness, confidence and fingerprint through `toAtlasEmployerContext`. No inference or hidden reasoning was added.

## 13. Website and UX Review
Existing company briefing layout is retained. A local route inspection completed; fixture mode uses the legacy demonstration company workspace and therefore is not evidence of live official-fact population.

## 14. Branding and Logo Review
No brand or logo change.

## 15. Executive Rooms Review
Out of scope; no change.

## 16. Performance Evidence
Directory database fan-out changed from two full workspace datasets to one bounded company read (limit 1,000). Detail changed from two full datasets to one exact company read plus one company-scoped opportunity read (limit 500). Production latency, database time, CPU and memory remain Unknown until deployed telemetry exists.

## 17. Security Review
Off-domain facts are rejected. Source URLs are parsed, official-domain constrained and never fetched by this pure module. Payload facts require valid field, URL, time and 0–100 confidence. No secrets or personal data added.

## 18. Observability Review
Deterministic fingerprints support change detection. Retrieval/persistence coverage and failure telemetry remain for activation.

## 19. CFO Cost Review
AI cost: $0. Infrastructure/storage/bandwidth change: $0 in this sprint. Bounded reads reduce expected database/network cost. Future official-source retrieval cost is Unknown and must be measured before expansion.

## 20. AI Token Usage
Runtime AI tokens: 0. Extraction is deterministic and cached-fact compatible.

## 21. Tests and Validation
Passed: official company facts, employer intelligence/Atlas context, company query boundaries, live product truth, inventory authority, ESLint, TypeScript and production build (126 routes). Google font retrieval required network-enabled build validation.

## 22. Risks
- Official websites may lack usable structured data.
- Existing company payloads do not yet contain the new official facts.
- Cached aggregate coverage after the next live refresh is Unknown.
- OpenGraph descriptions are publisher-authored but may be marketing-heavy; provenance remains visible.

## 23. Technical Debt Added
The payload contract is not yet backed by a scheduled retriever/persistence service.

## 24. Technical Debt Removed
Removed false headquarters inference, inventory-wide company queries and an unused opportunity-ID transfer to the browser.

## 25. Rollback Plan
Revert the sprint commit. Payload data and schema remain compatible because no migration occurred.

## 26. Commit
Main commit titled `Build evidence-backed company intelligence foundation`; final hash is reported in the sprint handoff.

## 27. Repository Status
Expected clean after commit. Push state reported separately; no push authorized in this sprint.

## 28. Staging Status
Not deployed in this sprint.

## 29. Production Status
Unchanged.

## 30. Screenshots or Visual Evidence
No current-commit staging screenshot: deployment was outside authority. Local route inspection passed, but fixture content was not accepted as evidence of live enrichment.

## 31. Founder Backlog Dashboard
| ID | Request | Status | Progress | Priority | Evidence | Next action |
|---|---|---:|---:|---|---|---|
| FB-007 | Evidence-backed company pages | In Progress | 75% | Critical | Domain-bound evidence contract | Activate retrieval |
| FB-008 | Useful company overview | Founder Review Required | 80% | Critical | Official overview or truthful fallback | Populate and review |
| FB-018 | Canonical Company Intelligence | In Progress | 70% | Critical | Extractor, Atlas adapter, bounded reads | Persist/history/measure |

## 32. Top 10 Highest-ROI Remaining Tasks
1. Activate bounded retrieval for a small verified-domain cohort.
2. Persist facts idempotently with observation history.
3. Measure official-fact coverage and extraction yield.
4. Add retrieval SSRF, redirect and content-type controls.
5. Add stale-fact refresh and conflict handling.
6. Surface official-fact freshness in the directory.
7. Reuse Atlas company context on opportunity review.
8. Add company comparison only after coverage is sufficient.
9. Measure company page p50/p95 after deployment.
10. Run Founder review on evidence clarity and usefulness.

## 33. Recommended Next Sprint
**Company Intelligence Activation.** Use a small approved cohort of verified official domains; retrieve public HTML with strict SSRF/redirect/content limits; persist facts idempotently; measure yield, latency, failure and cost; deploy only after review. Alternatives rejected: broad crawling (legal/operational risk), AI summaries (unsupported cost/claims), manual entry (does not scale). Expected duration: 1–2 focused engineering days. Success: ≥80% safe retrieval, ≥40% useful official overview yield, zero off-domain acceptance, zero duplicate observations, measurable p95 and cost.

## 34. Questions Requiring Founder Decision
Approval is required before activation/deployment or any broader external retrieval. No decision is required for this completed local foundation.

## 35. Final CTO Recommendation
Accept the foundation as validated engineering, not as completed Company Intelligence. Next approve a bounded activation cohort and require measured evidence before scale.
