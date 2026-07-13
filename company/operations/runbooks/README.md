# Operations Runbooks

> Purpose: Provide controlled, repeatable procedures for deploying, recovering, and operating Orendalis environments.

## Use

Runbooks translate company policy into step-by-step operational action. They do not grant authority, approve spending, or replace provider documentation. The incident owner selects the relevant runbook, records timestamps and evidence, and stops whenever a prerequisite or validation fails.

## Ownership

- Accountable owner: Founder acting as Operations and Release authority.
- Security authority: Founder acting as Security Officer.
- Database recovery authority: Founder acting as Database Owner.
- Future delegation must be recorded in the company asset and access registers before use.

## Library

| Runbook | Use |
| --- | --- |
| `STAGING_DEPLOYMENT_RUNBOOK.md` | Controlled deployment to an approved isolated staging environment |
| `PRODUCTION_DEPLOYMENT_RUNBOOK.md` | Future production release after separate approval |
| `ROLLBACK_RUNBOOK.md` | Restore the last known-good application or configuration |
| `DATABASE_RECOVERY_RUNBOOK.md` | Contain database incidents and restore verified service |
| `AUTHENTICATION_INCIDENT_RUNBOOK.md` | Respond to login, session, callback, or access failures |
| `SUPABASE_INCIDENT_RUNBOOK.md` | Manage Supabase availability, database, Auth, API, or quota incidents |
| `VERCEL_INCIDENT_RUNBOOK.md` | Manage build, deployment, runtime, TLS, or hosting incidents |
| `MICROSOFT_DEPENDENCIES.md` | Operate around Microsoft 365 dependencies without unsafe mail changes |

## Operating Rules

1. Confirm the trigger and severity before changing anything.
2. Name one incident or change owner.
3. Protect people, data, access, and evidence first.
4. Prefer containment and reversible actions.
5. Never use staging credentials in production or production data in staging.
6. Never paste credentials, tokens, recovery codes, invitation links, or personal data into Git, tickets, screenshots, or chat.
7. Never claim recovery until the verification section passes.
8. Record deviations and require postmortem review when the runbook was insufficient.

## Review Cadence

Review quarterly, after every Severity 1 or Severity 2 incident, after provider or architecture changes, and before each major release. A runbook is not operationally proven until it has passed a controlled exercise.
