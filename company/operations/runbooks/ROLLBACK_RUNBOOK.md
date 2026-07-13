# Rollback Runbook

> Purpose: Restore a last known-good state when a release or configuration change fails acceptance.

## Trigger

Failed health check, authentication failure, cross-workspace exposure, data-integrity risk, elevated errors, incompatible migration, missing required security control, or release-owner stop decision.

## Responsible Owner

Founder / Release Manager. The Security Officer may order immediate containment. Database restoration requires Database Owner authority.

## Procedure

1. Declare severity, owner, scope, start time, and rollback trigger.
2. Stop the rollout and unrelated changes.
3. Pause invitations and risky writes if integrity or access is uncertain.
4. Preserve logs, deployment identifiers, schema version, errors, and timestamps.
5. Identify the documented last known-good application, variables, callbacks, and compatible schema.
6. Restore the prior Vercel deployment without changing unrelated settings.
7. If schema compatibility is broken, stop writes and follow `DATABASE_RECOVERY_RUNBOOK.md`.
8. Rotate only credentials known or suspected to be exposed.
9. Run minimum authentication, authorization, RLS, read/write, and workflow verification.
10. Record recovery time and maintain observation until stable.

## Verification

- Correct deployment and schema versions are active.
- Authentication, logout, founder authorization, and workspace isolation pass.
- Writes are durable and append-only controls remain active.
- Error rates return to baseline and no new privacy/security issue appears.

## Rollback

If the rollback itself fails, do not roll forward blindly. Escalate severity, disable external access where possible, preserve evidence, and restore from the verified database/source recovery path.

## Postmortem Requirements

Every production rollback and every rollback failure requires a postmortem. Staging rollbacks require one when they reveal a missing test, unsafe procedure, or systemic defect.
