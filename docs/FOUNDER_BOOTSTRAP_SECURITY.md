# Founder Bootstrap Security

> Purpose: Record the security invariants, failure behavior, and evidence required for the one-time founder initialization.

## Invariants

- `auth.uid()` and `auth.users.email` are authoritative; caller-supplied identity, email, Workspace, or role values are not accepted.
- `email_confirmed_at` must exist and the normalized email must exactly match the protected configuration.
- Executive identities, Workspaces, and memberships must be absent before the first write.
- The Atlas Promise must be explicitly accepted.
- The function has a fixed search path and is executable only by `authenticated`.
- Configuration and audit tables have RLS enabled and no browser-role table grants.
- Bootstrap and configuration audit history is append-only.

## Failure and replay

Precondition failures return stable status codes without writes. Unexpected SQL failures roll back the transaction. Duplicate execution by the founding user returns the original identity references without duplication. Concurrent calls are serialized and the singleton audit row is the permanent shutdown control.

The public invitation registration route remains invitation-only. `/founder-bootstrap` is a narrow staging initialization surface, not a general registration or recovery bypass.

## Verification

The deterministic database test covers missing configuration, anonymous denial, wrong and unverified email, existing state, explicit acceptance, forced transactional rollback, successful provisioning, replay, founder permissions, post-bootstrap invitation readiness, configuration locking, and audit immutability. Static validation also checks the advisory lock, fixed identity derivation, grants, RLS, and absence of browser service-role credentials.
