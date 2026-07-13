# Beta Data Boundaries

> Purpose: Define the minimum data Orendalis may process during private-beta preparation and the controls required before real executive information is accepted.

## Collection Principle

Collect only information required to evaluate one opportunity. Optional or sensitive information remains voluntary. Missing information remains unknown and may cause Atlas to return `Need More Information`.

## Minimum Data

- Account email and authentication metadata
- Preferred name and essential professional direction
- A small set of confirmed professional-history records
- Target role or objective
- Location and travel preferences
- Voluntary compensation minimum or target with explicit currency
- Company-stage preferences, required conditions, exclusions, priorities, and non-negotiables
- One opportunity's role, company, location, work model, source, and known facts
- User-confirmed next action and feedback

Do not request family circumstances, health, protected characteristics, government identifiers, bank details, or unnecessary documents.

## Lifecycle Gate

| Control | Current status | Real-data consequence |
|---|---|---|
| Access isolation | Locally tested through RLS | Requires staging and production acceptance |
| Correction | Review UI exists; durable correction path incomplete | Block persistent real-data import |
| Export | Architecture documentation only | Block real-data beta |
| Deletion | No accepted user workflow | Block real-data beta |
| Retention | Policy not founder/counsel approved | Block real-data beta |
| Audit | Database architecture exists; journey not wired | Block accepted production claim |
| Provenance | Import types support evidence; persistence incomplete | Block durable import |
| Consent withdrawal | Not implemented | Block real-data beta |
| Account closure | Not implemented | Block real-data beta |

Until every blocker is resolved, environments are limited to fictional or sanitized profiles.

## File Import

Accepted formats are deterministic plain text, CSV, and structured JSON within the documented size limit. PDF and DOCX parsing is unavailable. Source files must not be persisted by default. Only reviewed, confirmed structured facts may be appended to the user's workspace.

The current client-only import is not accepted for production because route changes lose state and confirmation does not persist.

## Assessment Boundary

Confidence reflects evidence completeness and consistency, not the probability of an offer, interview, or career success. Atlas may use confirmed facts, explicitly labelled claims, Blueprint preferences, and append-only history. It may not invent company, market, recruiter, compensation, or opportunity facts.

## Feedback Boundary

Feedback is workspace-private. The main record may contain route, workflow step, severity, description, expected behavior, follow-up consent, user reference, timestamp, and product version. Screenshots are optional and require separate secure storage, type/size validation, metadata stripping policy, and access controls before activation.

## Operational Access

Founder access to support, feedback, or user records must be separately authorized and audited. Company Control displays aggregates only. It must not expose message bodies or user-level personal data.

## Prohibited Handling

- Real personal data in fictional seeds or source control
- Secrets or session tokens in logs and screenshots
- Cross-workspace queries
- Silent history overwrite
- Currency aggregation without policy
- Automated applications or communication
- Training or third-party disclosure without explicit approved basis

## Current Decision

Real personal data collection is not authorized. Release 0.6 remains in fictional or sanitized-data preparation mode until lifecycle, legal, isolation, restore, monitoring, and founder-acceptance gates pass.
