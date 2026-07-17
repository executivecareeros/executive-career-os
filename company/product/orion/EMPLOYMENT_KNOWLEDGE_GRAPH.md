# Employment Knowledge Graph

Last updated: 2026-07-17 · Owner: Sol · Version: `orion-knowledge-graph-v1`

## Purpose

The Employment Knowledge Graph is Orion's canonical intelligence layer. Connectors contribute observations; the graph preserves evidence, identity, relationships, conflicts, and history; Atlas consumes a bounded graph view rather than raw connector records.

## Invariants

1. Every entity and relationship cites immutable evidence.
2. A connector supplies observations, never truth ownership.
3. Unknown remains Unknown; absent facts do not create entities.
4. Conflicting assertions coexist with provenance.
5. Cross-source identity is never silently merged.
6. Atlas insights require existing graph evidence.
7. Graph projection is derived and non-mutating; existing connectors, persistence, scheduler, and operations remain unchanged.

## Foundation boundary

M5 models only Employer, Opportunity, Executive Role, Location, Compensation, Skill, Industry, Connector, Data Source, Evidence, Certification, Operational Observation, and Atlas Insight. It does not model people, inferred relationships, employer reputation, career outcomes, or private executive data without a separate justified evidence and governance contract.

## Flow

`Connector observation → immutable evidence → canonical entity/assertion → evidenced relationship → Atlas knowledge view`

The projection accepts normalized `DiscoveryResult` records and Operations snapshots. Replay is deterministic: identical observations retain one canonical entity and relationship while extending their evidence chain.

## Measures

- Knowledge Graph Coverage: mean of entity, relationship, evidence, and provenance coverage.
- Entity Coverage: required foundational kinds observed in a certified fixture.
- Relationship Coverage: required canonical relationship kinds observed.
- Evidence Coverage: entities with at least one evidence reference.
- Provenance Coverage: evidence with connector, source, and observation time.
- Conflict Resolution Coverage: assertions either unconflicted or retaining evidence for every conflicting value.
- Atlas Knowledge Readiness: weakest of entity, relationship, evidence, and provenance coverage.

Fixture certification is 100% for every coverage measure. Live coverage remains Unknown until durable staging evidence is projected; fixture completeness is not a live-production claim.

## Evolution rule

Add an entity or relationship only when it has a durable intelligence purpose, a stable identity rule, an evidence contract, a conflict policy, and a measured consumer. Schema expansion without all five is prohibited.
