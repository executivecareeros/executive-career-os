# Continuous Engineering Intelligence

Status: Authoritative architecture · Version: `orion-intelligence-v1` · Owner: Sol / Engineering Intelligence · Last validated: 2026-07-17

## Purpose

Continuous Engineering Intelligence converts versioned Engineering Operations Platform snapshots into evidence-based understanding. It detects change, identifies patterns, exposes unknowns, and recommends investigations. It does not collect duplicate telemetry, change connector behavior, or execute operational actions.

The authoritative implementation is `frontend/lib/discovery/engineering-intelligence.ts`.

## Reusable modules

1. Trend detection.
2. Anomaly detection.
3. Health drift.
4. Freshness drift.
5. Replay drift.
6. Failure-pattern recognition.
7. Recovery-pattern recognition.
8. Operational confidence.
9. Evidence completeness.
10. Unknown-state detection.
11. Engineering recommendation generation.

Every module consumes `ConnectorOperationsSnapshot`. No provider payload, credential, executive record, or additional telemetry path is introduced.

## Deterministic analysis

- Trends require at least three ordered measurements and report change, percentage change, directional consistency, and confidence.
- Anomalies require at least five measurements and compare the current value with the historical median and median absolute deviation.
- Health drift compares evidence-derived connector states.
- Freshness drift uses the manifest cadence ratio from the operations platform.
- Replay drift requires measured replay delta and unexpected-closure evidence.
- Failure patterns compare exact classified failure counts; recovery requires an observed recovery event.
- Evidence completeness checks 14 required operational fields.
- Unknown evidence remains explicitly Unknown and can itself generate an evidence-collection recommendation.

## Insight contract

Every recommendation contains observed evidence, supporting measurements, confidence, alternative explanations, recommended investigation, expected operational impact, and `Advisory only` authority. Recommendations never claim causation beyond measured evidence.

## Economics

- Engineering Insight Coverage: 11 of 11 required modules, 100% in the deterministic contract suite.
- Reusable Intelligence Modules: 11.
- Complete-fixture Evidence Completeness: 100%.
- Unknown Reduction: 100% in the controlled unknown-to-complete fixture; live reduction is not yet measured.
- Recommendation Precision: 100% against the bounded deterministic signature fixture; live precision is Unknown.
- Automated actions: 0.
- Future operational automation potential: investigation preparation and alert prioritization after live precision is measured; remediation remains outside M4 authority.

Existing M3A economics remain unchanged: ERI 100%, FSI 100%, 6 connector hooks, 11 certification concerns, 13 shared operations capabilities, and zero provider-specific operations implementations.

## Rollback

The intelligence layer is a pure projection. It can be removed without changing connectors, manifests, operations history, scheduling, persistence, canonical opportunities, or Atlas product behavior.
