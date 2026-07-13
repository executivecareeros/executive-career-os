# Supabase Incident Runbook

> Purpose: Respond safely to Supabase database, Auth, API, backup, quota, or platform incidents.

## Trigger

Supabase service advisory, API/database/Auth failure, elevated latency/errors, quota or billing suspension, backup failure, key exposure, or RLS concern.

## Responsible Owner

Founder / Infrastructure and Database Owner. Security and Privacy authority join for access or data concerns.

## Procedure

1. Confirm the affected project and environment; never change another environment.
2. Check official Supabase service health and project health.
3. Classify availability, Auth, database, storage, quota, billing, key, or policy failure.
4. Preserve safe logs, timestamps, request identifiers, deployment/schema version, and provider messages.
5. Pause writes/invitations when data integrity or authorization is uncertain.
6. Do not recreate, resize, restore, or rotate keys without the relevant approval unless emergency containment requires it.
7. For database impact, follow `DATABASE_RECOVERY_RUNBOOK.md`.
8. For Auth impact, follow `AUTHENTICATION_INCIDENT_RUNBOOK.md`.
9. For provider outage, wait and communicate unless the approved continuity threshold justifies recovery action.
10. Open provider support with sanitized evidence when the issue persists or requires backend action.

## Verification

Database/API/Auth health, migrations, RLS, invitations, sessions, workflow writes, backups, quotas, and logs are verified in the affected environment.

## Rollback

Restore the last known-good project configuration or verified backup. Rotate impacted staging keys and redeploy only the affected environment. Do not clone or substitute production data.

## Postmortem Requirements

Required for Severity 1/2, restore, key exposure, RLS failure, lost writes, provider support escalation, or billing suspension.
