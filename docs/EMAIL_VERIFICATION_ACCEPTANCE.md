# Email Verification Acceptance

> Purpose: Record the verified, fail-closed email-confirmation journey for fictional private-beta accounts.

## Accepted Journey

| Step | Route or operation | Provider dependency | Token and expiry | Retry and failure behavior | Audit and principal risk |
|---|---|---|---|---|---|
| Invitation opened | `/register?invite=…&email=…` | None beyond Supabase data access | Hashed, email-bound invitation; founder-selected expiry | Invalid, expired, revoked, accepted, or mismatched invitations do not register | Invitation validation timestamp; token disclosure is the primary risk |
| Registration | `registerAction` → Supabase Auth signup | Supabase Auth | Password plus invitation cookie | Duplicate accounts and provider failures return a safe registration error | Supabase auth log; enumeration and credential handling |
| Verification requested | `/verify-email` | Supabase Auth mailer | Provider-generated single-use token; provider-configured expiry | Generic success copy; resend remains bound to the remembered invitation email | Provider mail log; resend abuse and enumeration |
| Verification callback | `/auth/confirm` | Supabase Auth verify endpoint | Token hash, type `email` | Missing, invalid, expired, or replayed tokens return a generic local error | Supabase auth log; open redirect and token leakage |
| Invitation accepted | `accept_beta_invitation` | PostgreSQL and verified Supabase user | Hashed invitation token | Revalidates pending state, expiry, authenticated email, and provider confirmation | `beta_invitation_audit_events` and `email_verification_audit_events` |
| Session created | callback session cookies | Supabase Auth | Short-lived access token and refresh token | Session is stored only after verification and strict invitation acceptance | HTTP-only cookie boundary; cross-host redirect consistency |
| Workspace provisioned | `/onboarding` → `provision_invited_beta_workspace` | PostgreSQL | Verified authenticated user | Requires confirmed provider user and accepted invitation; repeated calls are idempotent | Workspace and workflow records; partial provisioning |
| Workflow resumed | `/beta-workflow` | Session, membership, RLS | Validated session | Missing verification, session, or membership redirects to sign-in | Repository context and RLS; cross-Workspace access |

Only relative callback resume paths are accepted. The configured application origin creates invitation, verification, and callback URLs; caller-controlled origins are not trusted.

## Acceptance Evidence — 13 July 2026

A fictional invitation was created through Company Control. Supabase local mail capture received one message from `Admin <admin@email.com>` with subject `Confirm your Orendalis email` within seconds. Its single-use link verified the fictional account, returned to `/onboarding`, provisioned one Workspace, opened `/beta-workflow`, survived logout and login, and changed the invitation to Accepted.

Before verification, `/onboarding` and `/beta-workflow` redirected to sign-in. Callback replay and an invalid external redirect target returned the safe verification-error screen. An immediate resend displayed enumeration-safe success copy while the provider rate limit prevented a duplicate message. Deterministic tests cover unverified, mismatched, invalid, expired, revoked, replayed, idempotent provisioning, and audit cases.

This proves product correctness through Supabase's supported local mail-capture channel. It does not prove Internet delivery, production sender identity, Microsoft 365 delivery, DKIM, staging, or production behavior. **External email delivery is not yet accepted.**

Token-free desktop and 390-pixel mobile views were inspected during the browser session. No token-bearing email or callback view was retained in the repository.
