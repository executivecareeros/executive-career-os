# Executive Experience Contract

Last updated: 2026-07-17 · Owner: Sol / Executive Experience · Version: `orion-executive-experience-v1`

## Purpose

The Executive Experience Contract governs the meaning of every Atlas interaction. It is independent of layout and channel so web, mobile, APIs, reports, and future interfaces communicate the same evidence, uncertainty, and decision context.

## Canonical objects

The contract defines Recommendation, Explanation, Evidence Summary, Confidence Statement, Unknown Statement, Conflict Statement, Alternative Interpretation, Suggested Next Action, Investigation Request, and Decision Summary.

Each object has a purpose, required and optional semantic fields, evidence requirements, explicit Unknown behavior, and a rendering-independent contract. Objects contain no layout, color, component, or device instructions.

## Invariants

1. Facts and interpretations remain separate.
2. Recommendations require evidence, measured confidence, and a justified next action.
3. A recommendation is withheld when any required decision gate fails.
4. Unknowns, conflicts, alternatives, and confidence remain visible where journey rules require them.
5. Missing evidence creates an investigation request, not invented certainty.
6. Decision summaries preserve the evidence and uncertainty visible at decision time.
7. Atlas supports executive judgment and never takes final decision authority.

The deterministic fixture validates the full object and journey contracts. Live communication quality remains Unknown until evaluated through the M7 validation platform.
