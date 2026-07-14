# Intelligence Object Model

> Purpose: Define the shared product language through which Atlas and the intelligence domains exchange evidence without direct coupling or loss of history.

- **Authority:** Product architecture under ODS 1.0
- **Status:** Conceptual object model; not a database or API specification
- **Boundary:** Provider-independent, temporal, evidence-led, and workspace-scoped

## Common Intelligence Object

Every intelligence object has a stable identity and versioned state. Conceptually it contains:

| Field group | Meaning |
| --- | --- |
| Identity | Stable object identity, object type, workspace ownership |
| Version | Revision, lifecycle status, supersession relationship |
| Time | Observed, effective, created, updated, and expired times where relevant |
| Provenance | Source class, original reference, normalization version, import or observation event |
| Evidence | Supporting and contradicting evidence references |
| Confidence | Level, factors, gaps, conflicts, and last evaluation time |
| Sensitivity | Classification, permitted purpose, audience, and consent boundary |
| Relationships | Typed, directional links with their own provenance and confidence |
| Audit | Actor, reason, decision, and correlation reference |

Objects never inherit truth merely because they are connected. Each claim and relationship retains its own evidence.

## Opportunity Object

The Opportunity object is the canonical representation of a possible executive career move or mandate, independent of where it was observed.

### Identity and Provenance

- stable Opportunity identity;
- original source, connector or manual origin;
- original identifier and URL where appropriate;
- discovery or entry time;
- normalization version and import run;
- source reliability, confidence, and retained evidence.

### Executive Context

- opportunity type: employed role, board role, advisory mandate, operating partnership, succession path, acquisition-related leadership, or other reviewed category;
- title, mandate, leadership level, function, and scope;
- company, business unit, ownership, and geography;
- reporting line, team, decision authority, board exposure, and travel;
- compensation, equity, benefits, currency, and evidence state;
- recruiter, sponsor, introducer, and relevant relationships;
- application or conversation stage;
- known facts, claims, assumptions, unknowns, and constraints.

### Intelligence State

- strategic-fit lenses;
- conflicts and trade-offs;
- company and market signals;
- Career Capital implications;
- current priority and recommended next action;
- assessment confidence;
- decision and outcome references;
- lifecycle history.

An Opportunity is not a job posting. It may exist before a formal role is published and may remain valuable as a relationship, market signal, or future mandate after a decision not to proceed.

## Company Intelligence Object

Represents an organization as decision context, not merely a company profile. It includes identity, ownership, structure, strategy, leadership, operating model, relevant events, evidence, confidence, opportunity links, relationship links, and historical assessments.

Company claims are time-bound. A prior strategy, leader, risk, or financial condition remains historical evidence rather than being overwritten by the latest observation.

## Decision Intelligence Object

Represents the decision as it was made:

- decision question and decision owner;
- alternatives considered;
- evidence and unknowns available at the time;
- Blueprint and memory revisions used;
- gains, losses, risks, conflicts, and assumptions;
- recommendation and executive decision;
- confidence and ruleset versions;
- expected outcomes, revisit trigger, and later observed outcomes.

The recommendation and the executive’s decision are separate fields. Atlas serves; the executive decides.

## Career Intelligence Object

Represents a time-bound view of career direction:

- active Blueprint revision;
- trajectory, objectives, constraints, and principles;
- professional history and Career Ledger references;
- Career Capital observations;
- compensation and role progression;
- recurring patterns and confirmed lessons;
- momentum, tensions, risks, and open questions.

It does not reduce a career to a single score.

## Relationship Intelligence Object

Represents professional context about a person and the executive-confirmed relationship:

- person identity with data-minimization controls;
- professional role and organization at a point in time;
- relationship type, direction, relevance, and executive-confirmed context;
- interactions, introductions, commitments, and follow-ups;
- linked companies, opportunities, decisions, and Ledger events;
- evidence, consent, confidence, sensitivity, and retention boundary.

It must not infer intimacy, trust, influence, or intent from weak activity signals. It is not a contact-harvesting or surveillance object.

## Evidence Object

Evidence preserves source, observation, excerpt or structured fact where lawful, related claim, support or contradiction, reliability, freshness, confirmation, and retention boundary. Evidence can be superseded, disputed, expired, or dismissed without deletion of the historical record.

## Signal and Question Objects

A Signal identifies a material change supported by evidence. A Question identifies missing information that could change confidence or action. Both are first-class objects so Atlas can distinguish what happened from what still needs to be learned.

## Interaction Contract

Intelligence domains exchange object references, typed relationships, snapshots, and events. They do not reach into one another’s provider records. Atlas receives a decision-scoped context bundle with the exact revisions used.

## Lifecycle Rules

- append material observations;
- supersede rather than silently mutate history;
- separate raw evidence from normalized interpretation;
- preserve conflicting evidence;
- expire time-sensitive claims;
- require explicit authority for sensitive relationship context;
- retain the decision-time snapshot even when later facts change.

## Future Extension

New intelligence types must reuse the common identity, provenance, confidence, temporal, sensitivity, and audit concepts. A new provider, model, storage engine, or interface may not redefine the core product language.
