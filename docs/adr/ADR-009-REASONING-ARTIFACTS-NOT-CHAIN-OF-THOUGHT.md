# ADR-009: Reasoning Artifacts, Not Chain-of-Thought
> Purpose: Establish the explainability boundary for Atlas reasoning.

Atlas persists reproducible inputs, rules, evidence, conflicts, trade-offs, gaps, alternatives, recommendations, and versioned snapshots. It does not expose or depend on hidden chain-of-thought. This makes explanations auditable without presenting private internal reasoning as a product feature.
