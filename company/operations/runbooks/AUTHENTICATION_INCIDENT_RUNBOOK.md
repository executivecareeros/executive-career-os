# Authentication Incident Runbook

> Purpose: Contain and recover failures involving registration, verification, login, sessions, password recovery, invitations, or founder authorization.

## Trigger

Users cannot authenticate, unverified users gain access, callbacks redirect incorrectly, sessions persist after logout, founder-only access is exposed, invitation replay succeeds, or suspicious authentication activity appears.

## Responsible Owner

Founder / Security Officer. Privacy Officer participates when account or workspace exposure is possible.

## Procedure

1. Declare severity and identify the affected flow, environment, time, and accounts using safe identifiers.
2. Stop new invitations or external access if authorization cannot be trusted.
3. Preserve Supabase Auth, application, callback, and deployment evidence without copying tokens.
4. Check provider health before changing configuration.
5. Verify Site URL, redirect allow-list, application origin, cookie flags, environment scope, and deployed commit.
6. Test with a fictional account; never ask for a user's password or recovery code.
7. Revoke affected sessions and rotate exposed project keys only when evidence requires it.
8. Restore the last known-good deployment/configuration if the incident began with a change.
9. Verify invitation binding, email confirmation, callback replay prevention, login, recovery, logout, expiry, and founder access.
10. Notify affected people only with confirmed facts and approved privacy guidance.

## Verification

- Unauthorized and unverified access fails closed.
- Valid fictional login, recovery, logout, and return work.
- Founder-only pages reject non-founders.
- Session cookies and callback URLs match the environment.
- No token or personal data appears in logs or documentation.

## Rollback

Restore prior staging/production Auth configuration and application deployment. If trust cannot be restored, keep invitations disabled, revoke active sessions, and escalate to Supabase support.

## Postmortem Requirements

Mandatory for unauthorized access, founder-access failure, session or callback weakness, credential exposure, or Severity 1/2 authentication outage. Include privacy impact and user-notification decision.
