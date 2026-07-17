# Atlas Product Integration

Last updated: 2026-07-17 · Owner: Sol · Status: Implemented and locally validated

## Purpose

Atlas 2.1 connects the existing Opportunity Review and Executive Decision Workspace to the authenticated canonical-opportunity detail page. It introduces no new reasoning model: the product adapter translates the existing deterministic opportunity intelligence into the existing Orion Decision Assessment, Atlas Opportunity Review, and Atlas Decision Workspace contracts.

## Product boundary

The surface shows recommendation or Recommendation Withheld, confidence, supporting evidence, Unknowns, conflicts, investigation tasks, notes, questions, stage progression, reassessment, recorded decisions, and the immutable timeline. Atlas suggests and explains; only the executive reviews evidence, accepts tasks, completes questions, advances stages, requests reassessment, and records decisions.

## Reuse

- `ExecutiveOpportunityIntelligence` remains the live product input.
- `DecisionAssessment` remains the explainability and eligibility contract.
- `AtlasOpportunityReview` remains the review contract.
- `AtlasDecisionWorkspace` remains the workflow contract.
- `atlas_decision_workspace_events` is the append-only persistence boundary, not a second reasoning or workspace model.

## Current limitation

The migration is committed but not applied or deployed by this mission. Live persistence and authenticated browser acceptance therefore remain unverified.
