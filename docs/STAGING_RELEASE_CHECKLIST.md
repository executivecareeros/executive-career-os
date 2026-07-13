# Staging Release Checklist

> Purpose: Provide the controlled, reversible sequence required before the first isolated staging deployment.

No item in the provisioning section may begin until the founder approves the named provider plan, live checkout cost, region, ownership, and rollback.

## 1. Founder Approval Gate

- [ ] Review [STAGING_DEPLOYMENT_AUDIT.md](./STAGING_DEPLOYMENT_AUDIT.md).
- [ ] Review [STAGING_ARCHITECTURE.md](./STAGING_ARCHITECTURE.md).
- [ ] Approve Vercel plan and live checkout total.
- [ ] Approve Supabase plan, live checkout total, and region.
- [ ] Confirm GitHub repository ownership/location decision; do not rename or transfer implicitly.
- [ ] Approve the provider-generated staging hostname or a separate DNS change.
- [ ] Confirm staging founder identity and recovery owner without recording credentials.
- [ ] Approve provisional RPO/RTO and reset strategy.
- [ ] Record approval date, scope, maximum spend, and stop conditions.

**Rollback before provisioning:** decline or defer approval. No resources or costs exist to reverse.

## 2. Repository and Release Candidate

- [ ] Working tree is clean.
- [ ] Record the candidate commit hash.
- [ ] `npm ci` completes from `frontend/package-lock.json`.
- [ ] Lint, TypeScript, deterministic tests, database tests, RLS tests, beta tests, secret scan, and production build pass.
- [ ] GitHub Actions passes for the same commit.
- [ ] Review dependency and framework advisories.
- [ ] Confirm no real `.env`, token, invitation link, personal data, or generated build output is committed.

**Rollback:** reject the commit and retain the last accepted candidate. Do not deploy a partially passing build.

## 3. Vercel Project

- [ ] Founder creates/approves the Orendalis-controlled project.
- [ ] Connect only the approved repository and commit/branch.
- [x] Set project root to `frontend`. The failed empty-root deployment remains documented as historical evidence.
- [x] Confirm Vercel detects Next.js, then use Node 24 and the default Next.js build.
- [ ] Keep the standard Next.js output; no custom output directory.
- [ ] Use a provider-generated staging hostname; do not alter DNS.
- [ ] Restrict team access and enable MFA/recovery controls.
- [ ] Configure a spend cap/alerts before the first deployment.
- [ ] Confirm preview deployments do not receive staging secrets automatically.

**Rollback:** disconnect repository integration, disable deployments, preserve logs/settings evidence, and delete the empty project only with founder approval.

## 4. Supabase Project

- [ ] Founder creates/approves a staging-only project in the approved region.
- [ ] Record project identifier and owner; never record passwords or keys.
- [ ] Confirm database major-version compatibility.
- [ ] Configure spend cap/alerts where supported.
- [ ] Replay all migrations in filename order against the fresh database.
- [ ] Verify RLS is enabled on every application table.
- [ ] Load fictional staging seed only.
- [ ] Run database, repository, invitation, email-verification, beta-workflow, and isolation tests.
- [ ] Verify automatic backup availability and retention for the approved plan.

**Rollback:** stop application access, export schema/evidence if required, revoke keys, and recreate/delete the staging project only after founder approval. Never affect production.

## 5. Authentication and Callbacks

- [ ] Set Supabase Site URL to the exact staging HTTPS origin.
- [ ] Allow only required staging confirmation and recovery URLs.
- [ ] Confirm no production callback is present.
- [ ] Keep email confirmations enabled.
- [ ] Verify invitation-bound registration.
- [ ] Verify email confirmation and callback replay prevention.
- [ ] Verify resend rate behavior.
- [ ] Verify login, session persistence, logout, and return.
- [ ] Verify password recovery and expired/invalid recovery behavior.
- [ ] Verify expired sessions return safely to login.
- [ ] Verify founder-only Company Control returns not found for non-founders.

**Rollback:** disable new invitations, restore the previous staging allow-list, rotate affected staging keys, and redeploy. Do not weaken authentication to recover service.

## 6. Environment Variables

- [ ] Complete every check in [STAGING_ENVIRONMENT_VARIABLES.md](./STAGING_ENVIRONMENT_VARIABLES.md).
- [ ] Apply variables to staging scope only.
- [ ] Verify browser bundles contain only approved public values.
- [ ] Verify build/runtime logs do not expose values.
- [ ] Redeploy after configuration.

**Rollback:** disable deployment, rotate provider-generated values if exposed, remove staging variables, and preserve names/scopes only.

## 7. Security and Privacy

- [ ] HTTPS certificate is valid and HTTP redirects safely.
- [ ] Session cookies are HTTP-only, Secure, SameSite=Lax, and scoped as expected.
- [ ] Define and verify CSP, HSTS, frame, content-type, referrer, and permissions-policy headers.
- [ ] Verify open-redirect protections and callback allow-lists.
- [ ] Verify upload size/type/signature controls.
- [ ] Verify raw uploads are not retained.
- [ ] Verify no production or real personal data exists.
- [ ] Review authentication and upload abuse/rate controls.
- [ ] Verify logs exclude credentials, tokens, and professional content.
- [ ] Run the repository secret-pattern scan and inspect deployment artifacts.

**Rollback:** remove external access, stop invitations, return to the last known-good deployment, rotate exposed staging credentials, and preserve incident evidence.

## 8. Storage

- [ ] Confirm no Supabase Storage bucket was created for RC2.
- [ ] Confirm supported uploads are transient and limited to 5 MB.
- [ ] Confirm database provenance records do not contain raw document content.
- [ ] Confirm cleanup after success and failure.

**Rollback:** stop uploads and purge only verified staging artifacts under an approved retention procedure.

## 9. Email

- [ ] Record Microsoft case `2607130050001139` as an external dependency.
- [ ] Make no Microsoft 365 or DNS change.
- [ ] Verify the controlled staging email path for confirmation and recovery.
- [ ] Keep invitation link copy marked as development/staging mode if verified delivery is unavailable.
- [ ] Do not claim support notifications are active.
- [ ] Record exact sender, SPF/DKIM/DMARC evidence only if a later approved provider is configured.

**Rollback:** disable outbound staging delivery and return to controlled link/mail-capture testing. Do not alter company mail routing.

## 10. Monitoring and Backup

- [ ] Verify Vercel build, deployment and runtime logs.
- [ ] Verify Supabase Auth, database and API logs.
- [ ] Define the manual review owner and cadence.
- [ ] Record failure thresholds and escalation contacts.
- [ ] Verify provider backup status and retention.
- [ ] Perform a controlled staging reset/restore rehearsal.
- [ ] Measure actual RPO/RTO and update the audit.
- [ ] Do not activate an external monitoring provider.

**Rollback:** disable any accidentally enabled paid add-on, preserve evidence, and continue with provider-native/manual review only.

## 11. Smoke and Founder Acceptance

- [x] Landing/login surface loads over HTTPS.
- [x] Public registration without invitation is blocked.
- [ ] Founder creates a fictional invitation.
- [ ] Fictional executive registers, verifies email, and completes onboarding.
- [ ] Beta Journey naturally reaches History, Blueprint, Opportunity, Atlas Assessment, Decision, Career Ledger, and Feedback.
- [ ] Logout and return preserve the Workspace.
- [ ] Export and account-closure requests remain controlled.
- [ ] Desktop, tablet, 390-pixel mobile, and keyboard-only checks pass.
- [x] Browser console and provider logs show no unexplained error during the unauthenticated route checks.
- [ ] No real personal data was used.

**Rollback:** revoke the fictional invitation/session, disable the staging deployment, preserve issue evidence, and return the candidate to development.

## 12. Staging Acceptance Decision

All of the following are mandatory:

- [ ] Costs and owners are recorded.
- [ ] CI and production build pass for the deployed commit.
- [ ] Authentication and RLS pass against staging.
- [ ] Security headers, HTTPS, and cookies pass.
- [ ] Backup/reset rehearsal passes.
- [ ] Full fictional browser journey passes.
- [ ] Rollback is demonstrated.
- [ ] Founder explicitly accepts the staging environment.

Decision options: `STAGING ACCEPTED` or `STAGING NOT ACCEPTED`.

This checklist does not authorize production, public access, marketing, DNS changes, Microsoft changes, real-user invitations, or personal-data collection.
