# Atlas Decision Model

Last updated: 2026-07-17 · Version: `orion-decision-intelligence-v1`

Atlas receives the M5 bounded knowledge view, never raw connector records. Its decision output is structured as summary, evidence, confidence, Unknowns, alternative interpretations, reasons for, reasons against, and next actions.

Atlas has two permitted outcomes:

- `Review evidence` when every decision gate passes.
- `Do not recommend` when any required entity, relationship, context, evidence, or measurable-confidence condition fails.

“Review evidence” is decision support, not an instruction to pursue or reject an opportunity. Atlas may compare explicit evidence and surface conflicts. It may not estimate missing compensation, infer career progression from title alone, generalize an unrepresentative market sample, assume work eligibility, or claim personal fit without confirmed executive evidence.

Every supplied decision signal must cite an existing graph evidence ID. Unsupported signals are rejected before an assessment is created.
