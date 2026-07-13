# Staging Execution Plan

> Purpose: Define the exact, gated order for a future founder-approved staging creation without authorizing any step today.

## Preconditions

- Founder approves the final candidate commit, maximum spend, plans, live checkout totals, Frankfurt region, account ownership, GitHub scope, and provider hostname.
- All provider accounts have MFA and independent recovery.
- Working tree and GitHub Actions are clean for the same candidate.
- Only fictional data is authorized.

## Controlled Sequence

| Step | Action | Expected duration | Verification and approval gate | Rollback |
| ---: | --- | --- | --- | --- |
| 1 | Reverify candidate, CI, migrations, secret scan and build | 30–60 min | Release Manager records one immutable commit; founder approves candidate | Reject candidate; no external state exists |
| 2 | Review Vercel Pro checkout and GitHub App consent | 15–30 min | Founder approves exact total, renewal, ownership, repository-only scope and spend policy before payment | Cancel checkout/consent |
| 3 | Purchase Vercel Pro and create an empty staging project | 15–30 min | Founder performs payment; confirm Orendalis ownership, root `frontend`, Node 24, no deployment/secrets yet | Disconnect integration; delete empty project only with approval; downgrade per terms |
| 4 | Review Supabase Pro checkout and create Frankfurt staging project | 20–40 min plus provisioning | Founder approves exact total, region and spend cap before payment; confirm project is staging-only | Stop checkout; after creation export evidence/revoke/delete only with approval; downgrade if required |
| 5 | Replay ten migrations and fictional seed | 30–60 min | Database validation, RLS, invitation and isolation tests pass; no real data | Stop writes; recreate project from accepted migration set |
| 6 | Configure Supabase Auth callbacks and confirmation settings | 20–40 min | Exact provider HTTPS origin only; confirmation, recovery, replay and founder authorization tests pass | Restore prior allow-list; rotate affected staging keys if exposed |
| 7 | Configure seven approved staging variables | 15–30 min | Two-person-style founder checklist despite single operator; preview scope excluded; no privileged key | Remove/rotate staging values; keep deployment disabled |
| 8 | Perform first Vercel deployment from the recorded commit | 15–30 min | Build succeeds, HTTPS valid, provider logs clean; founder approves smoke testing | Disable deployment or promote last known-good deployment |
| 9 | Run security and functional smoke tests | 60–120 min | Headers/cookies, invitation, verification, onboarding, journey, isolation, responsive/keyboard and console checks pass | Disable invitations/deployment; return to development |
| 10 | Exercise application rollback and database reset/restore | 60–120 min | Measure RPO/RTO; preserve evidence; founder confirms recovery is adequate | Recreate staging from accepted commit and migrations |
| 11 | Conduct staging founder acceptance | 60–120 min | Founder records `STAGING ACCEPTED` or `STAGING NOT ACCEPTED` | Revoke fictional sessions/invitations; disable environment |
| 12 | Consider `staging.orendalis.com` | Separate future change | Only after acceptance and explicit DNS approval | Remove the new DNS/domain mapping; provider hostname remains recovery path |

**Expected active effort:** approximately 6–10 hours, excluding provider provisioning, DNS propagation (not in initial scope), incident resolution, and waiting periods. Duration is a planning range, not a promise.

## Approval Boundaries

Approval to create Vercel does not approve Supabase. Approval to create providers does not approve deployment. Deployment does not approve staging acceptance. Staging acceptance does not approve production, private beta, DNS, Microsoft changes, transactional email, marketing, or real personal data.

## Final Creation Gate

The founder must provide a future explicit instruction identifying the approved plans, maximum spend, region, GitHub repository scope, and authorization to begin Step 1. Until then, this plan remains documentation only.
