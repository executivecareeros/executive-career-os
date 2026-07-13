# Company Intelligence Domain

> Purpose: Define provider-independent contracts for company metrics, health, actions, risks, support, vendors, briefings, snapshots, permissions, and auditability.

## Architecture

The domain lives in `frontend/lib/company-intelligence/` and is divided into:

- `types.ts`: stable contracts and controlled vocabularies
- `registries.ts`: canonical metrics, sources, departments, and permissions
- `engine.ts`: deterministic status, freshness, health, ranking, deduplication, and access functions
- `data.ts`: factual baseline observations and explicitly unavailable observations
- `index.ts`: public domain boundary

UI components consume the domain through this public boundary. They do not read company Markdown directly or call providers.

## Core Contracts

The domain includes company metrics and definitions, observations, targets, thresholds, trends, sources, freshness, departments, health, alerts, founder actions and priorities, tasks, deadlines, risks, decisions, objectives, milestones, incidents, vendors, integrations, support cases, daily briefs, evidence, recommendations, company snapshots, scorecards, board snapshots, permissions, and audit records.

## Missing Data

`Unavailable` is a value kind, not a numeric value. An unavailable observation omits `value`; it never substitutes `0`. Its state is `Unknown` or `Not Connected`, and its note explains the missing authority or input.

This distinction is essential for revenue, cash, burn, runway, users, and incidents. Zero is a measured fact and may only be displayed when an authoritative source measured zero.

## Department Health

Department health is the most severe meaningful metric state currently present. When no operational metric exists:

- A disconnected department is `Not Connected`.
- A partially connected department with insufficient evidence is `Unknown`.
- `Not Applicable` observations do not worsen health.

The company-level aggregate remains `Unknown` until coverage and aggregation policy are approved.

## Auditability

Future meaningful actions must capture actor, action, timestamp, source, previous state, new state, reason, approval, correlation ID, and audit reference. The current sprint defines the contract and performs no writes.

## Append-Only Direction

Metric observations, company snapshots, decisions, and audit records should become append-only repository entities. Corrections should supersede an observation with provenance rather than mutate history.

## Privacy

Main-dashboard user data is aggregate only. Finance, identities, support messages, legal records, security incidents, compensation, and private customer information are sensitive areas with separate future permission boundaries.

## Extension Rules

New departments must reuse canonical metrics. New providers implement source adapters but may not introduce provider-specific types into the core domain. New health calculations require deterministic tests and documented threshold ownership.
