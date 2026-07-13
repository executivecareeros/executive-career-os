# Private Beta Architecture

> Purpose: Define the narrow environment, data, security, and release architecture for the Executive Opportunity Decision private beta.

## Environment Separation

| Control | Local Development | Staging | Production Private Beta |
|---|---|---|---|
| URL | `http://localhost:3000` | Founder approval required; not deployed | Founder approval required; not deployed |
| Supabase | Existing local container | Separate project required | Separate project required |
| Authentication | Local or disabled demonstration mode | Controlled fictional identities | Invitation-only verified identities |
| Redirect URLs | Localhost only | Exact staging HTTPS origin | Exact production HTTPS origin |
| Cookies | Development behavior | Secure, HTTP-only, SameSite and expiry acceptance | Same plus revocation and recovery acceptance |
| Repository mode | Memory demo or local Supabase | Supabase only | Supabase only |
| Secrets | Local ignored environment | Provider secret store | Provider secret store, separately scoped |
| Migrations | Local deterministic validation | Apply from empty database | Apply from empty acceptance baseline before use |
| Seeds | Fictional demo permitted | Controlled fictional acceptance data only | No fictional seed in authenticated workspaces |
| Monitoring | Local logs | Required before acceptance | Required before invitations |
| Permitted data | Fictional or sanitized | Fictional only until lifecycle acceptance | Real data only after all critical gates |
| Access | Developer | Founder and controlled testers | Founder-invited design partners only |

Production credentials must never enter local development, browser bundles, logs, screenshots, Git history, or reports.

## Narrow Runtime Flow

```text
Invitation → Supabase Auth → Workspace provisioning
    → reviewed history import → append-only Career Ledger
    → minimal Blueprint revision
    → one opportunity context
    → deterministic reasoning pipeline
    → explainable assessment + alternatives
    → selected next action
    → append-only decision snapshot and ledger event
    → isolated feedback
```

Every operation is workspace-scoped. Compensation remains separately permissioned. The UI never treats a missing record as zero or confirmation.

## Repository Boundary

Pages and components consume domain repositories. They do not import demonstration datasets in authenticated Supabase mode. Memory repositories remain a clearly labelled development capability only. Production must fail closed if Supabase configuration or session context is absent.

## Invitation Boundary

Public registration is disabled. Founder-created invitations are Workspace-scoped, single-use, time-limited, normalized to the invited email, stored as digests, and accepted only by the matching authenticated identity. No invitation was created or sent during implementation.

## Staging Setup — Prepared, Not Executed

1. Obtain founder approval identifying the selected Vercel and Supabase plans and exact cost.
2. Create projects named as staging resources; never reuse production projects.
3. Configure `NEXT_PUBLIC_DATA_ACCESS_MODE=supabase`, staging Supabase URL and anonymous key, `COMPANY_CONTROL_FOUNDER_EMAIL`, and a stable staging Server Action encryption key in the hosting secret store.
4. Allow only the exact staging HTTPS authentication callback, recovery, and application origins.
5. Disable public sign-up at the provider layer where supported; retain application invitation enforcement.
6. Replay every migration from an empty database and load only documented fictional acceptance identities.
7. Configure non-production email behavior so messages reach only founder-controlled test inboxes.
8. Run RLS, invitation, persistence, decision, feedback, lifecycle, and browser acceptance.
9. Test a database backup and restore into a separately isolated restore target.
10. Enable approved error, uptime, authentication-abuse, and database alerts without payload or personal-data capture.
11. Reset staging by deleting fictional Workspaces through the approved reset procedure; never copy production data into staging.

Stop before steps 1–2 until founder approval is recorded.

## Acceptance Sequence

1. Local deterministic validation
2. Founder approval to create or connect staging
3. Empty-database migration and RLS acceptance
4. Fictional end-to-end browser journey
5. Backup and isolated restore exercise
6. Monitoring and alert acceptance
7. Legal and lifecycle approval
8. Founder acceptance
9. Explicit go/no-go decision
10. Controlled invitation of one design partner, then gradual expansion to 3–5

Production deployment cannot precede staging acceptance.

## External Approval Gates

Founder approval is required before creating Supabase or hosting projects, connecting domains, configuring monitoring, granting OAuth permissions, changing DNS or Microsoft 365, inviting users, or collecting personal data. Each approval must identify purpose, cost, risk, rollback, and founder action.

## Current State

Local build, migration replay, PostgreSQL runtime constraints, append-only enforcement, invitation replay protection, atomic finalization, and feedback/lifecycle RLS tests pass. The founder acceptance script has not been performed. No staging or production environment has been created or accepted as part of Release 0.6.
