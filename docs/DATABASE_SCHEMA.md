# Database Schema
> **Purpose:** Describe the normalized PostgreSQL persistence model and its intentional boundaries.
## Identity and Isolation
Executive identities connect future `auth.users` IDs to product identities. Workspaces own business records. Active memberships and explicit permissions drive access. Display names are never foreign keys.
## Domains
The schema covers identities, workspaces, memberships, invitations, permissions, Blueprint and revisions, preferences, constraints and evidence, opportunities and provenance, companies, applications and activities/documents, Career Ledger, compensation, Atlas snapshots, Knowledge observations/signals, Discovery runs, document versions, settings, and entitlement usage.
## Common Columns
Workspace-owned records carry UUID ID, stable domain ID, workspace ID, creator, timestamps, version, and archive timestamp. Append-only records additionally carry sequence, occurrence/recording times, correlation, and optional causation.
## Searchable Fields
Core opportunity, company, application, compensation, Blueprint revision, and provenance fields are relational columns. JSONB stores variable or versioned domain payloads, not workspace ownership or principal searchable relationships.
## Constraints
Foreign keys protect core relationships; membership and domain IDs are workspace-unique; sequences and revisions are positive; currencies use three uppercase letters; compensation cannot be negative; ranges and application dates have safe ordering checks. Rules with uncertain semantics remain in deterministic domain validation.
> Import schema adds normalized sessions, experiences, achievements, education, certifications, board roles, decisions, conflicts, records, and audit events. See [IMPORT_DATA_MODEL.md](./IMPORT_DATA_MODEL.md).
