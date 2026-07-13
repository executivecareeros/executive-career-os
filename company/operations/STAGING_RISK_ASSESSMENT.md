# Staging Risk Assessment

> Purpose: Record the risks the founder accepts, mitigates, or blocks before any staging resource is created.

| Category | Risk | Likelihood | Impact | Mitigation | Rollback |
| --- | --- | --- | --- | --- | --- |
| Technical | Cloud behavior differs from local validation | Medium | High | Replay all migrations; repeat RLS, auth, upload, browser and build tests using fictional data | Disable deployment; recreate isolated staging from accepted commit/migrations |
| Technical | Security headers are not yet accepted in a deployed runtime | High | High | Define and verify CSP, HSTS, frame, content-type, referrer and permissions policy before staging acceptance | Remove external access; return candidate to development |
| Operational | Runbooks are documented but unexercised | High | Medium | Perform rollback and database reset/restore exercises before acceptance | Keep environment invitation-disabled and inaccessible to design partners |
| Operational | Provider health review is manual | Medium | Medium | Assign founder review cadence for Vercel/Supabase logs and status | Disable invitations and deployment during uncertainty |
| Financial | Usage overage exceeds USD 45 base | Medium | Medium | Supabase spend cap; Vercel alerts/actions; fictional low-volume usage; weekly invoice review | Stop deployments/workload; downgrade after evidence preservation |
| Financial | Tax, currency conversion or checkout differs from list price | High | Low | Founder reviews exact checkout and renewal before payment | Cancel before checkout; do not proceed on unexplained total |
| Security | GitHub App requests broad write permissions | High | High | Review live consent; restrict installation to one repository; no organization-wide access | Revoke installation and disconnect Vercel |
| Security | Staging secrets leak to previews, logs or source | Medium | Critical | Environment-specific scope, no shared credentials, secret scan, client-bundle and log review | Disable deployment, rotate affected keys, preserve incident evidence |
| Security | RLS or founder authorization differs in cloud | Low | Critical | Run staging RLS/isolation/founder-access tests before any invitation | Disable access, rotate keys, correct policy through reviewed migration |
| Vendor | Vercel or Supabase outage blocks staging | Medium | Medium | Use provider status/logs; preserve source and migrations; documented incident runbooks | Redeploy/recreate after recovery; no production dependency |
| Vendor | Supabase region selection proves unsuitable | Low | High | Founder approves Frankfurt with legal/latency caveat before creation | Create a new project in the approved region and migrate; old project deletion requires approval |
| Recovery | Daily backup permits up to one day of loss | Medium | Medium | Fictional data only; provisional 24-hour RPO; perform restore/reset rehearsal | Recreate from migrations and fictional seed; do not claim recovery until measured |
| Recovery | Supabase database backup excludes Storage objects | Low | Low | Create no Storage bucket for RC2; process uploads transiently | Purge any accidental bucket/object and record incident |
| Founder | Single founder loses device or provider access | Medium | Critical | MFA, independent recovery method, password manager, billing alerts, documented recovery routes | Invoke provider recovery; freeze releases and invitations |
| Founder | Founder approval becomes an implicit blanket authorization | Medium | High | Separate gates for purchase, creation, deployment, DNS, staging acceptance and beta | Stop at the last explicitly approved gate |
| Privacy | Real executive data enters unaccepted staging | Medium | High | Fictional data banner/instructions; no production import; supervised acceptance | Isolate service, remove data through approved procedure, assess incident obligations |

## Stop Conditions

Stop creation or deployment if the checkout differs materially from this review, ownership is personal/unrecoverable, MFA is absent, requested permissions cannot be restricted, Frankfurt is unavailable, spend controls are unavailable, the release candidate fails validation, or any real data is proposed.

## Residual Risk Position

The remaining risks are acceptable for **creation of an isolated, non-public, fictional-data staging environment** only. They are not accepted for design partners, private beta, production, or real personal data. Staging acceptance requires executed tests, rollback evidence, restore evidence, HTTPS/header verification, and a separate founder decision.
