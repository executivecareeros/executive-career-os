# Security and Privacy Boundaries
> **Purpose:** Record Release 0.1 trust boundaries and requirements that must precede production data handling.

The database foundation now defines workspace RLS, restricted compensation access, and append-only triggers. These controls are not production-verified until migrations and adversarial policy tests run against a real Supabase PostgreSQL instance with authentication.
## Current Boundary
Release 0.1 is a local demonstration with fictional records. It has no authentication, authorization, database, provider credentials, uploads, live integrations, or multi-tenant storage. It must not be treated as production-safe for personal information.
## Sensitive Data
Future compensation, family and lifestyle constraints, career history, recruiter interactions, interviews, offers, work authorization, salary expectations, documents, transcripts, voice recordings, and agent actions require explicit classification and least-privilege access. Blueprint personal constraints should be treated as highly sensitive.
## Production Requirements
- Strong authentication and session management.
- Tenant-scoped authorization and multi-tenant isolation.
- Encryption in transit and at rest, including backups.
- Append-oriented audit logs for reads, writes, exports, agent actions, and privileged access.
- User-controlled export, correction, deletion, retention, and consent workflows.
- Sensitive-field access policies and redaction.
- Transcript and voice-recording opt-in, review, retention, and deletion controls.
- Provider credential isolation, rotation, revocation, and secret management.
- Document malware controls and restricted processing boundaries.
- Regional privacy, work-authorization, and compensation-data review.
## Agent Boundary
Agent actions require scoped authority, preview/confirmation for material external actions, traceable evidence, idempotency, and revocation. Future model providers must receive the minimum necessary fields and must not become the system of record.
## Release Finding
No credential-shaped application secrets or real personal records were identified in the audited source. Dependency lockfile references to package names containing “token” are not credentials.
