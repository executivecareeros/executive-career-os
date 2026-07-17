# Orion Metrics

Version: `orion-m1-metrics-v1` · Network owner: Sol · Product interpretation: Founder/CPO

The secured database contract is `public.get_orion_network_evidence(workspace, observed_at)` in migration `202607170007_orion_network_metrics.sql`. GOCI calculation is `frontend/lib/discovery/orion-metrics.ts`. Values are workspace-isolated. Missing evidence returns zero/Unknown, never an estimate.

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

## Employer Intelligence Coverage

Version `orion-employer-intelligence-v1` is produced by `public.get_orion_employer_intelligence_coverage`. The denominator is every active canonical employer in the workspace; Unknown contributes zero.

- Registry Coverage uses eight equal components: canonical identity, provider identity, provenance, alias, freshness within seven days, recorded identity-resolution confidence, active opportunity count, and measured executive opportunity count.
- Extended Intelligence Coverage uses the same eight components plus official domain and careers URL, for ten equal components.
- Each numerator is the number of canonical employers with evidence for that component. Aggregate coverage is earned points divided by canonical employers × component count.
- Current Greenhouse evidence: 3 canonical employers; Registry 100%; Extended 90%; provenance 100%; confidence 100%; careers URL 100%; official domain 0%. Official domains remain Unknown rather than being inferred from ATS hosts.
