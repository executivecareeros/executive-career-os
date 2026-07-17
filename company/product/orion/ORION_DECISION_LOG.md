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

## Standing decisions

- Paid placement never overrides recommendation relevance.
- Every provider enters through `OpportunityProvider` and the canonical Coverage Engine.
- Unknown remains Unknown; no completion-by-fabrication.
- Employer claims begin after M2; publishing begins after claim governance and M3 readiness.
- Historical opportunity truth is retained; source closure does not mean deletion.
