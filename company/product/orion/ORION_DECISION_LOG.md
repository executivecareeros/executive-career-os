# Orion Decision Log

## 2026-07-17 — Establish Orion as the M1 execution source of truth

- **Context:** Phoenix II established product and durable network foundations, but roadmap and evidence were distributed across release records.
- **Options considered:** continue separate phase documents; replace historical documents; create one authoritative Orion program and preserve historical records.
- **Chosen option:** `company/product/orion/` is authoritative for M1–M4 execution. Historical Phoenix and Revenue Opportunity Engine records remain evidence and link forward.
- **Reasoning:** one living status prevents contradiction without destroying audit history.
- **Trade-offs:** a small documentation maintenance obligation accompanies every meaningful Orion change.
- **Reversibility:** reversible by an explicit superseding decision.
- **Owner:** Sol.
- **Affected:** company product/engineering records.
- **Follow-up:** Luna updates execution status after each routine Orion session.

## 2026-07-17 — Use strict employer verification

- **Context:** canonical employer identity exists, but an ATS account name is not equivalent to verified corporate identity.
- **Options considered:** count every canonical company; count confidence only; require domain + verification time + confidence ≥80.
- **Chosen option:** strict rule.
- **Reasoning:** M1 requires trusted employers, not inflated counts.
- **Trade-offs:** current verified count is zero despite a healthy canonical Datadog record.
- **Reversibility:** threshold may change only with measured false-positive/negative evidence.
- **Owner:** Sol / Employer Intelligence.
- **Affected:** metrics and future verification workflow.
- **Follow-up:** implement official-domain verification cohort.

## 2026-07-17 — Adopt profile-independent GOCI v1

- **Context:** geographic coverage must measure network supply, not Founder eligibility or preferences.
- **Options considered:** profile-weighted score; raw country count; fixed regional/component index with breakdown.
- **Chosen option:** fixed nine-region GOCI with density, employer/provider diversity, freshness, and quality components.
- **Reasoning:** comparable over time, transparent, and resistant to a single-user bias.
- **Trade-offs:** initial geography strings are not yet ISO-normalized; a single score can still hide gaps, so breakdown is mandatory.
- **Reversibility:** versioned; future formulas coexist historically.
- **Owner:** Sol.
- **Affected:** `orion-metrics.ts`, migration `202607170007`, metrics documentation.
- **Follow-up:** add normalized geography dimensions and operational surface.

## 2026-07-17 — Refresh the complete cohort and recover expired work

- **Context:** the first secured snapshot showed only 32.5% of active opportunities observed within 48 hours. The staging schedule refreshed ten records per run; a controlled 250-record run then exceeded its execution lease.
- **Options considered:** preserve the ten-record slice; increase cadence and repeatedly refresh the same slice; cache the run inventory and make expired jobs independently reclaimable.
- **Chosen option:** retain the existing provider and scheduler architecture, cache one workspace inventory per run, and decouple expired-job recovery from schedule due selection.
- **Reasoning:** this removes repeated reads and closes a durable-queue recovery gap without adding infrastructure or provider-specific architecture.
- **Trade-offs:** employer and opportunity writes remain sequential; live full-cohort duration must be measured before additional provider cohorts are enabled.
- **Reversibility:** code change is reversible; the isolated staging maximum can be reduced independently.
- **Owner:** Sol / Opportunity Coverage Engine.
- **Affected:** durable ingestion runtime, scheduler runtime, isolated network staging schedule.
- **Follow-up:** deploy, reclaim the expired job, run a second idempotent full refresh, and update the Orion baseline.

## Standing decisions

- Paid placement never overrides recommendation relevance.
- Every provider enters through `OpportunityProvider` and the canonical Coverage Engine.
- Unknown remains Unknown; no completion-by-fabrication.
- Employer claims begin after M2; publishing begins after claim governance and M3 readiness.
- Historical opportunity truth is retained; source closure does not mean deletion.
