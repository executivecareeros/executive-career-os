# Founder Private Escalation Register

**Visibility:** Founder and explicitly authorized Orendalis operators only.  
**Storage rule:** Internal repository record; never expose through product pages, public APIs, search indexing, analytics, or executive/employer views.  
**Data rule:** Do not record passwords, tokens, MFA codes, private keys, payment data, or raw sensitive user documents.

## Active issue index

| Issue ID | Created | Status | Priority | Category | Affected feature | Environment | Luna attempts | Recommended model | Founder action | Next review |
|---|---|---|---|---|---|---|---:|---|---|---|
| ESC-2026-0717-001 | 2026-07-17 | Sol implementation complete; staging acceptance pending | P0 | Geographic eligibility and confidence ranking | Authenticated opportunities, search, Atlas | Staging pending | 2 | Sol | Apply migration and validate authenticated staging | Before production deployment |

### ESC-2026-0717-001

- **User impact:** Current implementation does not yet prove all geographic eligibility classes, search filters, Atlas attainability explanations, or production ranking behavior across desktop and 390px mobile.
- **Business impact:** Ineligible opportunities can reduce trust and waste executive time.
- **Security/privacy impact:** No exposure observed.
- **Revenue/account-growth impact:** Ranking uncertainty can reduce activation and return usage.
- **Observed evidence:** Founder confirmed Türkiye base and EU/Turkish eligibility; full acceptance fixture was not completed in the authenticated live session.
- **Exact error:** None observed; acceptance evidence is incomplete.
- **Affected commit:** `ed48ebc`.
- **Reproduction:** Sign in, open opportunities, run the ten geographic fixtures, compare default order, filters, explanations, desktop, and 390px mobile behavior.
- **Expected:** Eligibility precedes professional fit; uncertain or ineligible roles are clearly labeled and not promoted by default.
- **Actual:** Deterministic eligibility helpers and list ordering exist, but end-to-end live validation is outstanding.
- **Luna attempts:** Two bounded attempts: deterministic geography helper/list ordering (`ed48ebc`), then final review against the required authenticated profile/search contract. The second attempt found the minimum data model and end-to-end acceptance were not present.
- **Why Luna cannot complete it:** The current architecture has Blueprint country preferences but no durable authenticated geographic profile model; search and Ranked Opportunities do not share a complete eligibility/confidence contract; Atlas explanations do not consume that contract; and live authenticated desktop/mobile acceptance is unavailable through this execution surface.
- **Current workaround:** Treat the current ranking as not accepted for high-confidence production use; preserve explicit eligibility labels.
- **Risk of waiting:** Executives may see geographically impractical roles and lose trust.
- **Recommended Sol mission:** Complete and validate the geographic confidence ranking across the durable profile schema, eligibility engine, shared search/ranking contract, Atlas explanations, deterministic fixtures, desktop/mobile, and production.
- **Estimated Sol effort:** One focused mission.
- **Required access:** Authenticated production session, repository, deployment status, and read-only runtime evidence if failures appear.
- **Sol implementation:** `a185c7f` introduced the durable workspace-isolated geographic profile, deterministic eligibility states, shared Search/Atlas confidence engine, Best Match ordering, Founder regression fixture, and protected Founder confirmation. `9f5e136` completed backward-compatible profile hydration, confirmed-over-inferred precedence, expanded confidence evidence, canonical opportunity lifecycle metrics, and network regression coverage.
- **Acceptance evidence:** Deterministic Founder ordering, shared Atlas intelligence, TypeScript, lint, provider pipeline, deduplication, source closure, inventory count, RLS architecture, and production build pass locally.
- **Resolution:** Implementation complete; remains open until migration `202607170001` is applied in staging and authenticated desktop/390px acceptance confirms live ordering and persistence.

### ESC-2026-0717-002

**Status:** Closed on 2026-07-17. The detail below is preserved as historical escalation evidence.

- **User impact:** Opportunity collection cannot yet refresh autonomously; executives may receive stale or incomplete inventory.
- **Business impact:** Live coverage, freshness, and provider reliability cannot be measured continuously.
- **Security/privacy impact:** Durable records are workspace-scoped with RLS. The scheduler has constant-time bearer authentication, but activation is stopped because the Vercel project named `orendalis-staging` currently owns the live production domains. A scheduler credential created during configuration was rotated; its superseded key must be revoked before activation. No scheduler secret remains configured in Vercel.
- **Observed evidence:** Existing collection runs only inside an authenticated web request; queue and outcome state were process-local.
- **Sol implementation:** Migration `202607170002` adds durable schedules, jobs, immutable attempt outcomes, expiring concurrency leases, cancellation, indexes, and RLS. The Coverage Engine now supports durable queue and run stores and atomic database claims.
- **Validation evidence:** Durable-ingestion regression, concurrency claim, cancellation, idempotent run persistence, Coverage Engine regression, database architecture, TypeScript, lint, and production build.
- **Resolving commits:** `ea218ae` (durable ingestion), `7ad9ad6` (authenticated scheduler and cron), and `18d1223` (server-authenticated route bypasses user-session middleware).
- **Deployment state:** Scheduler code is deployed but inert. Migrations `202607170001`, `202607170002`, and `202607170003` are applied. The unauthenticated live endpoint returns `401`. Vercel scheduler variables were removed before redeployment, so no autonomous trigger can execute.
- **Acceptance required:** Establish a Vercel staging environment with no production domains; revoke the superseded Supabase scheduler key; configure replacement server-only credentials there; activate one compliant provider; persist two live runs; verify idempotency, inventory metrics, Search/Atlas consumption, and desktop/mobile status evidence.
- **Rollback:** Disable schedules and trigger, allow leases to expire, revert application code, preserve audit history, then remove unused scheduler tables only after verification.
- **Closure evidence:** Dedicated `orendalis-network-staging` deployment has no production domain, authenticated scheduler execution succeeded, Greenhouse produced canonical inventory across repeated idempotent runs, and provider health was recorded. Resolving commit: `a6f4068`.

## Closed issues

| Issue ID | Closed | Resolution evidence |
|---|---|---|
| ESC-2026-0717-002 | 2026-07-17 | Isolated network staging is active with no production domain, authenticated scheduling, two idempotent Greenhouse runs, canonical inventory, and provider health. Resolving commit: `a6f4068`. |
