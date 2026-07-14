# Executive Intelligence Graph

> Purpose: Define the long-term, evidence-led intelligence architecture that allows Atlas to reason across an executive career without losing provenance, history, uncertainty, or executive control.

- **Authority:** Product architecture under ODS 1.0
- **Status:** Foundational direction; no implementation commitment
- **Scope:** Opportunity, Company, Decision, Career, and Relationship Intelligence
- **Review trigger:** Material change to Atlas, the Executive Blueprint, Career Ledger, evidence policy, or product category

## Product Intent

The Executive Intelligence Graph is the durable context layer for Atlas. It connects what the executive wants, what has happened, what is changing, who matters, which choices exist, and why a recommendation was made.

It is not a social graph, search index, knowledge dump, or opaque prediction engine. It is a time-aware graph of attributable intelligence objects and typed relationships. Every material conclusion remains traceable to evidence and a point in time.

## Intelligence Domains

| Domain | Governing question | Primary inputs | Primary outputs |
| --- | --- | --- | --- |
| Opportunity Intelligence | Which possibilities deserve attention, and why now? | Opportunity evidence, Blueprint, company context, compensation, provenance, market signals | Fit assessment, gaps, priority, confidence, next questions |
| Company Intelligence | What would joining or engaging with this organization mean for the executive? | Company evidence, leadership, ownership, strategy, culture indicators, events, opportunity relationships | Executive briefing, strategic context, risks, unknowns, watch signals |
| Decision Intelligence | What choice best serves the executive’s stated objectives and constraints? | Alternatives, evidence, trade-offs, principles, memory, prior outcomes | Recommendation, alternatives, rationale, confidence, decision snapshot |
| Career Intelligence | How is the executive’s career evolving over time? | Blueprint revisions, Career Ledger, Career Capital, compensation, decisions, outcomes | Trajectory, patterns, tensions, goals, momentum, reflection questions |
| Relationship Intelligence | Which professional relationships materially affect the decision or career? | Executive-confirmed people, roles, interactions, introductions, evidence, consent | Relationship context, relevance, follow-up need, trust boundary, unknowns |

## Graph Structure

### Nodes

The graph contains versioned intelligence objects, including:

- Executive Identity and Executive Blueprint revisions;
- Career Ledger events and professional experiences;
- Opportunities and their provenance;
- Companies, business units, and leadership roles;
- Decisions, alternatives, reasoning snapshots, and outcomes;
- People and executive-confirmed relationships;
- applications, interviews, compensation records, tasks, notes, and documents;
- market observations, knowledge signals, evidence, and unknowns;
- Career Capital dimensions, objectives, principles, constraints, and risks.

### Edges

Relationships are typed statements, not inferred facts. Examples include:

- `OPPORTUNITY_AT_COMPANY`;
- `ALIGNS_WITH_BLUEPRINT_OBJECTIVE`;
- `CONFLICTS_WITH_EXECUTIVE_PRINCIPLE`;
- `SUPPORTED_BY_EVIDENCE`;
- `INTRODUCED_BY_PERSON`;
- `REPORTS_TO_ROLE`;
- `DECISION_CONSIDERED_ALTERNATIVE`;
- `DECISION_PRODUCED_OUTCOME`;
- `LEDGER_EVENT_CHANGED_CAREER_CAPITAL`;
- `SIGNAL_AFFECTS_COMPANY`;
- `RELATIONSHIP_RELEVANT_TO_OPPORTUNITY`.

Every edge carries provenance, observation time, effective time where different, confidence, verification state, sensitivity, and lifecycle status. Contradictory edges may coexist when evidence conflicts; Atlas must surface the conflict rather than silently choose one.

## Intelligence Flow

1. **Observe:** receive an executive-confirmed fact or attributable observation.
2. **Normalize:** map it to a canonical intelligence object without erasing the original.
3. **Relate:** create only supported typed relationships.
4. **Evaluate:** apply deterministic relevance, freshness, completeness, and conflict rules.
5. **Reason:** assemble a decision-specific subgraph for Atlas.
6. **Explain:** show evidence, unknowns, trade-offs, assumptions, and alternatives.
7. **Decide:** preserve the executive’s decision and the context available at that moment.
8. **Learn:** compare later outcomes with the preserved snapshot; never rewrite the original decision.

## Confidence Model

Confidence belongs to each claim, relationship, and conclusion—not to the graph as a whole. It is derived from visible factors:

- source authority and provenance;
- executive confirmation;
- corroboration and independence of evidence;
- freshness and effective date;
- completeness of decision-critical fields;
- directness of the relationship;
- unresolved conflicts;
- assumptions and missing information;
- prior reliability of the evidence class.

Atlas expresses confidence as `Very Low`, `Low`, `Moderate`, `High`, or `Very High`, with factor-level explanations. Confidence never substitutes for evidence and never converts an estimate into a fact.

## Learning Model

Learning is a governed evidence loop, not silent model training.

- Outcomes are compared with earlier expectations and decision snapshots.
- The executive confirms whether an interpretation or lesson is valid.
- Valid lessons become new, attributable observations or Blueprint revisions.
- Repeated patterns may become signals only when their evidence threshold is met.
- Incorrect observations are superseded with history preserved.
- Personal career evidence is never generalized into market truth without a separate lawful and ethical basis.

## Interaction Model

Atlas queries a purpose-limited subgraph for the decision at hand. It should answer:

- What matters now?
- What changed?
- Why does it matter to this executive?
- What supports or contradicts the view?
- What is unknown?
- Which relationship or event is relevant?
- What would change the recommendation?
- What should the executive decide or investigate next?

The executive can inspect, correct, dismiss, or restrict the context Atlas uses.

## Trust Boundaries

- The Career Ledger remains the historical record; the graph references it rather than rewriting it.
- The Blueprint remains the executive’s declared strategic context; inference cannot silently alter it.
- Relationship Intelligence is private, purpose-limited, and consent-aware.
- Provider data, future models, and generated language cannot bypass normalization, evidence, or confidence rules.
- A graph traversal is not permission to disclose information across workspaces or audiences.
- The executive makes the final decision.

## Long-Term Roadmap

### Foundation

Canonical intelligence objects, provenance, versioning, confidence, temporal history, and explainable decision subgraphs.

### Connected Intelligence

Cross-domain briefings linking opportunities, companies, decisions, career trajectory, compensation, and confirmed relationships.

### Longitudinal Learning

Outcome comparison, decision replay, executive-confirmed lessons, pattern detection, and Career Capital development.

### Proactive Intelligence

Permissioned signals that bring material opportunities, changes, questions, and relationship moments to the executive without requiring manual search.

### Bounded Coordination

Atlas prepares and coordinates approved actions with explicit authority, auditability, reversibility, and human confirmation. Autonomy is earned only after evidence of trust and control.

## Architectural Decision

Orendalis will treat the Executive Intelligence Graph as a provider-independent product architecture, not a commitment to a graph database or a specific AI technique. The no-action alternative—keeping intelligence in disconnected modules—would preserve simplicity but prevent durable cross-domain reasoning. The chosen direction creates coherence while retaining domain ownership, evidence boundaries, and reversibility.
