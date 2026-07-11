# Import Data Model
> Purpose: Summarize durable import records and provenance.

Normalized tables cover sessions, experiences, achievements, education, certifications, board/advisory roles, review records, decisions, conflicts, and append-only audit events. Each row is Workspace-scoped and linked to the import session and Executive Identity. Searchable facts are relational; variable evidence and safe parser metadata use JSONB. RLS requires active membership and composite foreign keys prevent cross-Workspace relationships.
