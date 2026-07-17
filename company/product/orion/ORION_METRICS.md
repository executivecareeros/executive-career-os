# Orion Metrics

Version: `orion-m1-metrics-v1` · Network owner: Sol · Product interpretation: Founder/CPO

The secured database contract is `public.get_orion_network_evidence(workspace, observed_at)` in migration `202607170007_orion_network_metrics.sql`. GOCI calculation is `frontend/lib/discovery/orion-metrics.ts`. Values are workspace-isolated. Missing evidence returns zero/Unknown, never an estimate.

M2 quality uses version `orion-m2-quality-v1` in the same implementation. Provider Reliability Index (PRI) weights scheduler health 20%, ingestion success 30%, replay safety 20%, refresh consistency 15%, and error control 15%. Employer Resolution Accuracy (ERA) weights canonical-employer linkage 70%, duplicate-key control 20%, and replay consistency 10%. Opportunity Completeness Index (OCI) is present supported fields divided by all supported fields across title, location, application URL, compensation, work arrangement, employment type, and confidence. Regional Coverage Index (RCI) weights eight-region breadth 60% and volume balance 40%. Unsupported or unavailable evidence is never counted as present.

## Canonical metric dictionary

Unless stated otherwise, the update frequency is each successful provider run plus a daily operational snapshot; dashboard location is Company Control → Network Operations (planned M1 surface; RPC is the current authoritative interface).

| Metric | Business meaning and exact formula | Source | Target / warning / failure | Owner | Known limitation |
|---|---|---|---|---|---|
| Raw Opportunities | Unique current `(provider_id, original_id)` source observations in canonical payload sources | `opportunities.payload.sources` | M1 supporting measure; warn if below canonical; fail if source identity absent | Sol | Does not yet count rejected pre-normalization rows |
| Canonical Opportunities | All canonical rows including history | `opportunities` | M1 ≥1,000 active; no standalone alert | Sol | Workspace inventory, not global aggregate |
| Active Canonical Opportunities | Non-archived rows whose product status is not Archived/Closed/Rejected | `opportunities` | ≥1,000 / <1,000 / <500 | Network Ops | Network lifecycle and executive decision status still share fields |
| Historical Opportunities | Canonical minus active | `opportunities` | Informational; must never decrease unexpectedly | Sol | Full retention policy not yet formalized |
| Executive Opportunities | Active rows matching versioned executive-title classifier | `opportunities.title` | Coverage tracked; warn <20% of inventory | Product Intelligence | Regex classifier is deterministic but incomplete |
| Verified Employers | Active employers with official domain, verification time, confidence ≥80 | `companies` | ≥100 / <100 / <50 | Employer Intelligence | Verification workflow is not yet automated |
| Employers With Active Opportunities | Distinct `company_id` referenced by active canonical rows | `opportunities` | Trend upward weekly | Employer Intelligence | Excludes unresolved company identities |
| Countries Covered | Distinct known active country values | `opportunities.country` | M1 report; warn on week-over-week decline | Network Ops | Source labels need ISO normalization |
| Regions Covered | GOCI regions with at least one active opportunity | GOCI evidence | 9 / <7 / <5 | Network Ops | EMEA may be conservatively mapped to Europe until normalized |
| Providers Active | Distinct enabled provider schedules | `opportunity_provider_schedules` | ≥3 / <3 / 0 | Network Ops | Enabled does not alone mean healthy; read with success rate |
| Provider Success Rate | Successful or warning-complete runs ÷ all runs over 7 days ×100 | `opportunity_provider_runs` | ≥99% / <97% / <90% | Network Ops | Early cohorts have small samples |
| Provider Freshness | Per provider: hours since last successful run ÷ configured cadence; healthy ≤1.5× cadence | schedules/runs | ≤1.5× / >1.5× / >3× | Network Ops | Per-provider view is next dashboard increment |
| Opportunity Freshness | Active rows observed within 48h ÷ active rows ×100 | opportunity payload/updated time | ≥95% / <90% / <80% | Network Ops | Different source classes will later use policy-specific windows |
| Employer Freshness | Employers observed within 7d ÷ employers ×100 | `companies.last_observed_at` | ≥95% / <85% / <70% | Employer Intelligence | First cohort refreshes one employer |
| Duplicate Rate | max(raw unique source observations − canonical rows, 0) ÷ raw observations ×100 | sources + opportunities | ≤5% / >8% / >15% | Sol | Multi-source overlap is limited in first cohort |
| Canonicalization Confidence | Mean canonicalization confidence for active rows | payload | ≥90 / <80 / <70 | Sol | Provider normalization supplies current score |
| Employer Confidence | Mean employer identity confidence | `companies.identity_confidence` | ≥90 / <80 / <70 | Employer Intelligence | Average must be read with strict verified count |
| Opportunity Confidence | Mean source/opportunity confidence | payload | ≥85 / <75 / <65 | Product Intelligence | Not recommendation confidence |
| Recommendation Confidence | Mean separately persisted Atlas recommendation confidence | decision snapshots | ≥80 / <70 / <60 | Atlas | Not implemented; must remain Unknown until distinct evidence exists |
| Daily Opportunity Growth | Canonical rows created in trailing 24h | `opportunities.created_at` | Positive during cohort expansion | Network Ops | Refreshes without inserts correctly return zero |
| Weekly Employer Growth | Canonical employers created in trailing 7d | `companies.created_at` | Positive during M1 | Employer Intelligence | Quality gate applies; growth alone is not success |
| Opportunity Closure Accuracy | Verified closures correct ÷ audited closure transitions | lifecycle audit sample | ≥98% / <95% / <90% | QA | Not measurable until closure audit events exist |
| Stale Opportunity Rate | Active rows older than freshness window ÷ active rows ×100 | opportunities | ≤5% / >10% / >20% | Network Ops | Fixed 48h in v1 |
| Application URL Validity | Active application/source URLs passing safe HEAD/GET validation ÷ tested URLs | URL validation events | ≥98% / <95% / <90% | QA | RPC currently reports URL presence, not validity; validity remains Unknown |
| Compensation Coverage | Active rows with min or max compensation ÷ active ×100 | payload | Report by provider; M2 target ≥40% | Product Intelligence | Provider supply varies; never infer |
| Location Coverage | Active rows with specific known location ÷ active ×100 | payload | ≥95% / <90% / <80% | Network Ops | Country normalization pending |
| Industry Coverage | Active rows with known industry ÷ active ×100 | opportunity/company | M2 ≥80% / <60% / <40% | Employer Intelligence | Current provider does not supply reliable industry |
| Executive Classification Coverage | Active rows evaluated by versioned classifier ÷ active ×100 | classification events | 100% / <99% / <95% | Product Intelligence | Current RPC reports classified count, not evaluation coverage |
| Search Success Rate | Searches leading to result open/save/application ÷ searches | product events | ≥50% / <35% / <20% | Product | Telemetry not implemented; Unknown |
| Zero-Result Search Rate | Searches returning zero canonical results ÷ searches | product events | ≤10% / >20% / >35% | Product | Telemetry not implemented; Unknown |
| Recommendation Interaction Rate | Recommended impressions with open/watch/pursue/skip ÷ impressions | product events/decisions | ≥30% / <20% / <10% | Atlas | Impression telemetry incomplete |
| Provider Cost / Canonical Opportunity | Direct provider + incremental compute cost ÷ net canonical contributions | billing + runs | Report only when attributable | FinOps | Unknown for free/public sources; do not estimate |

## GOCI — Global Opportunity Coverage Index

GOCI is independent of all executive profiles. Regions are Worldwide Remote, North America, Latin America, Europe, United Kingdom, Middle East, Africa, Asia, and Oceania. The index always exposes the regional and component breakdown.

For each region, capped component scores are:

- Opportunity density: `active opportunities / 100 × 100` (30%).
- Employer diversity: `active employers / 20 × 100` (20%).
- Provider diversity: `active providers / 3 × 100` (15%).
- Freshness: `fresh active / active × 100` (20%).
- Canonical quality: `quality-complete active / active × 100` (15%).

Overall GOCI uses fixed market weights: North America 20%, Europe 18%, Asia 14%, Worldwide Remote 10%, UK 10%, Latin America 8%, Middle East 8%, Africa 6%, Oceania 6%. Missing regions score zero. Changing reference targets or weights requires an Orion decision log entry. Country, industry, function, executive-level, provider, employer, and freshness breakdowns remain visible beside the index; the single number is not a substitute for them.

Known limitation: v1 regional classification uses explicit source geography strings and conservative patterns. “Remote” without explicit scope is not Worldwide Remote. ISO country/region normalization is a P1 task.

## M5 Knowledge Graph measures

Version `orion-knowledge-graph-v1` is measured by the deterministic graph certification fixture.

| Measure | Exact formula | Fixture result | Live state |
|---|---|---:|---|
| Knowledge Graph Coverage | mean of entity, relationship, evidence, provenance coverage | 100% | Unknown |
| Entity Coverage | required foundational entity kinds present ÷ required kinds | 100% | Unknown |
| Relationship Coverage | required canonical relationship kinds present ÷ required kinds | 100% | Unknown |
| Evidence Coverage | entities with evidence IDs ÷ entities | 100% | Unknown |
| Provenance Coverage | evidence with connector, source, and observation time ÷ evidence | 100% | Unknown |
| Conflict Resolution Coverage | assertions not conflicted or retaining evidence for every value ÷ assertions | 100% | Unknown |
| Atlas Knowledge Readiness | minimum of entity, relationship, evidence, provenance coverage | 100% | Unknown |
| Future Intelligence Leverage | High only when Atlas Knowledge Readiness is 100% | High | Unknown |

Fixture results certify the contract, not live production completeness. Live values remain Unknown until a bounded durable staging cohort is projected and measured.

## M6 Decision Intelligence measures

Version `orion-decision-intelligence-v1` is measured by the deterministic six-domain certification fixture.

| Measure | Exact formula | Fixture result | Live state |
|---|---|---:|---|
| Decision Model Coverage | assessed registered domains ÷ six registered domains | 100% | Unknown |
| Explainability Coverage | assessments with summary, Unknowns, actions, and five gates ÷ assessments | 100% | Unknown |
| Evidence Traceability | assessments whose cited evidence resolves to graph evidence ÷ assessments | 100% | Unknown |
| Confidence Coverage | assessments with measured confidence or explicit insufficient-evidence state ÷ assessments | 100% | Unknown |
| Executive Trust Readiness | assessments disclosing uncertainty and issuing recommendations only when all gates pass ÷ assessments | 100% | Unknown |
| Future Intelligence Leverage | High when all six reusable domains are assessed through one contract | High | Unknown |

Three fixture domains produced decision support; three correctly withheld recommendations. Fixture results validate the contract, not live executive decision quality.

## M7 Executive Validation measures

Version `orion-executive-validation-v1` is measured by a deterministic two-case fixture covering all ten validation dimensions.

| Measure | Exact formula | Fixture result | Live state |
|---|---|---:|---|
| Validation Coverage | measured dimensions ÷ ten dimensions | 100% | Unknown |
| Recommendation Validation Rate | cases with reviewed judgment ÷ cases | 100% | Unknown |
| Confidence Calibration Coverage | cases with numeric confidence and reviewed binary judgment ÷ cases | 100% | Unknown |
| Executive Feedback Coverage | cases with structured feedback ÷ cases | 100% | Unknown |
| Outcome Coverage | cases with verified outcome ÷ cases | 100% | Unknown |
| Evidence Improvement Opportunities | insufficient evidence selections + additional evidence requests | 3 | Unknown |
| Learning Readiness | complete coverage + no unreviewed input + ≥20 feedback + ≥20 reviewed binary judgments | Not ready | Unknown |

The fixture proves that a positive outcome does not override a Not Supported judgment. No confidence adjustment or model tuning is automated.

## M2A measured snapshot — 2026-07-17

Greenhouse plus Lever produced 805 raw source observations, 804 canonical and active opportunities, 118 executive-classified opportunities, 5 measured employers, and 2 active providers. Provider success was 92.9% over the retained seven-day history; opportunity freshness was 85.8%; duplicate consolidation was 0.1%; canonicalization confidence was 90.0%; employer confidence was 72.0%. Provider-scoped employer and opportunity provenance were both 100%, with zero duplicate source identities and zero duplicate employer canonical keys.

GOCI is 58: North America 75, Europe 74, Asia 72, United Kingdom 60, Oceania 51, Middle East 50, Latin America 47, Africa 41, Worldwide Remote 0. This is network evidence only and is unaffected by Founder profile data.

## M2B measured snapshot — 2026-07-17

Greenhouse, Lever, and Ashby produced 1,043 raw source observations, 1,042 canonical and active opportunities, 157 executive-classified opportunities, 7 measured employers, and 3 enabled providers. Opportunity freshness was 89.1%; duplicate consolidation was 0.1%; canonicalization confidence was 90.0%; employer confidence was 77.1%. Retained seven-day provider success was 86.4%; failed certification attempts remain in audit history.

Ashby contributed 238 active observations from two employer cohorts. Its supported-field evidence contained 1,484 present values across 1,666 supported values: OCI 89.1%. All 238 Ashby opportunities linked to canonical employers. Network-wide employer linkage was 1,038 of 1,042 with zero duplicate canonical-employer keys and two consistent replay checks: ERA 99.7%. Ashby retained 8 certification attempts, 6 completed, 2 failed, 6 replay attempts, and 4 replay-safe attempts: PRI 82.1. RCI was 62.9 (breadth 87.5, balance 25.9), with Worldwide Remote still zero.

GOCI is 63: North America 83, Asia 80, Europe 78, United Kingdom 75, Oceania 62, Middle East 50, Latin America 47, Africa 41, Worldwide Remote 0. This is network evidence only and is unaffected by Founder profile data.

## Employer Intelligence Coverage

Version `orion-employer-intelligence-v1` is produced by `public.get_orion_employer_intelligence_coverage`. The denominator is every active canonical employer in the workspace; Unknown contributes zero.

- Registry Coverage uses eight equal components: canonical identity, provider identity, provenance, alias, freshness within seven days, recorded identity-resolution confidence, active opportunity count, and measured executive opportunity count.
- Extended Intelligence Coverage uses the same eight components plus official domain and careers URL, for ten equal components.
- Each numerator is the number of canonical employers with evidence for that component. Aggregate coverage is earned points divided by canonical employers × component count.
- Current Greenhouse evidence: 3 canonical employers; Registry 100%; Extended 90%; provenance 100%; confidence 100%; careers URL 100%; official domain 0%. Official domains remain Unknown rather than being inferred from ATS hosts.
