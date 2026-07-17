# Orion Decision Log

## 2026-07-17 — Build Atlas Opportunity Review as orchestration over Orion

- **Context:** Orion M1A–M9 provide trusted knowledge, decisions, validation, governance, and communication semantics; Atlas needs an executive-facing opportunity review without a parallel reasoning system.
- **Options considered:** add a new Atlas scoring engine; assemble prose in the UI; compose M6 assessments through M9 experience objects into one canonical review.
- **Chosen option:** a twelve-section rendering-independent review with eligible and explicitly withheld paths.
- **Reasoning:** executives receive concise decision support while all evidence, confidence, uncertainty, conflict, and gate semantics remain governed by Orion.
- **Trade-offs:** contract validation does not prove live comprehension or trust; one consented M7 cohort remains required.
- **Reversibility:** Atlas orchestration is derived and non-mutating; Orion evidence and decisions remain unchanged.
- **Owner:** Sol / Atlas Product.
- **Affected:** executive opportunity review composition and Atlas product status.
- **Follow-up:** render one bounded existing opportunity surface and measure the live experience.

## 2026-07-17 — Separate executive communication semantics from presentation

- **Context:** M6–M8 govern evidence, decisions, validation, and learning, but multiple interfaces could communicate the same result inconsistently.
- **Options considered:** encode guidance in each UI; define prose templates; create one channel-neutral semantic contract with object and journey gates.
- **Chosen option:** ten canonical experience objects and seven journey contracts carry mandatory evidence, confidence, Unknown, conflict, alternative, and action disclosures.
- **Reasoning:** channels can evolve without changing meaning or permitting unsupported recommendations.
- **Trade-offs:** the contract does not itself prove that executives understand the communication; live comprehension still requires M7 validation.
- **Reversibility:** the versioned contract can be superseded while preserving earlier decision and communication records.
- **Owner:** Sol / Executive Experience.
- **Affected:** Atlas communication across web, mobile, APIs, reports, and future interfaces.
- **Follow-up:** integrate one bounded Opportunity Review surface and measure the complete journey through M7.

## 2026-07-17 — Govern institutional learning as immutable reviewed revisions

- **Context:** M7 can produce validation evidence, but evidence must not silently become organizational truth or alter historical recommendations.
- **Options considered:** automatically tune from outcomes; maintain mutable playbook notes; use one append-only learning ledger with explicit review, approval, scope, confidence, and expiry.
- **Chosen option:** ten canonical institutional domains share one versioned lifecycle; only current Approved records may produce bounded reuse projections.
- **Reasoning:** Orion can preserve what it has learned about its own processes while keeping evidence, uncertainty, authority, and history visible.
- **Trade-offs:** live learning cannot be claimed until a reviewed cohort exists; governance adds deliberate review work.
- **Reversibility:** reuse projections are non-mutating; records can be superseded or retired while every prior revision remains available.
- **Owner:** Sol / Governance Owner.
- **Affected:** validation-to-learning boundary, documentation, playbooks, evidence requirements, decision guidance, and engineering practices.
- **Follow-up:** collect the consented M7 cohort before proposing the first live institutional record.

## 2026-07-17 — Separate recommendation, feedback, outcome, and validity

- **Context:** acceptance, career outcome, and recommendation quality can disagree; collapsing them would create false learning evidence.
- **Options considered:** learn directly from clicks/outcomes; store one mutable decision record; preserve four append-only record types with independent evidence.
- **Chosen option:** immutable recommendation snapshots, structured executive feedback, separately verified outcomes, and reviewed validity judgments.
- **Reasoning:** an accepted recommendation is not necessarily correct and an offer does not prove the prior recommendation was evidence-valid.
- **Trade-offs:** learning requires deliberate review and larger samples; M7 fixture Learning Readiness remains Not ready.
- **Reversibility:** the validation layer is derived and changes no recommendation, graph evidence, confidence, or outcome history.
- **Owner:** Sol / Executive Intelligence.
- **Affected:** validation, calibration, and future learning inputs.
- **Follow-up:** collect a consented 20-case baseline before establishing production targets or changing models.

## 2026-07-17 — Prohibit automatic confidence calibration

- **Context:** calibration evidence may reveal drift, but small or biased samples cannot safely tune decision confidence.
- **Options considered:** automatically adjust confidence; report outcome-correlated confidence; report reviewed calibration evidence and require a versioned decision for changes.
- **Chosen option:** retain predicted confidence, observed outcome, reviewed validity, calibration error, drift, and reliability while making zero automatic adjustments.
- **Reasoning:** outcomes remain contextual and confidence changes require sufficient reviewed evidence.
- **Trade-offs:** detected drift creates an investigation, not an immediate model change.
- **Reversibility:** future versioned calibration can use retained history without rewriting it.
- **Owner:** Sol / Atlas.
- **Affected:** M6 confidence model validation.
- **Follow-up:** calculate live reliability only after at least 20 reviewed points and evaluate the 50-point calibration criterion.

## 2026-07-17 — Require five gates for every executive recommendation

- **Context:** the Knowledge Graph can support many conclusions, but knowledge volume does not prove decision value or executive trust.
- **Options considered:** domain-specific scores; free-form Atlas recommendations; one reusable decision assessment with mandatory quality, explainability, evidence, confidence, and trust gates.
- **Chosen option:** six domain models share one structured assessment; Atlas issues `Review evidence` only when all five gates pass and otherwise issues `Do not recommend` with a next evidence action.
- **Reasoning:** the same transparent standard applies across opportunities, employers, compensation, progression, market, and fit without opaque weights.
- **Trade-offs:** several useful-looking recommendations remain unavailable until career, profile, market-scope, and eligibility evidence exists.
- **Reversibility:** the decision layer is derived from the M5 bounded graph and changes no source evidence or canonical state.
- **Owner:** Sol / Executive Intelligence.
- **Affected:** Atlas decision input and explanation contract.
- **Follow-up:** validate explanation usefulness with real executives and measure decision outcomes before calibration.

## 2026-07-17 — Confidence equals the weakest required evidence

- **Context:** an average confidence score could conceal one unsupported requirement behind several strong facts.
- **Options considered:** weighted score; average evidence confidence; conservative weakest-evidence classification with conflict and missing-evidence caps.
- **Chosen option:** missing or conflicting requirements cap confidence at Low; otherwise confidence equals the weakest cited evidence, with Very High requiring two independent sources.
- **Reasoning:** no strong fact compensates for a weak required fact, and every level remains explainable.
- **Trade-offs:** confidence is deliberately conservative and is not a probability of career success.
- **Reversibility:** the model is versioned and can be calibrated using measured outcomes without rewriting evidence history.
- **Owner:** Sol / Atlas.
- **Affected:** all six decision domains.
- **Follow-up:** retain Unknown for unsupported live measures and collect outcome evidence before changing thresholds.

## 2026-07-17 — Establish one evidence-first Employment Knowledge Graph

- **Context:** certified connectors, operations, and engineering intelligence produced trustworthy evidence, but future intelligence would otherwise reason over provider-shaped records and duplicate identity/conflict logic.
- **Options considered:** let each intelligence module query raw records; introduce a graph database and rewrite persistence; add a deterministic canonical graph projection over existing normalized and operational evidence.
- **Chosen option:** `orion-knowledge-graph-v1`, a derived non-mutating projection with thirteen bounded entity kinds, eleven canonical relationship kinds, append-only evidence, explicit identity history, conflict retention, and a restricted Atlas view.
- **Reasoning:** it delivers immediate evidence-backed reasoning while permanently reducing provider and intelligence coupling; no schema or infrastructure expansion is justified before live query evidence exists.
- **Trade-offs:** the graph is currently projected in memory; durable live graph coverage and performance remain Unknown.
- **Reversibility:** projection and consumer contract can be removed without changing connector records, canonical inventory, scheduler, persistence, operations, or certification history.
- **Owner:** Sol / Employment Intelligence.
- **Affected:** Orion canonical intelligence model and Atlas input boundary.
- **Follow-up:** project one bounded staging cohort and measure live coverage, query latency, and storage economics before considering persistence.

## 2026-07-17 — Keep unsupported employer identities separate

- **Context:** employer names can match across ATS platforms without proving one legal identity.
- **Options considered:** merge normalized names; require every provider to share one key; prefer canonical key or employer-controlled domain and otherwise retain source-scoped identities.
- **Chosen option:** source-scoped separation until an evidenced identity decision exists; `Merged` decisions without evidence are rejected.
- **Reasoning:** false merges contaminate every downstream opportunity, company, market, and Atlas conclusion.
- **Trade-offs:** temporary duplicate employer candidates can remain pending.
- **Reversibility:** new evidence adds a merge decision without deleting prior entities, observations, or conflicts.
- **Owner:** Sol / Employer Intelligence.
- **Affected:** graph employer identity and future reconciliation.
- **Follow-up:** define governed legal-entity alias evidence only after a verified-domain cohort is measured.

## 2026-07-17 — Build intelligence only from versioned operations evidence

- **Context:** M3A made connector operations observable; M4 must explain changes without duplicating telemetry or speculating.
- **Options considered:** persist a second intelligence event stream; use probabilistic narrative generation; create deterministic projections over ordered operations snapshots.
- **Chosen option:** eleven reusable intelligence modules consume only `ConnectorOperationsSnapshot` history and produce evidence-qualified insights and advisory recommendations.
- **Reasoning:** operational understanding remains reproducible, provider-independent, reversible, and bounded by existing evidence.
- **Trade-offs:** fewer than three samples cannot establish a trend; fewer than five cannot establish an anomaly; live precision remains Unknown until staging history is evaluated.
- **Reversibility:** the pure intelligence projection can be removed without changing telemetry, providers, scheduler, persistence, or inventory.
- **Owner:** Sol / Engineering Intelligence.
- **Affected:** trend, anomaly, drift, pattern, recommendation, and Atlas advisory contracts.
- **Follow-up:** measure the model against durable staging history before considering any operational automation.

## 2026-07-17 — Keep Atlas Engineering Advisor advisory-only

- **Context:** engineering recommendations may identify an investigation but M4 does not authorize operational actions.
- **Options considered:** automatically retry or pause connectors; emit unstructured advice; return structured recommendations with evidence, alternatives, confidence, and impact.
- **Chosen option:** structured advisory-only recommendations; zero automated actions.
- **Reasoning:** engineers gain decision support without allowing inferred conclusions to mutate operational state.
- **Trade-offs:** humans remain responsible for investigation and remediation.
- **Reversibility:** advisor output is derived and non-mutating.
- **Owner:** Sol / Engineering Intelligence.
- **Affected:** Atlas engineering explanation contract.
- **Follow-up:** measure recommendation precision and unknown reduction on live operational history.

## 2026-07-17 — Derive operations from existing immutable evidence

- **Context:** four connectors certify through one platform, but health, replay, freshness, scheduler, and failure investigation remained distributed across run, queue, manifest, and certification records.
- **Options considered:** add a dashboard and new event database; add provider-specific logging; build a deterministic read-only projection over existing operational evidence.
- **Chosen option:** Engineering Operations Platform v1 projects one connector snapshot from manifests, probes, immutable runs, queue state, canonical inventory, and certification reports.
- **Reasoning:** Connector #100 receives common diagnostics without schema expansion, duplicate history, provider-specific observability, or silent assumptions.
- **Trade-offs:** employer delta remains Unknown until immutable run outcomes record employer-level change counts; live Workable health remains unclaimed without an approved cohort.
- **Reversibility:** projection code and tests can be removed without changing source history, connectors, scheduler, persistence, or canonical inventory.
- **Owner:** Sol / Engineering Operations.
- **Affected:** connector operations model, common certification command, and permanent Orion operations records.
- **Follow-up:** project durable staging history through the same model and validate alert thresholds before additional cohort activation.

## 2026-07-17 — Define OTS as the weakest measured control

- **Context:** an averaged operational score could hide an unsafe replay, stale connector, or failed certification.
- **Options considered:** weighted average; subjective health grade; minimum of every required measured control.
- **Chosen option:** OTS equals the weakest of health, replay safety, certification, freshness, failure control, recovery success, and determinism; missing evidence produces Unknown.
- **Reasoning:** no strong control can compensate for a failed safety invariant, and no arbitrary weights are required.
- **Trade-offs:** OTS is deliberately conservative and remains Unknown until all seven controls are measured.
- **Reversibility:** metric is versioned; future methodology changes preserve v1 history.
- **Owner:** Sol / Engineering Operations.
- **Affected:** operational measurement and connector acceptance evidence.
- **Follow-up:** measure OTS from controlled staging history.

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
