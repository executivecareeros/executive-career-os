# Open Setup Items

> Purpose: Maintain the authoritative prioritized queue of incomplete access, environment, provider, security, and readiness work.

Target dates are not inferred. **Founder to Set** means no approved deadline exists.

## Critical

| Item | Owner | Blocker | Next action | Dependency | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Confirm Supabase staging dashboard health and first backup state | Founder / Database Owner | Automated dashboard session lacks project access; earlier record showed provisioning | Verify database, Auth, Storage, REST, dashboard, plan, and backup from the owning account; record metadata only | Supabase owner access | Before migrations | Open |
| Verify founder recovery controls for Porkbun, GitHub, Vercel, Supabase, Microsoft, OpenAI, and password manager | Founder / Security | MFA, passkeys, backup factors, recovery material, and backup owners are not evidenced | Conduct provider-by-provider access review without recording secrets | Trusted founder device | Before staging secrets/deployment | Open |
| Apply and validate staging migrations | Founder / Database Owner | Health and explicit migration approval | Replay ten migrations in order; exclude seed; run RLS/database validation | Healthy Supabase staging project | Founder to Set | Not Started |
| Configure staging variables and Supabase Auth callbacks | Founder / Release Manager | Final Vercel hostname and explicit configuration approval | Add seven approved variable names/scopes and exact staging-only callback URLs without exposing values | Migrations and verified project access | Founder to Set | Not Started |
| Complete first staging deployment and acceptance | Founder / Release Manager | Variables, callbacks, migrations, security checks | Deploy once, smoke test full fictional journey, collect evidence, decide readiness | Prior critical items | Founder to Set | Not Started |

## High

| Item | Owner | Blocker | Next action | Dependency | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Resolve Microsoft DKIM support case | Founder / Microsoft Administrator | Microsoft backend publication and open case `2607130050001139` | Review Microsoft response; make no DNS change without controlled approval | Microsoft Support | Founder to Set | Open |
| Prove staging backup and restore | Founder / Database Owner | Healthy migrated database and first provider backup | Perform isolated restore/reset rehearsal and measure recovery | Staging migration completion | Before design partner | Not Started |
| Establish staging monitoring | Founder / Operations | No monitoring provider selected or configured | Approve minimal provider/manual signals, ownership, retention, and alert path | First deployment | Before design partner | Not Started |
| Verify GitHub protection and organization security | Founder / Engineering | Repository remains under `executivecareeros`; settings unverified | Review visibility, branch protection, 2FA, owners, Dependabot, secret scanning, GitHub App scope | Founder account access | Before external beta | Open |
| Reconcile email routing and legacy Proton state | Founder / Infrastructure | Microsoft DKIM incomplete; DNS cutover not accepted | Inventory current DNS and Proton account/subscription after Microsoft remediation | DKIM resolution | Founder to Set | Blocked |

## Medium

| Item | Owner | Blocker | Next action | Dependency | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Verify invoices, renewals, tax, auto-renewal, and spend controls | Founder / FinOps | Provider billing portals not reviewed in this task | Review Porkbun, Microsoft, Vercel, Supabase, OpenAI invoices and alerts | Founder billing access | Month end | Open |
| Select staging hostname | Founder / Release Manager | No deployment URL yet; DNS changes excluded | Prefer provider-generated hostname for first acceptance or separately approve custom hostname | First deployment | Founder to Set | Open |
| Assign backup administrative authority | Founder | Single-founder governance | Designate a trusted backup owner with least privilege and documented activation rules | Company governance decision | Founder to Set | Open |
| Reconcile stale asset and recovery records | Founder Operations | Older records intentionally preserved | Update their current-state summaries to point to this register without deleting history | Register approval | Next documentation review | Open |
| Complete legal and privacy readiness | Founder / Legal | No legal provider, entity, or final trademark clearance evidenced | Obtain qualified advice and define private-beta documents/ownership | Founder decision | Before design partners | Open |

## Low

| Item | Owner | Blocker | Next action | Dependency | Target | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Decide monitoring/analytics vendors | Founder / Product / Privacy | Product need and privacy basis not approved | Compare only when staging signals require external tooling | Staging acceptance evidence | Founder to Set | Deferred |
| Decide Meta/WhatsApp operational use | Founder | No approved use case | Keep unconfigured unless a justified notification workflow is approved | Future operations design | Future | Deferred |
| Review repository transfer to `Orendalis` | Founder | Transfer not approved; governance controls incomplete | Prepare separate reversible transfer plan | GitHub security review | Future | Deferred |

