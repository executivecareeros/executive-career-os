# Global Opportunity Intelligence Network Roadmap

> Purpose: Evolve the existing Opportunity Coverage Engine into ORENDALIS's trusted global opportunity intelligence network without replacing working foundations.

- **Authority:** ODS 2.0 and the Founder Global Opportunity Intelligence Network directive
- **Status:** Approved architectural direction; implementation remains phase-gated
- **Evidence date:** 17 July 2026
- **North star:** Trusted active canonical executive opportunities, not raw source volume

## Architecture Review

### Foundations to preserve

The current system already provides the correct starting boundaries:

- a shared provider-adapter contract and provider registry;
- employer-scoped Greenhouse, Lever, Ashby, Recruitee, Personio, Workable, and structured Company Career Site adapters;
- user-authorized manual, URL, document, recruiter-message, and LinkedIn-observation paths;
- normalized source observations with provenance and lifecycle evidence;
- canonical Opportunities with cross-source deduplication;
- freshness, closure, provider-health, retry, and quality measurements;
- demand-led source prioritization;
- one shared geographic eligibility and Opportunity Confidence Engine for Search and Atlas.

These components should be strengthened, not redesigned.

### Subsystems that do not yet satisfy the directive

| Subsystem | Current limitation | Required evolution |
| --- | --- | --- |
| Collection execution | Queue and run state are process-local; continuous collection is not independently durable | Persist jobs, leases, attempts, failures, and run metrics; invoke through deployment-safe scheduling |
| Provider inventory | Adapters exist, but enabled employers and live canonical contribution are not measured comprehensively | Maintain a durable provider/employer source registry with observed coverage and health |
| Canonical identity | Deterministic matching exists, but uncertain clusters and re-clustering are not operational workflows | Add merge evidence, confidence thresholds, conflict review, split/re-cluster history, and preferred-source policy |
| Normalization | Core fields are normalized, but field-level original/normalized/confidence/version evidence is incomplete | Introduce versioned field assertions without discarding source text |
| Freshness and closure | Snapshot closure exists; adaptive cadence and repeated-disappearance thresholds are incomplete | Use source-specific policies and observed change frequency; audit every state transition |
| Entity relationships | Company evidence is embedded in Opportunities; other entities are not first-class | Add stable Employer, Location, Skill, Recruiter/Agency, Office, ATS, and relationship identities |
| Knowledge graph | Relationship concepts exist only implicitly in payloads and queries | Build an evidence-backed relationship layer over the existing relational store before considering a graph database |
| Quality confidence | Source and canonical confidence exist, but confidence is not consistently decomposed by assertion | Track source, parsing, normalization, canonicalization, freshness, eligibility, match, and recommendation confidence separately |
| Acquisition learning | Source-expansion ranking is deterministic but uses mostly configured estimates | Feed it zero-result demand, provider yield, unique contribution, corrections, closures, and user outcomes |
| Outcome learning | Decisions exist, but applications and outcomes do not yet improve source and matching quality | Add privacy-safe outcome events with explicit causal limits; never present correlation as hiring probability |
| Operations | Static tests are strong; live inventory, latency, age, and provider reliability baselines are missing | Establish trustworthy production metrics, alerts, recovery targets, and acceptance evidence |

## Phase 1 — Durable Trusted Inventory

### Objective

Make the current Coverage Engine operate continuously, safely, and measurably without a developer laptop.

### Architectural changes

- Persist collection jobs, provider runs, leases, attempts, backoff, cancellation, and failed items in the existing Supabase/PostgreSQL boundary.
- Persist the provider and employer-source registry, including compliance basis, cadence, owner, health, contribution, duplicate ratio, rejection ratio, and stale ratio.
- Add idempotency keys and concurrency leases per provider/employer source.
- Complete source-aware closure thresholds and lifecycle audit records.
- Publish internal inventory measurements from canonical active Opportunities only.
- Preserve current adapters and pipeline stages.

### Dependencies

- Staging migration approval and authenticated acceptance of the pending geographic/profile foundation.
- Approved scheduler mechanism within the existing deployment stack.
- No new paid infrastructure unless measured run volume exceeds the documented threshold.

### Measurable success criteria

- 100% of enabled sources run without a developer device.
- Every run has start, completion, duration, result counts, retry state, and last error.
- Replaying the same source snapshot creates zero duplicate canonical Opportunities.
- Canonical active inventory, average age, freshness distribution, failed runs, and provider contribution are measurable.
- Missing complete-snapshot records deactivate according to source policy.

### Risks

- Overlapping runs can duplicate work without leases.
- Incorrect snapshot semantics can close legitimate Opportunities.
- Deploying application code before its migration can interrupt collection.

### Recommended implementation order

1. Durable job/run schema and repository.
2. Idempotency and leases.
3. Scheduler entry point.
4. Provider registry persistence.
5. Closure audit and operational metrics.
6. Staging replay, failure, and recovery rehearsal.

## Phase 2 — Coverage and Canonical Quality

### Objective

Expand unique executive-relevant inventory while improving canonical truth faster than raw volume grows.

### Architectural changes

- Complete versioned field assertions: original value, normalized value, confidence, normalization version, and source evidence.
- Add deterministic merge evidence, preferred-source selection, ambiguous-cluster review, re-clustering, and reversible split history.
- Add employer discovery and source qualification around existing reusable ATS adapters.
- Implement the highest-ranked compliant source next, beginning with SmartRecruiters after terms revalidation.
- Connect zero-result demand, geographic gaps, industry gaps, and title gaps to the source-expansion ranking.
- Track publication-to-ingestion latency and unique canonical contribution per provider.

### Dependencies

- Phase 1 durable scheduling and trustworthy metrics.
- Source-by-source legal/access review.
- Founder approval only for contracts, paid access, material personal-data change, or unresolved compliance.

### Measurable success criteria

- Canonical duplicate-card rate below 1% in accepted regression and sampled live reviews.
- Every published Opportunity has provenance and a freshness state.
- At least 95% of active Opportunities have employer, title, source identity, and location evidence or an explicit unknown.
- Source prioritization uses observed demand and live unique contribution rather than configured estimates alone.
- Median publication-to-ingestion latency is measured and improves by source class.

### Risks

- Aggressive fuzzy matching can merge separate requisitions.
- Raw-record growth can conceal poor unique contribution.
- Provider interfaces or permitted uses can change.

### Recommended implementation order

1. Field-assertion evidence model.
2. Canonical merge/split audit workflow.
3. Live quality sampling.
4. Demand-signal ingestion.
5. SmartRecruiters employer-scoped adapter.
6. Repeat expansion only when unique useful inventory is demonstrated.

## Phase 3 — Opportunity Knowledge Graph Foundation

### Objective

Represent durable, evidence-backed entities and relationships without prematurely introducing a separate graph database.

### Architectural changes

- Introduce stable identities for Employer, Office, Location, Skill, Industry, ATS, Recruiter/Agency, Executive Profile, Application, and Outcome.
- Represent relationships as typed, temporal, provenance-bearing assertions.
- Required relationship metadata: subject, predicate, object, source, confidence, first observed, last verified, validity, and supersession.
- Resolve canonical Employer identity independently from an Opportunity payload.
- Allow Search, Atlas, and analytics to traverse the same relationship service.
- Keep confidential recruiter and executive data workspace-isolated and exclude it from public graph views.

### Dependencies

- Phase 2 canonical quality and field-level evidence.
- Privacy classification and retention rules for recruiter, application, and outcome relationships.
- Stable identifiers and migration compatibility.

### Measurable success criteria

- Every canonical Opportunity resolves to one canonical Employer candidate or an explicit unresolved state.
- Every displayed relationship is traceable to evidence and confidence.
- Search and Atlas retrieve identical underlying entity and relationship facts.
- No private workspace relationship is visible outside its authorized boundary.
- Relationship corrections preserve history rather than silently overwrite it.

### Risks

- Premature graph abstraction can add complexity without product value.
- Identity-resolution errors can contaminate many downstream recommendations.
- Recruiter and outcome relationships introduce heightened privacy obligations.

### Recommended implementation order

1. Entity identity contracts.
2. Employer and Location resolution.
3. Skill and Industry assertions.
4. Typed relationship store and query service.
5. ATS and Office relationships.
6. Recruiter/Application/Outcome relationships only after privacy approval.

## Phase 4 — Self-Improving Acquisition and Quality

### Objective

Use observed network performance and executive demand to improve what ORENDALIS acquires and verifies next.

### Architectural changes

- Feed zero-result searches, weak-match searches, saved searches, corrections, ignored recommendations, closures, and provider failures into an acquisition-demand model.
- Separate source yield into raw records, unique canonical contribution, executive relevance, freshness, reliability, and correction burden.
- Adapt refresh cadence within safe provider limits using observed change frequency and value.
- Detect deteriorating parsers, rising duplicate ratios, stale providers, and geographic or industry gaps.
- Produce recommended—not autonomous contractual—provider activation and retirement actions.

### Dependencies

- Phase 1 operational metrics.
- Phase 2 canonical-quality evidence.
- Phase 3 entity dimensions for geography, industry, employer, and role coverage.
- Sufficient aggregate demand volume and privacy-safe analytics.

### Measurable success criteria

- Every source-expansion recommendation contains observed demand, expected unique contribution, access confidence, effort, and duplicate risk.
- Zero-result rate, stale share, failed-run rate, and correction rate trend downward.
- Refresh resources concentrate on high-change, high-value sources without exceeding limits.
- Low-yield providers are identified by unique useful contribution, not raw volume.

### Risks

- Sparse early data can create unstable priorities.
- Engagement signals can encode popularity rather than executive value.
- Adaptive cadence can violate source limits if policy boundaries are not hard constraints.

### Recommended implementation order

1. Demand and correction events.
2. Coverage-gap aggregates.
3. Provider-yield model.
4. Parser and quality drift detection.
5. Bounded cadence recommendations.
6. Human-reviewed source expansion decisions.

## Phase 5 — Global Opportunity Intelligence Network

### Objective

Turn the trusted graph into explainable executive opportunity intelligence while keeping data confidence ahead of recommendation confidence.

### Architectural changes

- Decompose confidence into source, parsing, normalization, canonicalization, freshness, eligibility, match, and recommendation dimensions.
- Make low upstream confidence cap downstream Opportunity Confidence.
- Use graph relationships to explain employer patterns, geographic attainability, role adjacency, skill evidence, and related Opportunities.
- Incorporate privacy-safe application outcomes to evaluate—not guarantee—recommendation quality.
- Provide network-level coverage, reliability, latency, and trust reporting.
- Preserve one shared confidence contract for Search, Ranked Opportunities, Atlas, alerts, and matching.

### Dependencies

- Phases 1–4.
- Sufficient verified inventory and outcome volume.
- Explicit privacy and legal approval for cross-user aggregate learning.
- Bias, fairness, and calibration review before commercial claims.

### Measurable success criteria

- Every recommendation explains evidence, uncertainty, freshness, eligibility, and the next verification step.
- No high-confidence recommendation can originate from low-confidence or stale opportunity evidence.
- Recommendation calibration is measured against user corrections and outcomes without claiming hiring probability.
- Trusted canonical opportunity coverage, freshness, geographic coverage, executive-title coverage, provider reliability, and user trust improve over time.
- Executives see one canonical Opportunity even when many sources report it.

### Risks

- Outcome bias and small samples can create misleading learning.
- Network effects can amplify incorrect canonical identities.
- Commercial language can overstate probabilistic evidence.

### Recommended implementation order

1. Confidence decomposition and upstream caps.
2. Graph-backed explanations.
3. Calibration and correction reporting.
4. Privacy-approved outcome aggregates.
5. Network trust and coverage reporting.
6. External or commercial intelligence surfaces only after evidence supports them.

## Phase Gates

No phase advances because documentation is complete. Each phase advances only after its measurable criteria pass in staging, rollback is rehearsed, security and privacy controls pass, and the Founder gate is satisfied where payment, contracts, legal authority, material personal-data use, or irreversible production action is involved.

## Immediate Highest-Value Action

Complete Phase 1's durable job/run persistence and staging acceptance. Until collection runs continuously and trustworthy live inventory metrics exist, graph expansion and recommendation sophistication would outpace the data foundation required by this directive.
