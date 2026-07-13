# Staging Environment Variables

> Purpose: Define every application environment variable required for isolated staging without recording any real value or secret.

## Rules

- Configure variables only in the approved staging project.
- Never copy local, preview, or production values into staging.
- Never commit a real `.env` file, token, password, recovery code, or provider credential.
- `NEXT_PUBLIC_*` values are embedded in browser assets and are not secret.
- A Supabase anonymous/publishable key is browser-safe only when RLS is correctly enabled and verified.
- Do not add a privileged Supabase administrator credential; the application does not require one.

## Required Inventory

| Variable | Required staging form | Exposure | Classification | Source/owner | Scope | Rotation or rollback |
| --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_DATA_ACCESS_MODE` | Literal `supabase` | Browser | Public; Founder Managed | Founder / Engineering | Staging only | Set deployment back to disabled/remove project if rollback is required. Never use `memory-demo` for accepted staging. |
| `NEXT_PUBLIC_APP_URL` | Exact HTTPS staging origin, no trailing slash | Browser | Public; Founder Managed | Approved Vercel staging URL | Staging only | Restore previous staging URL and redeploy; update Supabase allow-list in the same controlled change. |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging project API URL | Browser | Public; Provider Generated | Supabase staging project | Staging only | Replace only after project/key rotation; redeploy and retest callbacks. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging publishable/anonymous key | Browser | Public; Provider Generated | Supabase staging project | Staging only | Rotate in Supabase, update Vercel, redeploy, invalidate prior key, rerun RLS tests. |
| `SUPABASE_URL` | Same staging project API URL | Server | Server; Provider Generated | Supabase staging project | Staging only | Keep aligned with the public URL; remove during project rollback. |
| `SUPABASE_ANON_KEY` | Same staging publishable/anonymous key | Server | Server; Provider Generated | Supabase staging project | Staging only | Rotate with the browser key; it is not an administrator credential. |
| `COMPANY_CONTROL_FOUNDER_EMAIL` | Approved staging founder identity | Server | Confidential; Founder Managed | Founder | Staging only | Change only with verified founder access and a recovery plan. Never expose in client code. |

## Provider-Controlled Runtime Values

`NODE_ENV=production` is expected to be set by the hosting platform for deployed builds. It controls secure cookie behavior and must be verified at runtime; it should not be manually overridden unless the provider requires it.

Vercel system variables may exist automatically, but the application must not depend on them in place of `NEXT_PUBLIC_APP_URL`.

## Explicitly Not Required

- Privileged Supabase administrator credential
- Direct PostgreSQL password or connection string
- OpenAI or other AI-provider key
- Microsoft Graph, Exchange, SMTP, or DKIM credential
- Vercel access token in application runtime
- GitHub token in application runtime
- Storage bucket credential
- Monitoring, analytics, or support-provider token

Adding any of these requires a separate design and security review.

## Environment Matrix

| Boundary | Development | Staging | Production |
| --- | --- | --- | --- |
| Host | Local machine | New approved Vercel project/environment | Future, not created in this sprint |
| Supabase project | Local Supabase | New staging-only project | Future independent project |
| Auth users | Fictional local users | Fictional acceptance users only | Future real invited users |
| Variables | Local uncommitted values | Vercel staging scope | Future production scope |
| Callback origin | `localhost` / `127.0.0.1` | Exact staging HTTPS origin | Future production HTTPS origin |
| Founder identity | Local fictional/configured value | Approved staging identity | Future production identity |
| Data | Fictional | Fictional only | Future approved private-beta data |

## Pre-Deployment Verification

- [ ] All seven required variables exist in staging scope.
- [ ] No value is shared with local development or production.
- [ ] `NEXT_PUBLIC_DATA_ACCESS_MODE` is exactly `supabase`.
- [ ] Both Supabase URLs refer to the staging project.
- [ ] Both anonymous keys are the current staging publishable key.
- [ ] No privileged Supabase administrator credential is present.
- [ ] The application URL uses HTTPS and matches the deployed origin.
- [ ] The founder email is server-only.
- [ ] Preview deployments do not inherit staging secrets unless explicitly approved.
- [ ] Build logs and client bundles reveal no server-only variable value.

## Rollback

Disable the Vercel deployment, revoke/rotate staging project keys, remove the variables from the staging project, and preserve only variable names and change evidence. Do not paste old values into tickets, Git history, screenshots, or rollback reports.
