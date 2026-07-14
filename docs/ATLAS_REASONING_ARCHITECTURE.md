# Atlas Reasoning Architecture

> Purpose: Define how Atlas turns the Executive Intelligence Graph into explainable executive judgment support while preserving evidence, uncertainty, memory, and human authority.

- **Authority:** Product architecture under ODS 1.0
- **Status:** Long-term reasoning direction; no implementation or provider commitment
- **Related records:** `ATLAS_REASONING_ENGINE.md`, `ATLAS_DECISION_ENGINE.md`, `EXECUTIVE_INTELLIGENCE_GRAPH.md`

## Role of Atlas

Atlas is the reasoning and interaction layer over Orendalis intelligence. It does not own the underlying truth, silently create memory, or make the executive’s decision. It assembles the relevant context, tests it, identifies what is missing, compares alternatives, and explains a view.

## Reasoning Context

Every reasoning task receives a bounded context:

- executive and Workspace scope;
- active Blueprint revision;
- decision question and allowed purpose;
- relevant graph substructure;
- Career Ledger and memory references;
- evidence, conflicts, assumptions, and unknowns;
- applicable rules and confidence model versions;
- time boundary and sensitivity policy.

Context assembly is explicit. More data is not automatically better; irrelevant or unauthorized context should be excluded.

## Reasoning Stages

1. **Frame:** state the executive question, decision owner, horizon, and alternatives.
2. **Collect:** retrieve the minimum relevant intelligence objects and revisions.
3. **Validate:** check provenance, authorization, freshness, and structural completeness.
4. **Normalize:** align comparable facts while preserving originals and currencies or units.
5. **Relate:** identify supported cross-domain relationships.
6. **Evaluate:** apply transparent domain lenses and deterministic rules.
7. **Challenge:** detect conflicts, weak assumptions, missing evidence, and narrative bias.
8. **Compare:** show gains, losses, risks, opportunity cost, and reversibility for alternatives.
9. **Recommend:** propose a priority and next action at the supported confidence level.
10. **Explain:** answer why, why not, what changed, what is missing, and what would change the view.
11. **Snapshot:** preserve the exact inputs, rules, recommendation, and executive decision separately.
12. **Review outcome:** later compare expected and observed outcomes without rewriting history.

## Five Intelligence Perspectives

Atlas reasons through coordinated perspectives:

- **Opportunity:** relevance, mandate, timing, terms, and next action.
- **Company:** organizational context, leadership, strategy, events, and risk.
- **Decision:** alternatives, trade-offs, confidence, and executive choice.
- **Career:** trajectory, principles, constraints, opportunity cost, and Career Capital.
- **Relationship:** relevant people, commitments, introductions, and trust boundaries.

No perspective can silently override another. A high-opportunity fit may still conflict with a career principle; a strong relationship may improve access without proving company quality.

## Confidence Architecture

Atlas exposes three layers:

1. **Evidence confidence:** how reliable and current are the underlying claims?
2. **Interpretation confidence:** how strongly do the supported relationships justify the assessment?
3. **Action confidence:** how appropriate is the proposed next step given risks, unknowns, and reversibility?

Confidence changes are themselves explained. Atlas should state which missing answer would create the largest improvement.

## Learning Architecture

Atlas learning has four governed paths:

- **Correction:** the executive corrects a fact or relationship.
- **Confirmation:** the executive validates an interpretation or preference.
- **Outcome:** a later event tests an earlier expectation.
- **Reflection:** the executive records a lesson or changes the Blueprint.

Each path creates a new attributable record. No future AI provider may train on, generalize, or retain executive data outside approved boundaries merely because Atlas used it.

## Interaction Pattern

Atlas should behave like an evidence-led Executive Chief of Staff:

- begin with the decision, not a generic conversation;
- summarize only what matters;
- ask the question with the highest decision value;
- challenge unsupported certainty respectfully;
- distinguish fact, interpretation, assumption, and unknown;
- show alternatives before urging action;
- preserve the executive’s final authority;
- remember only through inspectable, governed records.

## Model and Provider Boundary

Future language or reasoning providers may help interpret, summarize, question, or draft from an approved context bundle. They may not:

- determine authorization or Workspace scope;
- invent evidence or relationships;
- alter the Blueprint, Ledger, or memory silently;
- calculate hidden confidence;
- resolve conflicts without disclosure;
- make irreversible decisions;
- become the permanent system of record.

Provider output is proposed interpretation until validated by product rules or the executive.

## Failure Behavior

When evidence is inadequate, Atlas should narrow the claim, lower confidence, ask a better question, recommend a reversible next step, or decline to recommend. It must never fill a missing fact with plausible prose.

## Long-Term Evolution

- structured cross-domain briefings;
- decision-scoped graph retrieval;
- longitudinal outcome and pattern review;
- proactive, permissioned intelligence signals;
- scenario comparison and executive simulation;
- bounded coordination after explicit approval.

Progress is measured by decision quality, trust, and executive agency—not message volume or automated activity.
