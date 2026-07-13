# Staging Final Approval

> Purpose: Give the founder one evidence-based decision package before Orendalis creates or pays for any staging infrastructure.

**Review date:** 13 July 2026

**Candidate branch:** `main`

**Candidate commit before this documentation package:** `2a12e71cf68bd12ea24fba0d302d880164bbdd91`

**External actions performed:** None

## Executive Decision

**READY TO CREATE STAGING**, subject to the founder approving the live checkout totals, provider ownership, Supabase region, spend controls, GitHub access scopes, and the exact release-candidate commit after this package is committed.

This decision authorizes review and a later founder-controlled creation sequence. It does not authorize a purchase, project creation, deployment, DNS change, Microsoft change, GitHub change, secret creation, or collection of personal data.

## Verified Current State

| Control | Evidence | Result |
| --- | --- | --- |
| Working tree | `git status --short` before preparation | Clean |
| Default/local branch | `git branch --show-current` | `main` |
| Repository | `origin` points to `executivecareeros/executive-career-os` | Confirmed; transfer to Orendalis is not approved |
| Production build | Final validation for this package | Pass |
| Database migrations | Ten ordered migrations through `202607130010_email_verification_enforcement.sql`; static database validation | Current in repository; cloud replay not yet possible |
| Company Control | Staging and Operations Readiness sections | Current after this package |
| Runbooks | `company/operations/runbooks/` | Eight operational runbooks current |
| Founder Acceptance | `company/founder-acceptance/RELEASE_DECISION.md` | Complete; `READY FOR STAGING` |
| Operational Readiness | incident severity, release calendar, recovery and continuity plans | Complete as documentation; exercises require staging |

## Provider Decision

### Vercel

- **Recommendation:** Pro, one deploying seat.
- **Reason:** Orendalis is a commercial company and the remote is under the `executivecareeros` namespace. The live repository visibility and organization controls still require verification. Vercel documents that a Hobby team cannot deploy a private repository owned by a GitHub organization; Pro avoids that restriction and provides the appropriate commercial/team path, preview deployments, managed HTTPS, deployment history, faster builds, spend management, and rollback.
- **Published price:** USD 20/month platform fee plus additional usage. It includes one deploying seat and USD 20/month usage credit. Vercel also lists 1 TB Fast Data Transfer and 10 million Edge Requests before usage credit/on-demand billing.
- **Expected initial base cost:** USD 20/month and USD 240/year, excluding tax, exchange rate, add-ons, and overage.
- **Scaling:** Add seats, add-ons, or on-demand usage only after a separate approval. Configure low spend alerts/actions before deployment; do not rely on Vercel's documented USD 200 default notification threshold.
- **Rollback:** Disable deployments, promote the prior known-good deployment when applicable, disconnect the Git integration, remove staging variables, and delete the empty project only with founder approval.
- **Cancellation:** Vercel's current terms state that Pro may be downgraded through Support, effective at the next renewal period. The founder must review the live terms and renewal date before purchase.
- **Founder actions:** Confirm Orendalis-owned billing, checkout total and tax; review legal terms; enable MFA/recovery; approve GitHub App scope; restrict the installation to this repository; approve spend limits; create the project only in the separately approved execution step.

#### Vercel GitHub permissions requiring founder review

Vercel currently documents repository permissions for Administration (read/write), Checks (read/write), Contents (read/write), Deployments (read/write), Pull Requests (read/write), Issues (read/write), Metadata (read), Webhooks (read/write), and Commit Statuses (read/write); organization Members (read); and user Email addresses (read). A March 2026 update also documents Actions (read) and Workflows (read/write). The live GitHub consent screen is authoritative. Install access only for `executivecareeros/executive-career-os`; reject an unexpected broader scope.

Official references: [Vercel Pro](https://vercel.com/docs/plans/pro-plan), [Vercel pricing](https://vercel.com/pricing), [Vercel GitHub permissions](https://vercel.com/docs/git/vercel-for-github), and [Vercel terms](https://vercel.com/legal/terms).

### Supabase

- **Recommendation:** Pro with one Micro staging project.
- **Reason:** It does not pause for inactivity and includes daily backups, seven-day retention, longer logs, email support, and production-representative PostgreSQL/Auth/RLS operation. Free lacks automatic backups and can pause.
- **Published price:** From USD 25/month. The paid plan includes USD 10/month compute credit, sufficient for one Micro instance at the published price. Initial base cost is USD 25/month and USD 300/year, excluding tax, add-ons, and overage.
- **Recommended region:** Central EU (Frankfurt). It is a supported European region, offers reasonable proximity to Turkey and expected European design partners, and keeps this staging choice aligned with the product's current European operating context. This is an operational recommendation, not a legal data-residency conclusion.
- **Region implication:** Supabase states a project is bound to its region; changing region requires creating a new project and migrating. Founder approval is therefore mandatory before creation.
- **Backups:** Pro provides seven daily backups. This implies a provisional maximum 24-hour RPO until measured. Storage objects are not included in database restore; RC2 creates no Storage bucket. Point-in-Time Recovery starts at approximately USD 100/month and requires at least Small compute, so it is optional and not recommended for fictional-data staging.
- **Scaling:** Keep the default spend cap enabled. Scale compute or quotas only after measured need and founder approval.
- **Rollback:** Stop application access, export schema/evidence if required, revoke keys, disconnect Vercel, and delete/recreate the staging project only after an explicit destructive-action approval. Project deletion also deletes provider backups.
- **Cancellation:** Supabase documents an immediate downgrade to Free, with unused prepaid subscription represented as account credits rather than a payment-method refund; overage remains billable.
- **Founder actions:** Confirm organization ownership, checkout total/tax, Central EU region, spend cap, recovery owner, database password handling, and terms. Create the project only during the approved execution.
- **Required permissions:** Supabase organization Owner for billing/project creation; project Owner/Admin for settings, Auth, database, backups, logs, keys, and deletion. Application runtime receives only project-specific public/publishable access protected by RLS—never dashboard credentials, service-role credentials, or the database password.

Official references: [Supabase pricing](https://supabase.com/pricing), [regions](https://supabase.com/docs/guides/platform/regions), [backups](https://supabase.com/docs/guides/platform/backups), [region changes](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z), and [subscription management](https://supabase.com/docs/guides/platform/manage-your-subscription).

## Domain Strategy

| Environment | Recommended origin | Rationale |
| --- | --- | --- |
| Development | `http://127.0.0.1:3000` / `http://localhost:3000` | Local-only, no DNS, local Supabase and fictional data. |
| Staging creation | Vercel-generated HTTPS hostname | Avoids DNS and domain coupling while infrastructure and rollback are first proven. |
| Accepted staging (later approval) | `staging.orendalis.com` | Clear environment identity and stable callbacks; add only after staging passes on the provider hostname and a separate DNS approval is granted. |
| Production (future) | `app.orendalis.com` | Separates the application from the corporate/root domain and from staging. |

Never share cookies, callbacks, secrets, Supabase projects, or user records between these origins.

## GitHub Review

- Remote: `executivecareeros/executive-career-os`; do not transfer or rename during staging creation.
- Branch: keep `main` as the release branch. Use short-lived feature branches and pull requests; deploy staging from one recorded commit on `main`.
- Workflow: `.github/workflows/release-0.6.yml` is validation-only and covers lint, deterministic tests, database/RLS/beta validation, secret scanning, and build.
- Protection recommendation: require pull request, passing Release 0.6 workflow, no force push, no deletion, resolved conversations, and founder approval for the staging environment. Do not store deployment secrets at repository level when an environment or Vercel scope is narrower.
- Current protection state: **Unknown** because live GitHub administration was not accessed and the GitHub CLI is unavailable. Verify read-only at the approval gate.
- Deployment permission: restrict the Vercel GitHub App to this repository. Do not authorize organization-wide access without a documented reason.
- Rollback: select the last accepted commit/deployment; never rewrite or delete repository history.

Official references: [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) and [Vercel Git deployments](https://vercel.com/docs/git).

## Security Approval Gate

Before the founder permits creation, confirm all of the following in the live provider screens:

- Founder-controlled Orendalis accounts own billing and projects.
- MFA/passkey and recovery methods are active for GitHub, Vercel, Supabase, Microsoft, Porkbun, and the password manager.
- Recovery does not depend solely on the device used to create staging.
- GitHub App access is limited to the single repository.
- Staging has an independent Supabase project, keys, callbacks, database and fictional identities.
- No credential is shared, emailed, pasted into documentation, or committed.
- Provider-generated values have one named owner and one protected recovery record.
- Preview deployments do not inherit staging secrets by default.
- Supabase spend cap and Vercel spend management are configured before deployment.
- No real executive data is permitted until staging acceptance and a later private-beta approval.

## Approval Required From Founder

The founder must approve the exact commit, Vercel plan and live total, Supabase plan/live total/Frankfurt region, provider account ownership, GitHub permissions, spend limits, provider-generated initial hostname, and stop conditions. Approval to create staging remains separate from approval to accept staging or launch a private beta.
