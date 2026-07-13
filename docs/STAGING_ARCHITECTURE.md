# Staging Architecture

> Purpose: Define a provider-independent, isolated path from development through staging to future production.

## Environment Topology

```text
Local Development
  ├─ local Next.js
  ├─ local Supabase/PostgreSQL
  ├─ local mail capture
  └─ fictional data

        validated commit only
                 ↓

Isolated Staging
  ├─ dedicated Vercel project/environment
  ├─ dedicated Supabase project
  ├─ staging-only auth users and keys
  ├─ staging-only callbacks
  ├─ provider-generated HTTPS hostname
  └─ fictional acceptance data only

        separate future approval
                 ↓

Production
  ├─ independent hosting project
  ├─ independent Supabase project
  ├─ independent secrets and callbacks
  ├─ private-beta data and access controls
  └─ separate monitoring, backup and release gate
```

No database, authentication user, environment variable, callback, access key, or deployment is shared across these boundaries.

## Staging Components

| Component | Responsibility | Isolation rule |
| --- | --- | --- |
| GitHub | Source and validation evidence | Deployment reads one approved commit; no provider write access beyond deployment status unless approved. |
| Vercel | Next.js build, server runtime, HTTPS, logs and rollback | Dedicated project or custom staging environment with staging-only variables. No production domain. |
| Supabase | PostgreSQL, Auth and RLS | New project in an approved region; migrations replayed from zero. No production clone. |
| Microsoft 365 | Existing company mailbox | No staging configuration change. DKIM support case remains external. |
| Porkbun/DNS | Existing domain and mail DNS | No changes for RC2; use the Vercel-generated hostname. |

## Data Strategy

1. Create a fresh staging database.
2. Replay the ten migrations in filename order.
3. Verify migration checksums/file list against the approved commit.
4. Load only a dedicated fictional staging seed. Do not use a production dump.
5. Create invitations through the founder workflow where practical.
6. Run RLS isolation tests using separate fictional workspaces.
7. Reset by deleting test identities/data through an approved reset procedure or recreating the staging project after evidence capture.

No real CV, resume, compensation, company, recruiter, email, or career-history data is permitted.

## Promotion Model

The artifact promoted is a Git commit, not a database copy. Staging acceptance records the commit hash, migration set, build result, provider project identifiers, variable names/scopes, and smoke-test evidence. Future production must replay the same approved migrations against a new production database and configure new production values.

## Rollback Model

### Application rollback

1. Stop new invitations and active acceptance sessions.
2. Select the last known-good Vercel deployment for the same staging project.
3. Promote/redeploy it without changing database state.
4. Run authentication, read, and write smoke tests.
5. Record the failed and restored commit/deployment identifiers.

### Database rollback

Migrations are forward-only unless a reviewed compensating migration exists. Do not run ad hoc destructive SQL. If a migration makes staging unusable:

1. Stop application writes.
2. Capture logs and migration evidence.
3. Restore the verified staging backup if supported and tested, or recreate the staging project.
4. Replay the last accepted migration set.
5. Reload fictional seed data.
6. Re-run RLS and browser acceptance.

### Credential rollback

Rotate the affected staging key, update only staging-scoped variables, redeploy, verify access, then revoke the old key. Never rotate a production key as part of a staging rollback.

## Security Boundaries

- HTTPS before authentication.
- Staging remains invitation-only and non-publicly announced.
- Founder Company Control remains server-authorized.
- RLS is the primary database isolation boundary; the anonymous key is not authorization.
- Access/refresh tokens remain HTTP-only cookies.
- Preview builds must not receive staging secrets by default.
- Logs and screenshots must exclude tokens, invitation links, personal data, and environment values.
- Security-header acceptance is required before external staging access.
- No production domain, DNS, Microsoft, or DKIM change belongs to this architecture phase.

## Acceptance Evidence

A staging environment is accepted only when the checklist records:

- approved plan/cost/region;
- exact commit and successful CI/build;
- project ownership and MFA;
- migration replay and RLS results;
- callback and recovery behavior;
- secure-cookie and HTTPS evidence;
- fictional full founder journey;
- provider log review;
- rollback and reset rehearsal;
- no real data and no production dependency.
