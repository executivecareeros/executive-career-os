# Vercel Incident Runbook

> Purpose: Respond to Vercel build, deployment, runtime, routing, TLS, environment, quota, or platform incidents.

## Trigger

Failed build/deployment, unavailable application, elevated server errors, wrong commit, missing variables, invalid TLS, unexpected public exposure, quota/billing suspension, or Vercel advisory.

## Responsible Owner

Founder / Infrastructure and Release Manager. Security Officer joins for exposure, secret, TLS, or access concerns.

## Procedure

1. Confirm environment, project, deployment identifier, commit, time, and observed impact.
2. Check Vercel service health and the project's deployment/runtime logs.
3. Stop promotion and unrelated configuration changes.
4. Verify project root, Node version, build command, environment scope, hostname, and deployment commit.
5. If a release caused the incident, invoke `ROLLBACK_RUNBOOK.md`.
6. If a variable may be exposed, disable access, rotate it at its source, update only the affected scope, and redeploy.
7. If TLS/routing fails, use provider-generated staging URLs and do not change DNS without separate approval.
8. If quota/billing blocks service, preserve evidence and obtain founder approval before any paid change.
9. Run HTTPS, headers, Auth, RLS, workflow, and log verification after recovery.

## Verification

- Correct commit is active and build/runtime logs are healthy.
- HTTPS, security headers, routes, server actions, and callbacks work.
- Variables are correctly scoped and not exposed.
- No production deployment or DNS was changed during a staging incident.

## Rollback

Promote the last known-good compatible Vercel deployment. Disconnect or disable the affected staging project if trust cannot be restored. Database recovery is handled separately.

## Postmortem Requirements

Required for production impact, rollback, secret exposure, TLS failure, unapproved public exposure, repeated deployment failure, or Severity 1/2 outage.
