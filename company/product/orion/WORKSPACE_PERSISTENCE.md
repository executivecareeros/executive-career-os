# Atlas Workspace Persistence

Last updated: 2026-07-17 · Owner: Sol · Status: Migration ready; not applied

## Model

`atlas_decision_workspace_events` stores a complete workspace snapshot for each product mutation. Rows are append-only. The latest sequence reconstructs current state; earlier sequences preserve every historical state.

## Integrity

- Workspace membership is checked by RLS and again in the security-definer function.
- Opportunity identity and workspace ownership are re-read server-side.
- Advisory locking and expected sequence enforce optimistic concurrency.
- Workspace identity is immutable.
- Review, note, reassessment, decision, and timeline history cannot be removed or rewritten.
- Evidence, task, and question collections cannot be truncated; their state transitions remain recoverable in earlier immutable events and the timeline.
- Authenticated clients receive no update or delete permission.

## Recovery

Read the highest event sequence for the workspace and opportunity. No mutable projection is required. A failed append leaves the preceding state intact. The migration can be rolled back before use by dropping the new function and table; after live events exist, forward repair and export are required to preserve history.

## Deployment state

Migration `202607170012_atlas_decision_workspace_persistence.sql` has not been applied to staging or production in this mission.
