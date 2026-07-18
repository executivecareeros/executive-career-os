# Company Intelligence Cohort Control — Engineering Report

> Date: 2026-07-18 · Governing specification: ODS 4.0 · Track: Product / Company Intelligence

## 1. Outcome
Company Intelligence activation now requires an explicit reviewed-domain allowlist as well as the existing bounded limit. Missing either control disables retrieval.

## 2. Highest-ROI Finding
A numeric limit controlled volume but not identity. Explicit domain selection is the smallest control that makes the first live cohort auditable.

## 3. Founder Value Delivered
The Founder can approve exactly which companies enter a trial without authorizing broad or accidental website contact.

## 4. Implementation
Added normalized hostname parsing, duplicate removal, invalid-domain rejection, a 25-domain maximum and allowlist-constrained company selection.

## 5. User-Facing Changes
None until staged activation produces reviewed facts.

## 6. Internal Changes
The scheduler reads `COMPANY_INTELLIGENCE_ACTIVATION_DOMAINS`; activation runs only when both domains and a positive limit exist.

## 7. ODS 4.0 Compliance
Bounded, explicit, reversible, evidence-first and disabled by default.

## 8. Founder Backlog Changes
FB-007 82→84%; FB-008 85→86%; FB-018 82→85%.

## 9. Architecture Review
No new service, provider, database structure or parallel registry.

## 10. Company Intelligence Review
Only canonical companies matching reviewed official domains and identity confidence ≥80 can enter activation.

## 11. Opportunity Intelligence Review
No change.

## 12. Atlas Review
No change.

## 13. Website and UX Review
No change.

## 14. Branding and Logo Review
No change.

## 15. Executive Rooms Review
No change.

## 16. Performance Evidence
The selected cohort is capped by the smaller of the configured limit, reviewed-domain count and 25. Live latency remains Unknown.

## 17. Security Review
Only syntactically valid normalized DNS hostnames enter the database filter. URLs, ports, paths, commas, localhost and malformed values are rejected.

## 18. Observability Review
Activation telemetry now reports the approved-domain count alongside retrieval and persistence outcomes.

## 19. CFO Cost Review
No external cost incurred. The control caps potential retrieval and storage cost before execution.

## 20. AI Token Usage
0 runtime tokens.

## 21. Tests and Validation
Passed allowlist normalization, duplicate rejection, bounded selection, disabled behavior, retrieval security, persistence contract, official facts, employer intelligence, database static validation, TypeScript, ESLint and the 126-route production build.

## 22. Risks
The first domains still require human review; live yield, latency and blocking behavior remain Unknown.

## 23. Technical Debt Added
No material debt added.

## 24. Technical Debt Removed
Removed accidental cohort selection based solely on identity confidence and age.

## 25. Rollback Plan
Unset either activation variable or revert the cycle commit.

## 26. Commit
Prepared as `Require reviewed company intelligence cohorts`; final hash reported after commit.

## 27. Repository Status
Expected clean and synchronized after commit and push.

## 28. Staging Status
Not deployed in this cycle.

## 29. Production Status
Unchanged.

## 30. Screenshots or Visual Evidence
Not applicable; no user-facing deployment.

## 31. Founder Backlog Dashboard
| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Website Redesign | 🟠 Founder Review Required | 70% | High | Validate desktop/mobile comprehension |
| Homepage Redesign | 🟠 Founder Review Required | 80% | High | Measure 30-second value comprehension |
| Branding & Logo | 🟡 In Progress | 75% | High | Complete typography, spacing and iconography |
| Company Intelligence | 🟡 In Progress | 85% | Critical | Activate five reviewed staging domains |
| Atlas Improvements | 🟡 In Progress | 70% | Critical | Unify conversation, history and contextual guidance |
| Executive Rooms | ⚪ Planned | 5% | High | Defer until core intelligence acceptance |
| Executive Workspace | 🟡 In Progress | 65% | High | Connect the existing executive journey |
| Knowledge Graph | 🟡 In Progress | 55% | High | Add remaining evidence-backed relationships |
| Trust Engine | 🟡 In Progress | 45% | High | Establish one reusable trust object |

## 32. Top 10 Highest-ROI Remaining Tasks
1. Select five official domains from canonical companies.
2. Apply the additive migration to staging.
3. Configure the two staging activation controls.
4. Run the cohort once.
5. Run it again for idempotency.
6. Measure retrieval yield.
7. Measure useful-fact yield.
8. Review evidence quality.
9. Review latency and failure codes.
10. Decide whether to expand or correct.

## 33. Recommended Next Sprint
Run the five-domain staged activation and accept it only with safe retrieval, useful evidence, duplicate-free replay and measured cost.

## 34. Questions Requiring Founder Decision
The external staging activation gate requires approval of deployment, migration application and the exact five domains.

## 35. Final CTO Recommendation
Accept cohort control as complete. Move next to a five-company staged trial; do not expand before measured acceptance.
