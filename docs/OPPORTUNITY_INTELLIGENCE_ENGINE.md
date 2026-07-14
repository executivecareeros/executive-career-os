# Opportunity Intelligence Engine

> Purpose: Define how Orendalis recognizes, evaluates, prioritizes, and learns from executive opportunities without becoming a job board or opaque matching service.

- **Authority:** Product architecture under ODS 1.0
- **Status:** Foundational direction; no implementation commitment
- **Related records:** `EXECUTIVE_INTELLIGENCE_GRAPH.md`, `INTELLIGENCE_OBJECT_MODEL.md`, `ATLAS_REASONING_ARCHITECTURE.md`

## Principle

Executives should not have to continuously search for opportunities. Orendalis should understand the executive well enough—and observe the permitted environment responsibly enough—that relevant possibilities can find them.

“Find” does not mean contact, apply, or act without consent. It means recognize, explain, and place a credible possibility in front of the executive at the right time.

## Purpose

Opportunity Intelligence helps an executive answer:

- Is this a real opportunity or an unsupported claim?
- Why is it relevant now?
- How does it align with the Blueprint and career trajectory?
- What could be gained, lost, or learned?
- Which facts are missing?
- Which people or company signals matter?
- Should the executive apply, wait, monitor, negotiate, network first, or decline?

## Inputs

- normalized Opportunity object and permanent provenance;
- active Executive Blueprint revision;
- Career Ledger events and decision memory;
- Career Capital direction and objectives;
- Company Intelligence briefing;
- compensation evidence and stated thresholds;
- application, interview, recruiter, and relationship context;
- market and knowledge signals;
- executive principles, constraints, geography, travel, family, risk, and timing;
- verified outcomes from comparable prior decisions.

An absent input remains unknown. The engine does not create a convenient value.

## Outputs

- relevance and strategic-fit assessment;
- explicit gains, losses, conflicts, and trade-offs;
- evidence map and provenance summary;
- decision-critical unknowns and ranked questions;
- confidence with factor-level explanation;
- alternative actions and consequences;
- change signals since the previous assessment;
- recommendation and priority;
- immutable assessment snapshot for later replay.

## Evaluation Lenses

Opportunity Intelligence evaluates distinct lenses rather than collapsing everything into one score:

- strategic direction;
- leadership scope and decision authority;
- career-capital contribution;
- compensation and ownership potential;
- company quality and timing;
- role clarity, reporting line, and mandate;
- geography, travel, language, and family constraints;
- reputation and relationship implications;
- risk, reversibility, and opportunity cost;
- evidence completeness and source reliability.

A summary assessment may be useful, but executives must always be able to inspect the lenses beneath it.

## Opportunity Lifecycle

`Observed → Normalized → Qualified → Assessing → Monitoring | Acting → Decided → Outcome Observed → Archived`

Lifecycle changes preserve time, actor, evidence, and reason. “Rejected” does not mean irrelevant forever; a later company event, Blueprint revision, or relationship change may justify a new assessment without rewriting the original decision.

## Confidence

Confidence reflects provenance quality, role specificity, company verification, compensation completeness, recruiter and reporting-line clarity, evidence freshness, Blueprint completeness, corroboration, and unresolved conflicts.

The engine must distinguish:

- confidence that the opportunity exists;
- confidence that its stated terms are accurate;
- confidence in the executive-fit assessment;
- confidence in the recommended next action.

These values may differ materially.

## Learning

The engine learns from executive-confirmed outcomes:

- which opportunity characteristics produced value;
- which early concerns proved material;
- which unknowns should have been resolved sooner;
- which trade-offs the executive accepted in practice;
- which relationships changed access or understanding;
- how the opportunity affected Career Capital and Blueprint objectives.

Learning updates future evidence weights or questions only through governed, versioned rules or confirmed personal observations. It does not silently rewrite preferences.

## Interaction with Other Intelligence

- **Company Intelligence** establishes organizational context and event risk.
- **Decision Intelligence** compares actions and preserves the decision.
- **Career Intelligence** evaluates trajectory and opportunity cost.
- **Relationship Intelligence** identifies relevant human context without turning people into targets.
- **Atlas** assembles these views, challenges assumptions, and explains what could change the recommendation.

## Executive Experience

The executive should see a concise opportunity briefing:

1. why it surfaced;
2. what is known;
3. what Atlas believes and how strongly;
4. what conflicts with the Blueprint;
5. what must be learned next;
6. which action deserves consideration;
7. what changed since the last review.

No fabricated opportunities, false urgency, unexplained rankings, or automated applications are permitted by this architecture.

## Roadmap

- **Foundation:** canonical object, provenance, lenses, unknowns, and snapshots.
- **Context:** Company, compensation, relationship, and career-history connections.
- **Learning:** outcome comparison and executive-confirmed pattern recognition.
- **Discovery:** permissioned source-agnostic observation and proactive surfacing.
- **Coordination:** approved preparation and follow-up, always within explicit authority.
