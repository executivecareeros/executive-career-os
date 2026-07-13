# Production Acceptance

> Purpose: Define the evidence required before Orendalis may run the Executive Opportunity Decision workflow with invited design partners.

## Current Status

**Not accepted.** No Release 0.6 staging or production deployment was created or changed during this audit.

Local evidence now covers invitation enforcement, durable workflow repositories, deterministic persisted reasoning, atomic finalization, feedback isolation, and supervised lifecycle request intake. This evidence does not satisfy staging, restore, monitoring, legal, or founder-acceptance gates.

## Staging Gate

Staging must use a separate Supabase project and HTTPS deployment with fictional identities only. Acceptance requires clean migrations from an empty database, authentication and recovery, idempotent workspace provisioning, RLS and cross-workspace denial, import and review persistence, minimal Blueprint, opportunity creation, deterministic assessment, append-only snapshot, feedback, logout, refresh, responsive behavior, and recoverable failures.

Creating or connecting staging requires founder approval because it changes external infrastructure and may create cost or data-processing commitments.

## Production Database Matrix

- [ ] Empty-database migration succeeds.
- [ ] Required tables, functions, policies, triggers, indexes, and composite constraints exist.
- [ ] RLS is enabled on every exposed workspace table.
- [ ] Anonymous access is denied.
- [ ] Active same-workspace access succeeds.
- [ ] Cross-workspace access fails.
- [ ] Invited and inactive membership do not grant access.
- [ ] Compensation access requires its separate permission.
- [ ] Append-only update and delete fail.
- [ ] Workspace provisioning is idempotent.
- [ ] Session-backed repositories fail closed without a valid session.

Use two controlled fictional identities. Disable or delete them through the accepted procedure after evidence capture.

## Authentication Matrix

- [x] Invitation-only registration implemented and locally database-tested
- [ ] Email verification
- [ ] Login and Remember Me
- [ ] Secure HTTP-only session cookies
- [ ] Session refresh and remote revocation
- [ ] Protected-route denial
- [ ] Logout
- [ ] Forgot and reset password
- [ ] Expired and invalid recovery links
- [ ] Duplicate registration and rate-limit behavior
- [ ] Atlas Promise acceptance version

## Journey Matrix

- [x] Authoritative beta manual history persists without demo imports.
- [x] Minimum Blueprint revision persists and preserves prior revisions.
- [x] Opportunity facts and unverified claims remain distinguishable.
- [x] Missing compensation remains unknown and no conversion is applied.
- [x] Reasoning artifacts persist confirmed input references.
- [x] Next action is explicit and user-controlled.
- [x] Decision snapshot and Career Ledger event are atomic and immutable in local tests.
- [x] Feedback and lifecycle requests are Workspace-isolated in local tests.

## Acceptance Authority

Automated tests are necessary but insufficient. The founder must complete the full journey using a fictional profile, review all evidence, and record go/no-go. Real personal data requires additional lifecycle and legal approval.
