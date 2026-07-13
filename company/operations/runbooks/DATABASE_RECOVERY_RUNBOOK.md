# Database Recovery Runbook

> Purpose: Restore trustworthy database service after corruption, loss, migration failure, unauthorized access, or provider failure.

## Trigger

Data corruption, missing records, cross-workspace exposure, failed migration, database unavailability, suspected credential compromise, or failed integrity check.

## Responsible Owner

Founder / Database Owner, with Security Officer authority for containment and Privacy Officer authority for exposure assessment.

## Procedure

1. Declare severity and stop application writes when continued writes could worsen impact.
2. Preserve database, Auth, API, application, deployment, and audit evidence.
3. Identify affected environment, time window, workspaces, tables, and last verified restore point.
4. Determine whether the issue is availability, configuration, corruption, unauthorized access, or application behavior.
5. For availability only, wait for verified provider recovery unless failover is approved.
6. For migration failure, do not reverse SQL manually; use a reviewed compensating migration or restore.
7. Restore into an isolated recovery target when supported; never overwrite the only evidence first.
8. Verify schema, migration set, row counts, constraints, triggers, RLS, append-only history, and representative records.
9. Rotate affected database/API credentials and update only the impacted environment.
10. Reconnect the application, run smoke tests, and reopen writes gradually.

## Verification

- Restore source and timestamp are recorded.
- Migrations, constraints, triggers, functions, and policies match the approved release.
- Cross-workspace isolation and founder permissions pass.
- Append-only records have not been overwritten.
- Recovery-point and recovery-time results are measured.

## Rollback

If recovery validation fails, keep the application read-only/offline, preserve the failed recovery target, return to the earlier verified restore point, and escalate to provider support. Never substitute production data into staging.

## Postmortem Requirements

Mandatory for every restore, corruption event, unauthorized access, lost write, RPO/RTO breach, or destructive operator error. Privacy assessment is mandatory if any person or workspace may have been exposed.
