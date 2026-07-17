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

## 2026-07-17 — Separate ATS careers provenance from official employer domains

- **Context:** a Greenhouse board proves an employer careers source but does not prove the employer's official corporate domain.
- **Options considered:** store the ATS host as official domain; omit the board; preserve it as careers provenance while official domain remains Unknown.
- **Chosen option:** preserve the public board as `careers_url`, never as `official_domain`.
- **Reasoning:** company pages remain useful without presenting an ATS hostname as corporate identity.
- **Trade-offs:** official-domain coverage is currently 0%; Extended Intelligence Coverage reports that gap.
- **Reversibility:** verified official domains can be added later without changing canonical identity.
- **Owner:** Sol / Employer Intelligence.
- **Affected:** Greenhouse normalization, employer ingestion, company surfaces, coverage metrics.
- **Follow-up:** add a verified-domain workflow in a later employer-intelligence increment.

## 2026-07-17 — Score exact Greenhouse board identity at 90

- **Context:** two legacy employers had exact board identity and source provenance but predated recorded employer-resolution confidence.
- **Options considered:** leave confidence Unknown; infer from company name; assign the existing high-reliability provider score only when board identity and source URL are explicit.
- **Chosen option:** deterministic 90 identity-resolution confidence for explicit Greenhouse board provenance.
- **Reasoning:** this measures confidence in canonical identity resolution, not employer quality or verification, and requires no fuzzy matching.
- **Trade-offs:** verified-employer count remains zero until official-domain verification exists.
- **Reversibility:** later evidence may raise the score; the migration never lowers stronger evidence.
- **Owner:** Sol / Employer Intelligence.
- **Affected:** legacy Greenhouse employer observations and the confidence metric.
- **Follow-up:** retain the same evidence contract for future Greenhouse cohorts.

## Standing decisions

- Paid placement never overrides recommendation relevance.
- Every provider enters through `OpportunityProvider` and the canonical Coverage Engine.
- Unknown remains Unknown; no completion-by-fabrication.
- Employer claims begin after M2; publishing begins after claim governance and M3 readiness.
- Historical opportunity truth is retained; source closure does not mean deletion.

## 2026-07-17 — Certify Workable through the scaffold without claiming complete snapshots

- **Context:** Workable already had a public-feed adapter, but had not passed the M2X manifest, scaffold, and permanent certification gates.
- **Options considered:** keep its direct adapter; generalize Workable mapping into the framework; implement it through the existing six-hook scaffold.
- **Chosen option:** retain Workable-specific locator and mapping behavior, use the existing scaffold unchanged, and declare incremental lifecycle until the public feed proves complete-inventory semantics.
- **Reasoning:** this validates the factory without speculative abstraction or false closure authority.
- **Trade-offs:** Workable cannot deactivate missing source observations until complete-feed behavior is evidenced in isolated staging.
- **Reversibility:** the adapter still implements `OpportunityProvider`; no data, schema, scheduler, or canonical-model migration is required.
- **Owner:** Sol / Opportunity Coverage Engine.
- **Affected:** Workable adapter, Manifest v1.0, common incremental lifecycle certification, and provider roadmap.
- **Follow-up:** select a lawful employer cohort and execute isolated-staging first run/replay before classifying Workable as live.

## 2026-07-17 — Extract proven provider behavior into a versioned acceleration framework

- **Context:** Greenhouse, Lever, and Ashby repeated request, retry, health, provenance, snapshot, and certification work; Workable is the next candidate.
- **Options considered:** keep provider-local implementations; build a fully generic provider engine; extract only behavior proven across certified providers.
- **Chosen option:** Provider Manifest v1.0, a bounded Provider SDK, a six-hook JSON scaffold, and one deterministic certification harness over the existing Coverage Engine.
- **Reasoning:** provider-specific mapping remains explicit while eleven certification concerns are reused consistently and future adapters require no engine redesign.
- **Trade-offs:** the framework adds an initial shared code surface; APIs with materially different behavior may use the SDK directly rather than the minimal scaffold.
- **Reversibility:** `OpportunityProvider` remains unchanged, so adapters can revert to direct implementation without data or scheduler migration.
- **Owner:** Sol / Opportunity Coverage Engine.
- **Affected:** Greenhouse, Lever, Ashby, provider certification, and the Workable entry gate.
- **Follow-up:** complete repository certification and certify Workable without modifying the framework unless measured evidence requires it.

## 2026-07-17 — Reconcile exact employer identity across provider locators

- **Context:** Greenhouse and Lever use different provider-specific employer keys even when they publish the same employer and role.
- **Options considered:** require identical provider keys; add provider-specific persistence; reconcile only when normalized employer names match exactly while retaining all source identities.
- **Chosen option:** preserve provider locators for collection and provenance, while allowing exact normalized employer-name reconciliation across providers. Conflicting identities within the same provider remain separate.
- **Reasoning:** one real opportunity must remain one canonical opportunity without weakening provenance or introducing provider-specific architecture.
- **Trade-offs:** legal-entity aliases that are not exact remain separate until verified alias evidence exists.
- **Reversibility:** the matching rule is deterministic and can be versioned when verified alias governance is introduced.
- **Owner:** Sol / Opportunity Coverage Engine.
- **Affected:** cross-provider canonical reconciliation and M2A provider certification.
- **Follow-up:** reuse the contract for Ashby and add verified employer aliases only through governed evidence.

## 2026-07-17 — Scope complete-snapshot reconciliation by employer feed

- **Context:** Ashby certification used two employer schedules under one provider. Provider-wide reconciliation let one complete employer snapshot close the other employer's source observations; inventory above 1,000 also exposed PostgREST default-page truncation during replay.
- **Options considered:** one schedule per provider; provider-specific persistence; retain shared architecture and declare stable feed scopes on complete snapshots.
- **Chosen option:** keep the common Coverage Engine, page the complete workspace inventory, scope complete-snapshot closure to declared employer/feed keys, and reactivate canonical opportunities when an active source is observed again.
- **Reasoning:** independent cohorts cannot close each other, replays remain idempotent at scale, and every provider keeps the same lifecycle contract.
- **Trade-offs:** adapters that claim complete snapshots must declare stable scope keys; absent scope retains legacy provider-wide behavior for compatibility.
- **Reversibility:** the optional scope field is backward compatible; a later migration may persist normalized feed scope separately.
- **Owner:** Sol / Opportunity Coverage Engine.
- **Affected:** provider batch contract, Greenhouse/Lever/Ashby-compatible lifecycle, paginated durable ingestion, canonical reactivation.
- **Follow-up:** require scoped snapshot contract in Workable certification tests.
