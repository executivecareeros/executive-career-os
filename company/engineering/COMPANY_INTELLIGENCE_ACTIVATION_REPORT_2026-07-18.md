# Company Intelligence Activation — Engineering Report

> Date: 2026-07-18 · Governing specification: ODS 4.0 · Track: Product / Company Intelligence

## 1. Outcome
A bounded, deterministic Company Intelligence activation path is implementation-complete and locally validated. It is disabled by default and has not contacted live company sites or changed external infrastructure.

## 2. Highest-ROI Finding
The missing product capability was not another enrichment algorithm; it was a safe bridge from verified official domains to durable, replay-safe facts.

## 3. Founder Value Delivered
ORENDALIS can now retrieve factual public company evidence without AI guessing, preserve its history, refresh only selected companies and report yield, failure and cost.

## 4. Implementation
- Added single-homepage official retrieval with public-network DNS checks, redirect denial, HTTPS, content-type, timeout and 2 MB limits.
- Added sequential activation capped at 25 companies and disabled unless explicitly configured.
- Added service-role-only persistence, idempotent company cache updates and append-only observation history.
- Added aggregate activation telemetry: attempted, useful, persisted, unchanged, failures, facts, bytes and duration.

## 5. User-Facing Changes
No current user-facing change is claimed until a staging cohort is activated and reviewed.

## 6. Internal Changes
The existing scheduler now has an optional Company Intelligence activation phase. No parallel company registry or provider system was created.

## 7. ODS 4.0 Compliance
Evidence-first, Unknown-by-default, deterministic extraction, reversible activation, bounded cost, explicit provenance and no external mutation in this sprint.

## 8. Founder Backlog Changes
FB-007 75→82%; FB-008 80→85%; FB-018 70→82%. Completion remains withheld pending staged activation and measured live evidence.

## 9. Architecture Review
The path reuses canonical companies, official domains, the current refresh scheduler and the existing company payload. Append-only observations are the only new durable structure.

## 10. Company Intelligence Review
Only one verified official homepage is retrieved per selected company. Structured facts remain constrained to overview, industry, headquarters, size, products and services.

## 11. Opportunity Intelligence Review
No opportunity ranking, ingestion, canonicalization or search behavior changed.

## 12. Atlas Review
No Atlas reasoning changed. Newly persisted confirmed facts remain compatible with the existing evidence-preserving Atlas adapter.

## 13. Website and UX Review
No surface was changed. Live usefulness must be assessed after staging data exists.

## 14. Branding and Logo Review
No change.

## 15. Executive Rooms Review
Out of scope; no change.

## 16. Performance Evidence
Retrieval is sequential, capped at 25, limited to 12 seconds and 2 MB per site. Unit fixtures and local persistence passed; live p50/p95 remain Unknown.

## 17. Security Review
Private, loopback, link-local, reserved and non-public DNS results are rejected. Redirects are not followed. Only HTML/XHTML is accepted. Persistence requires the service role by grant and runtime check.

## 18. Observability Review
Activation produces one bounded aggregate with retrieval, usefulness, persistence, replay, byte, duration and failure-code metrics. No fact values or secrets enter telemetry.

## 19. CFO Cost Review
Runtime AI cost is $0. This sprint incurred no provider or infrastructure charge. Live network, database and bandwidth cost remain Unknown until staged measurement.

## 20. AI Token Usage
Runtime AI tokens: 0. Retrieval and extraction are deterministic.

## 21. Tests and Validation
Passed: official retrieval security, activation, persistence contract, database replay idempotency, append-only enforcement, official fact extraction, employer intelligence, scheduler, static database validation, PostgreSQL constraints, RLS matrix, TypeScript, ESLint and production build (126 routes).

## 22. Risks
- Official sites may block retrieval or omit structured evidence.
- Publisher descriptions may be marketing-heavy; provenance and confidence remain visible.
- Live yield, latency and error distribution are not yet measured.
- Activation requires a migration and environment configuration before it can run.

## 23. Technical Debt Added
Stale-fact expiry and conflict adjudication beyond fingerprint replacement remain pending.

## 24. Technical Debt Removed
Removed the absence of a safe official retrieval boundary, replay-safe persistence and measurable activation telemetry.

## 25. Rollback Plan
Keep the activation limit at zero or revert the sprint commit. The new observation table is additive and company payloads remain backward compatible.

## 26. Commit
Prepared as `Activate bounded company intelligence pipeline`; final hash is reported in the handoff.

## 27. Repository Status
Expected clean after the local commit. No push is claimed.

## 28. Staging Status
Not deployed; no live cohort activated.

## 29. Production Status
Unchanged.

## 30. Screenshots or Visual Evidence
None: no current implementation was deployed, and fixture output is not accepted as live evidence.

## 31. Founder Backlog Dashboard
| ID | Status | Progress | Evidence | Next action |
|---|---|---:|---|---|
| FB-007 | In Progress | 82% | Safe official retriever | Activate reviewed staging cohort |
| FB-008 | Founder Review Required | 85% | Official overview or Unknown | Review populated examples |
| FB-018 | In Progress | 82% | Bounded activation + durable history | Deploy, measure and review |

## 32. Top 10 Highest-ROI Remaining Tasks
1. Deploy the additive migration to isolated staging.
2. Configure a staging activation limit of five.
3. Review the exact first official-domain cohort.
4. Run activation twice and confirm idempotency.
5. Measure retrieval and useful-fact yield.
6. Measure p50/p95 and failure distribution.
7. Review evidence quality on company pages.
8. Add stale-fact policy from measured behavior.
9. Expand only when safety and usefulness gates pass.
10. Reuse confirmed facts in opportunity review after Founder acceptance.

## 33. Recommended Next Sprint
**Company Intelligence Staged Activation.** Apply the additive migration, enable a five-company reviewed cohort, run twice and accept only if retrieval is safe, history is duplicate-free and evidence is useful. Expansion should depend on measured yield rather than ambition.

## 34. Questions Requiring Founder Decision
Approval is required before deploying the migration, enabling scheduler retrieval or selecting the first live official-domain cohort.

## 35. Final CTO Recommendation
Accept the activation path as validated engineering. Do not call Company Intelligence complete until a five-company staging cohort proves safe retrieval, useful evidence, idempotent replay and acceptable cost.
