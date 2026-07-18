# Company Intelligence Staged Activation — Engineering Report

> Date: 2026-07-18 · Governing specification: ODS 4.0 · Environment: isolated staging

## 1. Outcome
The bounded Company Intelligence cohort is live in staging. Four of five reviewed companies produced useful official evidence; the identical second run wrote no duplicate observations.

## 2. Highest-ROI Finding
The dominant activation defect was safe `www` canonicalization, not extraction quality. Supporting same-boundary HTTPS redirects increased useful yield from 0/5 to 4/5 without weakening the SSRF boundary.

## 3. Founder Value Delivered
Company pages can now move from repeated placeholder copy to evidence-backed official descriptions while preserving provenance, Unknown states and replay history.

## 4. Cohort
The reviewed cohort was AvePoint, BAYADA Home Health Care, Bitpanda, Brandwatch and Cision. Only canonical public domains were activated.

## 5. Migration
`202607180006_company_intelligence_observations.sql` was applied to isolated staging. It adds append-only evidence history and the guarded persistence function; no production database was changed.

## 6. Configuration
Staging was limited to five explicitly allowlisted domains. Production expansion remains disabled pending Founder acceptance.

## 7. Retrieval Repair
The official retriever now follows at most three HTTPS redirects within the same verified hostname boundary, revalidates public DNS at every hop and rejects off-domain redirects.

## 8. First Measured Run
Approved 5; eligible 5; attempted 5; retrieved 4; useful 4; persisted 4; unchanged 0; failed 1; official facts 4; bytes 1,980,361; activation duration 1,352 ms.

## 9. Second Measured Run
Approved 5; eligible 5; attempted 5; retrieved 4; useful 4; persisted 0; unchanged 4; failed 1; official facts 4; bytes 1,980,098; activation duration 1,383 ms.

## 10. Idempotency
The second run recognized all four successful fingerprints as unchanged. Database verification found exactly one observation for each successful company and none for the unavailable publisher.

## 11. Failure
BAYADA's configured official jobs site returned `OFFICIAL_COMPANY_UNAVAILABLE`. No substitute fact was inferred and no empty observation was stored.

## 12. Company Intelligence Review
AvePoint, Bitpanda, Brandwatch and Cision each have one persisted official fact and one append-only observation. BAYADA remains Unknown.

## 13. Opportunity Intelligence Review
The surrounding scheduler completed all three provider jobs in both measured runs. No opportunity-ranking behavior was changed.

## 14. Atlas Review
Facts remain compatible with the evidence-preserving Atlas adapter. No Atlas reasoning or unsupported inference was introduced.

## 15. User-Facing Review
The data foundation is ready for Founder review on staging company pages. Product completion is withheld until the populated briefing experience is accepted.

## 16. Security Review
HTTPS, public DNS, response type and 2 MB limits remain enforced. Private/reserved addresses and off-boundary redirects are rejected. Persistence remains service-role-only.

## 17. Privacy Review
Only public company-site evidence was processed. No personal data, credentials or secrets were recorded.

## 18. Observability Review
Both activation runs emitted aggregate attempt, retrieval, usefulness, persistence, replay, byte, duration and failure-code metrics without fact contents.

## 19. Performance
Activation added 1.35–1.38 seconds for five companies. The wider scheduler completed in 26.2–26.9 seconds.

## 20. Reliability
Measured official-site yield was 80%. Replay stability was 100% for successfully retrieved companies.

## 21. Cost
Runtime AI token usage was zero. No paid provider was introduced. Incremental staging cost was existing network and database usage only.

## 22. Tests
Passed: official retrieval, same-boundary redirect, off-domain redirect rejection, activation, persistence, fact extraction, TypeScript, ESLint and production build (126 routes).

## 23. Database Evidence
Five cohort rows were inspected. Four successful companies each had one observation and one current fact after two runs; the unavailable company had zero.

## 24. Deployment
Commit `0f61cf2` deployed Ready to the isolated network staging project and received its stable project alias.

## 25. Repository Change
`0f61cf2 Allow verified company domain redirects` contains the narrow retrieval repair and regression tests.

## 26. External Changes
Only isolated staging was changed: one additive migration and bounded staging configuration. Production DNS, production domains, Microsoft 365 and production Supabase were untouched.

## 27. Residual Operational Issue
The existing coverage aggregation RPC exceeded its statement timeout (`57014`) during these runs. Provider scheduling and Company Intelligence activation still completed; this is tracked separately and did not invalidate cohort evidence.

## 28. Rollback
Set the activation limit to zero or remove the staging allowlist. The additive observation history remains auditable and does not require destructive rollback.

## 29. Acceptance Status
Engineering activation: PASS. Security boundary: PASS. Idempotency: PASS. Founder UX/evidence review: PENDING.

## 30. Backlog Impact
FB-007 advanced to 90%, FB-008 to 91%, and FB-018 to 92%. All are Founder Review Required rather than Complete.

## 31. Expansion Gate
Do not expand beyond the reviewed cohort until the Founder accepts evidence presentation and the unavailable-site policy is defined from measured behavior.

## 32. Next Highest-ROI Work
Review the four populated company briefings in staging, confirm that source/confidence/freshness are understandable, and decide whether BAYADA should use another verified official corporate domain.

## 33. Risks
- Publisher availability can reduce yield.
- Official marketing copy may be factual but incomplete.
- Coverage telemetry timeout reduces operational visibility until optimized.

## 34. CTO Recommendation
Accept the staged activation as technically validated. Move to Founder evidence/UX acceptance before cohort expansion or production activation.

## 35. Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Website Redesign | Founder Review Required | 70% | High | Validate desktop/mobile visual journey |
| Homepage Redesign | Founder Review Required | 80% | High | Measure first-time comprehension |
| Branding & Logo | In Progress | 75% | High | Tokenize typography, spacing and iconography |
| Company Intelligence | Founder Review Required | 92% | Critical | Review four populated briefings and unavailable-site handling |
| Atlas Improvements | In Progress | 70% | Critical | Complete unified conversation/history UX |
| Executive Rooms | Planned | 5% | High | Conduct safe MVP discovery |
| Executive Workspace | In Progress | 65% | High | Integrate documents, calendar and extended opportunity types |
| Knowledge Graph | In Progress | 55% | High | Add remaining executive and domain relationships |
| Trust Engine | In Progress | 45% | High | Unify product-wide trust facts |
