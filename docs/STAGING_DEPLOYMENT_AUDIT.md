# Staging Deployment Audit

> Purpose: Record the deployment requirements, provider position, operational dependencies, and unresolved approval gates for an isolated Orendalis staging environment.

**Audit date:** 13 July 2026

**Scope:** Repository and documented provider state only

**External changes made:** None

## Executive Finding

Release 0.6 RC1 builds successfully and has a repeatable validation workflow. The application is technically deployable, but no staging environment exists. Vercel and Supabase remain unprovisioned, staging secrets and callbacks do not exist, external email delivery is not accepted, restore testing is incomplete, and application security headers are not configured.

The repository is ready for a founder review of the staging plan. It is not yet ready to expose a staging service or collect personal data.

## Application Deployment Profile

| Item | Audited state | Deployment requirement |
| --- | --- | --- |
| Framework | Next.js `16.2.10`, App Router | Use a host that supports the pinned Next.js version and server-rendered routes. |
| UI runtime | React and React DOM `19.2.4` | Installed by `npm ci`. |
| Language | TypeScript | Production build performs TypeScript validation. |
| Node.js | CI and local runtime use Node `24` (`v24.18.0` locally) | Configure Node 24 for staging; do not rely on a provider default. |
| Package manager | npm; lockfile present | Use `npm ci`, never an unlocked install. |
| Application root | `frontend/` | Configure the Vercel project root as `frontend`. |
| Build command | `npm run build` | Must complete before deployment promotion. |
| Start command | `npm run start` | Relevant to non-Vercel hosting; Vercel uses the Next.js adapter. |
| Output mode | Standard Next.js output; no `output` override | Do not configure a custom output directory. |
| Routes | 41 `page.tsx` routes and 4 route handlers at audit time | Dynamic authentication and workflow routes require a server runtime. |
| Database migrations | 10 ordered SQL migrations | Replay in filename order against a fresh staging database. |
| Repository remote | `executivecareeros/executive-career-os` | The documented `Orendalis` organization is not yet the repository remote. Do not transfer or rename without founder approval. |

## Runtime Boundaries

- `NEXT_PUBLIC_DATA_ACCESS_MODE=supabase` is mandatory in staging. `memory-demo` is not durable and must fail the release gate.
- Authentication and data access use the Supabase project URL and publishable/anonymous key. No privileged Supabase administrator credential is used by the application.
- Access and refresh tokens are stored in HTTP-only, `SameSite=Lax` cookies. Cookies become `Secure` when `NODE_ENV=production`.
- The application derives email-verification and password-recovery redirects from `NEXT_PUBLIC_APP_URL`. A staging value is therefore mandatory.
- Founder-only Company Control requires an exact server-side `COMPANY_CONTROL_FOUNDER_EMAIL` match.
- Uploaded CV/resume files are processed in the application request, limited to 5 MB, and discarded after extraction. The current product does not use Supabase Storage.

## Environment and Secret Requirements

The authoritative inventory is [STAGING_ENVIRONMENT_VARIABLES.md](./STAGING_ENVIRONMENT_VARIABLES.md). Staging values must be project-specific and must never reuse local or future production values.

There is no application requirement for an OpenAI key, Microsoft Graph credential, SMTP password, privileged database credential, analytics token, or monitoring credential.

## Supabase Configuration Audit

### Present in the repository

- Local Supabase configuration targets PostgreSQL 15.
- Email confirmations are enabled locally.
- Local callback allow-list includes `localhost` and `127.0.0.1` confirmation routes.
- Ten ordered migrations define the domain schema, authentication onboarding, workspace isolation, import, memory, reasoning, productivity, beta workflow, invitation management, and email-verification enforcement.
- RLS policies and deterministic database tests exist for workspace isolation and invitation-only access.
- `supabase/seed.sql` contains fictional demonstration records.

### Required in staging

- A new Supabase project owned by Orendalis.
- A fresh database created by migration replay; no production clone and no founder or customer data.
- Staging Site URL and exact allow-listed callback/recovery URLs.
- Email confirmation enabled.
- A staging-only fictional founder identity and fictional invitations created through the approved product/setup procedure.
- RLS, migration, invitation, verification, and isolation tests repeated against the staging project before any design-partner invitation.

## Authentication Callback Inventory

| Flow | Application destination | Required Supabase configuration |
| --- | --- | --- |
| Email verification | `https://[staging-host]/auth/confirm?next=/onboarding` | Add the exact staging origin and confirmation callback. |
| Verification resend | Same confirmation callback | Must remain staging-only. |
| Password recovery | `https://[staging-host]/reset-password` | Add the exact recovery destination. |
| Login continuation | Internal relative `next` path | Application already rejects protocol-relative external paths. |
| Logout | `/login` or approved relative continuation | Verify cookie removal and session revocation. |

No production URL may appear in the staging Supabase URL configuration. No staging URL may be added to production before a separate production approval.

## Storage Audit

No storage bucket is required for RC2. The upload endpoint extracts supported documents in memory and does not retain the raw file. Creating a bucket now would expand scope and data-retention risk.

Staging controls:

- Keep the 5 MB application limit.
- Accept only supported file types and signature checks already enforced by the application.
- Confirm raw files are absent from Supabase Storage and the database after review.
- Treat extracted professional history as Restricted test data even though only fictional data is permitted.
- If durable document storage is proposed later, require a separate schema, policy, retention, malware-scanning, and privacy review.

## Email Audit

- Local email verification is accepted through Supabase local mail capture.
- Internet delivery, sender authentication, and staging transactional delivery are not accepted.
- Microsoft 365 mailbox service is documented as operational, but DKIM remains blocked under Microsoft case `2607130050001139`.
- Staging must not modify Microsoft 365, DNS, MX, SPF, DKIM, DMARC, or Proton records.
- Until an approved transactional sender is configured, invitation delivery remains development-mode link copy and staging email tests must use a controlled provider-supported test path.
- Support notifications are not implemented and must not be represented as active.

## CI and Deployment Configuration

The existing GitHub Actions workflow `.github/workflows/release-0.6.yml` runs on pull requests and pushes to `main`. It uses Node 24, installs with `npm ci`, runs lint and deterministic domain tests, starts an isolated PostgreSQL container, replays migrations and fictional seed data, runs database/RLS/beta tests, performs a secret-pattern scan, and builds the application.

Gaps before staging promotion:

- The workflow is validation-only; it does not deploy.
- No GitHub environment, protected staging branch, deployment approval, or Vercel integration is configured.
- The current Git remote is not the documented Orendalis organization.
- Deployment automation must not be added until founder approval.

## Security Review

| Control | State | Required action before staging acceptance |
| --- | --- | --- |
| Secrets in repository | No configured staging values; secret-pattern scan exists | Run full tracked-file and build-output scans before deployment. |
| Browser secret exposure | Only publishable Supabase configuration is designed for browser use | Confirm no server variable is prefixed `NEXT_PUBLIC_`. |
| RLS | Implemented and tested locally | Re-run against the exact staging project. |
| Authentication gate | Invitation, verified email, session and founder authorization exist | Complete the full staging browser journey. |
| Cookies | HTTP-only, Lax, Secure in production mode | Confirm deployed cookies have `Secure`, expected lifetime, and correct deletion. |
| HTTPS | Provider dependent; not yet provisioned | Require valid TLS before any authentication test. |
| Security headers | No explicit CSP, HSTS, frame, content-type, referrer, or permissions policy found | Define and verify a staging-safe header policy before approval for external access. |
| Rate limiting | Supabase resend interval exists locally; application-wide limits are not established | Review auth and upload abuse controls before inviting external testers. |
| Logging | Provider logs not connected | Establish a no-sensitive-payload logging policy and manual review procedure. |
| Personal data | Not permitted in staging | Use fictional data only; do not clone production. |

## Monitoring Preparation

No external monitoring is activated. The initial staging architecture uses existing provider signals only:

| Signal | Source after provisioning | Review action |
| --- | --- | --- |
| Availability and TLS | Vercel deployment status and a founder-run smoke check | Check after each deployment and daily during acceptance. |
| Build/deployment failure | GitHub Actions and Vercel deployment logs | Stop promotion; retain last known-good deployment. |
| Server errors | Vercel runtime logs | Record request correlation and redact tokens/personal data. |
| Authentication failure | Supabase Auth logs plus application symptoms | Compare callback, rate, and session behavior without bypassing auth. |
| Database failure | Supabase health/logs and deterministic smoke queries | Stop writes and assess restore/rollback. |

External uptime, error tracking, analytics, log drains, and alerting remain outside this approval gate.

## Backup and Recovery Strategy

The recommended Supabase Pro plan documents daily backups with seven-day retention. That provider capability is not a substitute for a tested restore.

| Objective | Staging target |
| --- | --- |
| Database backup | Provider daily backup after project creation; verify in the project dashboard. |
| Retention | Seven days if the approved Pro plan provides it; record the actual plan setting. |
| Source recovery | Git history plus Vercel last known-good deployment. |
| Seed recovery | Reset database, replay all migrations, then load fictional staging seed only. |
| Restore verification | Perform one controlled restore/reset rehearsal before staging acceptance. |
| Provisional RPO | 24 hours, subject to founder approval and verified provider backup schedule. |
| Provisional RTO | 4 hours for a small private staging environment, to be measured in rehearsal. |

The RPO/RTO values are planning targets, not current guarantees.

## Provider Review

Pricing below is official published list pricing reviewed on 13 July 2026. It is not an invoice quote and may exclude tax, regional pricing, currency conversion, and usage overages.

| Provider | Documented current state | Staging recommendation | Published base price | Suitability | Rollback |
| --- | --- | --- | --- | --- | --- |
| Vercel | Not connected; plan unconfirmed | Pro for a commercial company deployment | USD 20/month plus usage; checkout must confirm regional/tax total | Native Next.js support, preview/production environments, rollback, HTTPS and deployment logs. Hobby is stated to be personal/non-commercial. | Remove custom staging domain if any, disable deployments, export environment-variable names, and delete the project only after evidence capture. |
| Supabase | Local runtime only; cloud plan unconfirmed | Pro with one isolated staging project | From USD 25/month; published plan includes one Micro project through compute credits and daily backups | Provides PostgreSQL, Auth, RLS, logs and backups needed for production-like staging. Free projects pause and do not include automatic backups. | Export schema/evidence, revoke project keys, disconnect Vercel, then delete the project only after an approved reset/retention decision. |
| GitHub | `Orendalis` organization documented on Free; repository remote still points to `executivecareeros` | Keep Free for review unless protected-branch/organization controls require Team | Current Free: USD 0; Team list price: USD 4/user/month | Existing CI works. Ownership, MFA, repository location and protection must be verified before connection. | Disconnect Vercel OAuth/installations, retain local clone, restore prior remote; never delete repository history as rollback. |
| Microsoft 365 | Business Basic, one active user; invoice amount unknown | No plan change for staging | Founder invoice/renewal must confirm exact cost | Operational mailbox exists, but DKIM case remains an external dependency. Do not use it as proof of transactional email readiness. | No staging change is proposed, so no rollback is required. |

Official references: [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing), [GitHub pricing](https://github.com/pricing), and the repository's Microsoft support and asset records.

### Approval Cost View

- Published new base commitment if Vercel Pro and Supabase Pro are approved: **USD 45/month before tax and usage overages**.
- GitHub Free adds **USD 0/month** under the documented current plan.
- Microsoft 365 is an existing commitment; its exact invoice cost, tax, currency, and renewal remain founder-confirmed.
- Vercel regional pricing, Supabase checkout total, tax, payment currency, spend caps, and any usage charges must be shown to the founder immediately before purchase.

## Required Founder Decisions

1. Approve or reject Vercel Pro after reviewing the live checkout total and spend limit.
2. Approve or reject Supabase Pro after reviewing the live checkout total, region, backup terms, and spend cap.
3. Confirm whether the repository will remain under `executivecareeros` for RC2 or be transferred to `Orendalis` under a separate controlled approval.
4. Select the private staging hostname. A provider-generated URL avoids DNS changes and is recommended for RC2.
5. Confirm the staging founder email identifier without recording credentials.
6. Accept the provisional RPO/RTO or request different targets.
7. Approve the first external resource creation only after reviewing [STAGING_RELEASE_CHECKLIST.md](./STAGING_RELEASE_CHECKLIST.md).

## Audit Decision

The architecture and checklist are prepared for founder review. External staging creation remains blocked by plan, cost, region, ownership, and hostname approval.
