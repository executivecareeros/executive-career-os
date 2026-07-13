# Staging Deployment Runbook

> Purpose: Deploy an approved release candidate into a completely isolated staging environment without affecting production.

## Trigger

Founder approval of provider plans, exact checkout costs, region, repository, hostname, spend controls, candidate commit, and the staging release checklist.

## Responsible Owner

Founder / Release Manager. Security and database checks are performed under the founder's corresponding authority until formally delegated.

## Preconditions

- Staging resources exist under a separately approved operation.
- CI passes for the exact clean candidate commit.
- Staging Vercel and Supabase projects, variables, callbacks, and fictional seed are independent.
- Rollback target and database compatibility are recorded.
- No production credentials or personal data are present.

## Procedure

1. Open a dated change record with scope, commit, migration list, owners, window, risk, and rollback trigger.
2. Freeze candidate changes; accept only documented blocker fixes.
3. Confirm GitHub Actions and local validation pass for the exact commit.
4. Confirm staging environment-variable names and scopes without displaying values.
5. Confirm Supabase Site URL and redirect allow-list contain staging URLs only.
6. Replay any new migrations against staging before application promotion.
7. Run database, RLS, invitation, verification, isolation, and workflow checks.
8. Deploy the exact candidate commit through the approved Vercel integration.
9. Record deployment identifier and start time.
10. Run HTTPS, headers, cookies, authentication, founder authorization, upload, and full fictional Beta Journey smoke tests.
11. Review Vercel and Supabase logs for unexplained errors or sensitive content.
12. Record outcome as Accepted, Rejected, or Rolled Back.

## Verification

- Deployed commit matches the approved hash.
- HTTPS and required security headers pass.
- Staging cookies are Secure, HTTP-only, and correctly removed on logout.
- Invitation, verification, recovery, login, session return, founder authorization, workflow, and feedback pass.
- RLS prevents cross-workspace access.
- No production endpoint, callback, key, user, or data is used.
- Browser console and provider logs contain no unexplained error.

## Rollback

Stop invitations and writes, invoke `ROLLBACK_RUNBOOK.md`, restore the last known-good staging deployment, and use a verified database restore or fresh rebuild if migrations are incompatible. Do not roll production back as part of a staging event.

## Postmortem Requirements

Required for failed deployments, rollback, security-control failure, data-integrity concern, or more than 30 minutes of unplanned staging unavailability. Record timeline, cause, detection, impact, evidence, recovery, missed control, and owned corrective actions.
