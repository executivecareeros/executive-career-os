# Executive Career OS

## Go-Live and Private Beta Playbook

### From Domain Selection to First Private Beta Invitation

> Purpose: Give Cüneyt a safe, beginner-friendly sequence for taking Executive Career OS from local development to a small, invitation-only private beta.

**Document status:** Living operational playbook  
**Owner:** Cüneyt Şen  
**Completion status:** Not started  
**Last reviewed:** [DATE]  
**Important:** This playbook does not deploy, purchase, or configure anything. Never paste credentials into public chat, documents, GitHub, or screenshots.

---

## 1. Executive Summary

### What “going live” means

Going live means placing the application on internet-accessible production services, connecting a domain, configuring a real production database and authentication, and accepting real users under clear privacy, security, support, and legal conditions.

- **Local development:** Runs on your computer. Safe for development and fictional test data.
- **Staging:** Private internet-hosted copy for realistic testing. It must not contain casual copies of production data.
- **Production:** The real service used by invited executives. Production contains sensitive career and compensation data.

### What must be ready before beta invitations

- Authentication, email verification, recovery, logout, and session refresh work on HTTPS.
- Production Supabase migrations, RLS, isolation, and backups are verified.
- The domain, professional email, support path, monitoring, privacy notice, beta terms, deletion process, and rollback plan exist.
- A complete test account has passed the beta test plan.
- The founder can pause invitations and respond to incidents.

### What may remain incomplete in private beta

Advanced analytics, polished marketing, billing, broad integrations, automation, public self-service onboarding, and full-scale support can remain incomplete if limitations are clearly stated. Security, privacy, RLS, backups, authentication, consent, and support cannot be deferred.

### Why private beta is different

A private beta is invitation-only, small, founder-supported, explicitly unfinished, and designed for learning. It is not a public launch and does not remove legal or privacy obligations.

### Recommended sequence

Name research → domain and account security → professional email → production projects → migrations and environment variables → authentication and DNS → legal/security/monitoring → end-to-end testing → Go/No-Go → 10–20 invitations.

### One-page summary checklist

- [ ] **Owner:** [NAME] **Status:** [ ] Naming candidates documented. *(1–3 days; no purchase required)*
- [ ] Preliminary domain, company-name, and trademark checks completed. *(2–6 hours; lawyer later)*
- [ ] Domain purchased securely with MFA, lock, privacy, and renewal recorded. *(1–2 hours; low annual cost)*
- [ ] Professional mailbox and SPF/DKIM/DMARC configured. *(2–6 hours; low monthly cost)*
- [ ] GitHub ownership, branch, remote, clean tree, and secret hygiene verified. *(1–2 hours)*
- [ ] Production Vercel and Supabase projects created under founder control. *(2–4 hours; free tier may be possible)*
- [ ] Seven migrations applied in order and production seed decision reviewed. *(1–2 hours)*
- [ ] Production environment variables configured without committing secrets. *(30–60 minutes)*
- [ ] Auth URLs, redirects, verification, reset, logout, refresh, and provisioning tested. *(2–4 hours)*
- [ ] Domain, DNS, root/www redirect, HTTPS, and SSL verified. *(1–24 hours including propagation)*
- [ ] Privacy, beta terms, cookie position, support, deletion, and export processes reviewed. *(professional-service cost likely)*
- [ ] Monitoring, error reporting, uptime checks, and privacy-safe analytics configured. *(2–4 hours)*
- [ ] All ten beta test scripts passed and evidence saved. *(1–2 days)*
- [ ] Rollback and incident contacts confirmed. *(1–2 hours)*
- [ ] Go/No-Go gate has no prohibited Red status. *(1 hour)*
- [ ] First 10–20 participants selected and invitations sent manually. *(2–4 hours)*

> **Stop and verify:** Do not invite anyone until authentication, RLS, workspace isolation, backups, privacy, and recovery are Green.

---

## 2. Current Platform Inventory

| Item | Evidence-based status | Private beta | Public launch | Next action |
|---|---|---:|---:|---|
| GitHub source control | Repository exists; remote/push status needs verification | Required | Required | Verify ownership and branch |
| Next.js frontend | Implemented; Vercel production not verified | Required | Required | Configure project root `frontend` |
| Supabase PostgreSQL | Local schema and runtime tests implemented | Required | Required | Create and test production project |
| Supabase Auth | Application flow implemented; production redirects/email need configuration | Required | Required | Configure and test |
| RLS/workspace isolation | Local runtime-tested | Required | Required | Repeat against production |
| Domain and DNS | Needs research and purchase | Required | Required | Select registrar/domain |
| Professional email | Needs purchase/configuration | Required | Required | Select provider |
| Transactional auth email | Needs production configuration and verification | Required | Required | Select/configure sender |
| Error monitoring | Not evidenced in repository | Required | Required | Choose minimum provider |
| Product analytics | Not evidenced; optional if manual beta | Optional | Recommended | Use privacy-safe events only |
| Uptime monitoring | Not evidenced | Recommended | Required | Configure external check |
| Legal/privacy pages | Strategic docs exist; production pages/lawyer review need verification | Required | Required | Draft and obtain review |
| Private beta onboarding | Product flow exists; live test required | Required | Required | Run Script A |
| Billing | Not implemented | Not required | Required before paid launch | Defer |

---

## 3. Company and Product Naming

Keep five concepts separate:

1. **Legal company name:** Name registered with the chosen jurisdiction.
2. **Public company brand:** Name customers and partners recognize.
3. **Product name:** Currently “Executive Career OS.”
4. **Intelligence-engine name:** Currently “Atlas.”
5. **Domain name:** Internet address; it may differ from the legal name.

### Naming evaluation worksheet

Score each criterion 1–5. Do not select a winner until preliminary legal and domain checks are complete.

| Candidate | Pronunciation | Global suitability | Spelling | Memorability | Premium tone | Domain | Trademark risk | Search conflicts | Language risk | Expandability | Total /50 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [CANDIDATE A] | | | | | | | | | | | |
| [CANDIDATE B] | | | | | | | | | | | |
| [CANDIDATE C] | | | | | | | | | | | |

Also check social handles, app stores, GitHub organizations, LinkedIn company names, similarity to software businesses, negative meanings in major target languages, and whether the name can serve future non-executive products.

> **Stop and verify:** A memorable available domain is not proof that a brand is legally safe.

---

## 4. Domain-Name Research

**Estimated time:** 3–8 hours per shortlist  
**Owner:** [FOUNDER/ADVISOR]  
**Cost:** Usually free for research; professional-service cost for legal clearance  
**Status:** [ ]

For every candidate:

1. Search exact `.com`, relevant country extensions, `.ai`, `.io`, and `.co` at reputable registrars.
2. Check likely misspellings, plural/singular variants, hyphens, and defensive domains.
3. Confirm the address works naturally as `founder@[DOMAIN]` and `support@[DOMAIN]`.
4. Use ICANN Lookup or an official RDAP service to inspect registration status without trusting a sales page alone.
5. Open any existing site. Record whether it is active, parked, redirected, or offered for sale.
6. Search exact and similar terms in major search engines.
7. Search relevant Turkish, UK, EU, and possible future company registries.
8. Search official trademark databases such as TÜRKPATENT, UK IPO, EUIPO, WIPO Global Brand Database, and USPTO where relevant.
9. Search Apple App Store, Google Play, GitHub, LinkedIn, and major social platforms.
10. Record evidence links, date, jurisdiction, classes, and unresolved similarities.

### Domain due-diligence checklist

- [ ] Exact domain and main extensions checked.
- [ ] Renewal—not only first-year—pricing recorded.
- [ ] RDAP/WHOIS status checked.
- [ ] Existing website and archive/search usage reviewed.
- [ ] Company registries checked preliminarily.
- [ ] Trademark databases checked preliminarily.
- [ ] App stores, GitHub, LinkedIn, and social handles checked.
- [ ] Language and pronunciation review completed.
- [ ] Confusingly similar software names recorded.
- [ ] Lawyer review scheduled before significant brand investment.

**This is not legal advice. Domain availability does not mean trademark availability. Company-name registration does not automatically provide trademark protection. Consult a qualified trademark lawyer before significant brand investment.**

---

## 5. Domain Registrar Comparison

Check current official pricing before purchase. Pricing, availability, and Türkiye support can change.

| Registrar | First/renewal/transfer price | Privacy | DNSSEC/security | Support/upselling | Türkiye/global SaaS check |
|---|---|---|---|---|---|
| Cloudflare Registrar | Check current official pricing before purchase | Verify by TLD | Strong DNS integration; verify MFA/passkeys | Limited retail upselling; support depends on plan | Verify registrant/billing compatibility |
| Porkbun | Check current official pricing before purchase | Verify by TLD | Verify DNSSEC, MFA, recovery | Review current support and transfer process | Verify Türkiye billing and legal-entity support |
| Namecheap | Check current official pricing before purchase | Verify by TLD | Verify DNSSEC, MFA/passkeys | Review renewal and upsells carefully | Verify Türkiye availability/invoices |
| GoDaddy | Comparison reference only; check all prices | Verify by TLD | Verify current MFA/DNSSEC | Review upsells, renewal, and transfer terms | Verify local billing support |
| Gandi or OVHcloud | Check current official pricing before purchase | Verify by TLD | Review DNSSEC/account controls | European/global option; compare support | Verify Türkiye and company documentation |

### Decision method

Weight renewal price 20%, security 25%, DNS reliability 15%, ownership/billing compatibility 15%, support 15%, and transfer ease 10%. Record evidence from official pages on [DATE]. Do not select on introductory price alone.

---

## 6. Buying the Domain

**Time:** 45–90 minutes plus research  
**Cost:** Low annual cost; verify current pricing  
**Reversible:** Transferable later, but brand choice is costly to reverse

1. [ ] Create the registrar account with a founder-controlled company email where possible.
2. [ ] Enable MFA before purchase; prefer passkey or authenticator over SMS.
3. [ ] Store recovery codes in the password manager and an offline secure backup.
4. [ ] Search the exact approved domain.
5. [ ] Confirm renewal and transfer pricing.
6. [ ] Confirm privacy protection and registrant requirements.
7. [ ] Enter accurate registrant and billing details.
8. [ ] Purchase an appropriate term; avoid speculative extras.
9. [ ] Enable auto-renew and record the renewal date.
10. [ ] Enable registrar lock.
11. [ ] Enable DNSSEC when supported and compatible with the DNS setup.
12. [ ] Save invoice and purchase confirmation.
13. [ ] Record the asset below and add a backup payment method if appropriate.
14. [ ] Never share registrar credentials casually.

### Domain Asset Register

| Domain | Registrar | Purchase | Renewal | Account owner | Billing email | Technical contact | Recovery method | DNS provider/nameservers | Lock/DNSSEC |
|---|---|---|---|---|---|---|---|---|---|
| [DOMAIN] | | | | | | | | | |

> **Stop and verify:** Sign out, sign back in with MFA, confirm the domain appears, lock is active, invoice is saved, and recovery codes are accessible.

---

## 7. Company Email

- **Forwarding:** Redirects mail but may not provide a real mailbox or reliable sending.
- **Founder mailbox:** Human correspondence, e.g. `founder@[DOMAIN]`.
- **Support mailbox:** User help, e.g. `support@[DOMAIN]`.
- **Transactional email:** Automated verification/reset messages; separate from normal mailbox service.
- **Authentication email:** Transactional subset sent by or for Supabase Auth.
- **Marketing email:** Consent-based campaigns with separate compliance and reputation needs.

Recommended addresses: `founder@`, `hello@`, `support@`, `privacy@`, `security@`, `legal@`, `beta@`, and `no-reply@` (automated messages only).

Google Workspace and Microsoft 365 both provide professional mailboxes, calendars, administration, and security. Compare official current pricing, founder familiarity, data region/contract needs, support, MFA/passkeys, and future team administration. A paid mailbox is not automatically a legal requirement, but professional domain email improves control and trust.

**SPF** declares permitted senders. **DKIM** cryptographically signs outgoing mail. **DMARC** tells receivers how to handle failures and reports abuse. Configure all three using provider-issued DNS values; never invent records.

### Email DNS checklist

- [ ] Mailbox provider domain verification TXT record added.
- [ ] MX records match provider instructions.
- [ ] One valid SPF record includes all authorized senders.
- [ ] DKIM enabled and verified.
- [ ] DMARC begins with a monitored policy appropriate to current readiness.
- [ ] Test mail passes SPF, DKIM, and DMARC.
- [ ] Founder, support, privacy, security, and beta addresses tested.
- [ ] Transactional sender separated and verified.

---

## 8. Account Ownership and Security

For GitHub, Vercel, Supabase, registrar, DNS, email, analytics, error monitoring, transactional email, and any future payment provider:

- [ ] Founder-controlled owner account and company billing details.
- [ ] Unique password stored in a password manager.
- [ ] MFA/passkey enabled; recovery codes stored safely.
- [ ] Backup administrator where appropriate; no shared passwords.
- [ ] Least-privilege team roles and quarterly access review.
- [ ] Production secrets stored only in approved secret settings, never GitHub.

### Account and Access Register

| Service | Owner email | Backup admin | MFA | Recovery location | Billing owner | Access roles | Last review |
|---|---|---|---|---|---|---|---|
| GitHub | | | | | | | |
| Vercel | | | | | | | |
| Supabase | | | | | | | |
| Registrar/DNS | | | | | | | |
| Email/monitoring/analytics | | | | | | | |

---

## 9. Environments

| Environment | URL | Vercel project | Supabase/database | Auth config | Variables | Data | Access | Purpose |
|---|---|---|---|---|---|---|---|---|
| Local | `http://localhost:3000` | None | Local Supabase | Local redirects | Local untracked file | Fictional only | Developers | Build/test |
| Staging | `[STAGING_URL]` | `[STAGING_PROJECT]` | Separate staging project | Staging URLs | Vercel Preview/Staging | Fictional/synthetic | Founder/testers | Realistic verification |
| Production | `https://[DOMAIN]` | `[PRODUCTION_PROJECT]` | Separate production project | Production URLs | Vercel Production | Real invited-user data | Approved operators/users | Private beta |

Development is the ongoing code-change process; local and staging are places where development is tested. Never casually copy production data into staging or local systems. Use fictional or carefully anonymized data with explicit approval. Demo seed records must remain in explicitly fictional workspaces and must never appear as real user records.

> **Recommended private beta:** Separate production Vercel and Supabase projects; a staging Vercel/Supabase pair is strongly recommended before public or paid launch.

---

## 10. GitHub Preparation

**Where:** Terminal in repository root and GitHub repository Settings  
**Time:** 1–2 hours  
**Status:** [ ]

Safe inspection commands:

```bash
git status
git log --oneline -10
git remote -v
git branch --show-current
```

- [ ] Repository visibility and owner verified; private is recommended during private beta.
- [ ] Correct default and deployment branch identified.
- [ ] Working tree clean and latest approved commits pushed.
- [ ] Remote URLs contain no credentials.
- [ ] Branch protection considered for the deployment branch.
- [ ] `.env` files ignored and no production secret committed.
- [ ] Repository secret scan completed using an approved tool/process.
- [ ] README and deployment ownership updated.
- [ ] Release tag considered after final Go decision.
- [ ] Encrypted backup/archive or secondary owner access confirmed.

> **Stop and verify:** Do not deploy an unreviewed branch or a repository containing credentials.

---

## 11. Vercel Production Deployment

**Where:** Vercel dashboard and GitHub  
**Time:** 1–3 hours  
**Cost:** Free tier possible; verify limits and current pricing  
**Owner/Status:** [OWNER] / [ ]

1. Sign in with the founder-controlled Vercel account and enable MFA.
2. Choose **Add New → Project**, connect GitHub, and authorize only the required repository.
3. Select `executive-career-os` and set **Root Directory** to `frontend`.
4. Confirm Next.js framework detection.
5. Build command should normally be `npm run build`; install command should normally be `npm install`. Verify in `frontend/package.json` before saving.
6. Do not set a custom output directory unless current Next.js/Vercel guidance requires it.
7. Add verified environment variables under the correct Production/Preview scope.
8. Deploy a Preview first. Inspect every build and TypeScript log.
9. Test Preview using staging services—never production secrets in an untrusted preview.
10. When approved, deploy/promote the selected commit to Production.
11. Add `[DOMAIN]` and optionally `www.[DOMAIN]` in Project → Domains.
12. Add exactly the DNS records Vercel displays.
13. Confirm HTTPS certificate issuance and browser lock indicator.
14. Select root or `www` as canonical and configure the other to redirect.

### Troubleshooting

| Symptom | Check |
|---|---|
| 404 | Root Directory is `frontend`; deployment contains App Router routes |
| Build failed | Build log, Node compatibility, network font fetch, install status |
| Configuration error | Environment name/value/scope; redeploy after changes |
| Supabase failure | Production URL/key, mode `supabase`, network, project status |
| Auth redirect failure | Supabase Site URL and allowed redirects match HTTPS domain exactly |
| Stale deployment | Confirm commit hash, deployment branch, cache/redeploy status |
| Domain pending | DNS value, duplicate records, propagation, nameserver authority |

> **Stop and verify:** Save the production deployment URL, commit hash, build log, and test results before connecting invitations.

---

## 12. Supabase Production Setup

**Where:** Supabase dashboard and repository root terminal  
**Time:** 2–5 hours  
**Cost:** Free tier possible; safer beta may require a paid plan/backups  
**Status:** [ ]

1. Create a new **production** project under the founder-controlled organization.
2. Choose a region based on expected users, latency, data-transfer, and legal advice; changing later may require migration.
3. Record project reference, region, owner, and plan—never keys in this playbook.
4. Enable MFA and review organization/project roles.
5. Review all seven migration files in `supabase/migrations/`.
6. Link the Supabase CLI only after confirming the target project reference. Follow current official Supabase instructions.
7. Apply migrations in filename order. Repository-supported local verification uses `npx supabase db reset`; production deployment must use the current official remote migration workflow, not a destructive reset.
8. Do not run `supabase/seed.sql` in production until its fictional demo-workspace impact has been explicitly approved. Never mix demo data into real user workspaces.
9. Verify 52 expected public tables, 133 policies, 11 triggers, and 3 security-definer helpers against the current repository baseline; investigate any difference.
10. Confirm RLS is enabled on every exposed table.
11. Create fictional production test accounts, then run workspace isolation tests.
12. Verify compensation permission, invited/inactive denial, no-membership denial, and anonymous denial.
13. Verify append-only protections and workspace-integrity foreign keys.
14. Verify backup schedule, retention, restore options, point-in-time recovery availability, usage limits, and alert thresholds.

Repository-supported local commands:

```bash
npx supabase start
npx supabase db reset
npm --prefix frontend run validate:database
npm --prefix frontend run test:database
npm --prefix frontend run test:rls
```

Use placeholders only: `[SUPABASE_URL]`, `[SUPABASE_PUBLISHABLE_KEY]`, `[SERVER_ONLY_SECRET_IF_REQUIRED]`.

> **Warning:** The publishable/anonymous key is designed for browser use with RLS. A service-role or other privileged secret is server-only and is not currently required by the documented frontend. Never prefix secrets with `NEXT_PUBLIC_`.

---

## 13. Environment Variables

Verified against `frontend/.env.example` and repository configuration:

| Variable | Purpose | Exposure | Environments | Obtain/store | Vercel | Commit? |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_DATA_ACCESS_MODE` | `memory-demo` or durable `supabase` mode | Browser-safe | All | Set explicitly in local/Vercel | Yes | Name/example only |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL | Browser-safe | Local/staging/production | Supabase project settings; Vercel scoped variable | Yes | Never real value |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anonymous API key used with RLS | Browser-safe but controlled | Local/staging/production | Supabase API settings; Vercel scoped variable | Yes | Never real value |
| `SUPABASE_URL` | Optional server-side alias | Server-only configuration | Staging/production if used | Supabase settings; Vercel secret settings | Yes, server scope | Never |
| `SUPABASE_ANON_KEY` | Optional server-side alias of publishable key | Server-side | Staging/production if used | Supabase settings; Vercel secret settings | Yes | Never |

No other environment-variable names are evidenced by the repository. Verify the repository again before deployment. A future `[SERVER_ONLY_SECRET_IF_REQUIRED]` must not be added unless an implemented server feature requires it.

- Local: copy the example to an ignored local environment file and keep it private.
- Vercel: Project → Settings → Environment Variables; set Preview and Production separately.
- After any variable change, redeploy and retest.

> **Stop and verify:** Search the Git history and deployment logs for accidental values before inviting users.

---

## 14. Authentication Configuration

**Where:** Supabase Authentication URL/Email settings, Vercel environment settings, production browser  
**Time:** 2–4 hours

Set production Site URL to `https://[DOMAIN]`. Add only required redirects, for example:

- `https://[DOMAIN]/login`
- `https://[DOMAIN]/reset-password`
- `https://[STAGING_DOMAIN]/login`
- `https://[STAGING_DOMAIN]/reset-password`
- Localhost URLs only for local development

Test and record:

- [ ] Registration with email/password.
- [ ] Verification email arrives and redirects to HTTPS production.
- [ ] Unverified behavior matches policy.
- [ ] Login and Remember Me.
- [ ] Protected route redirects when signed out.
- [ ] Forgotten-password email and single-use reset flow.
- [ ] Logout revokes/clears session.
- [ ] Access-token refresh after expiry.
- [ ] Cookies are HTTP-only, secure in production, same-site, and scoped correctly.
- [ ] Atlas Promise acceptance and onboarding.
- [ ] Identity, personal Workspace, Owner membership, settings, empty Blueprint/Ledger context, and Atlas context created.
- [ ] Repeating provisioning returns the existing Workspace rather than duplicating it.

> **Stop and verify:** Localhost must not be the only redirect. Do not invite users while verification or recovery links point to localhost or preview domains.

---

## 15. Custom Domain and DNS

### Terms

- **Nameservers:** Identify which provider controls DNS records.
- **A record:** Points a name to an IPv4 address.
- **CNAME:** Points a subdomain to another hostname.
- **Apex/root:** Bare domain, e.g. `[DOMAIN]`.
- **TXT:** Text used for verification, email security, and other proofs.
- **TTL:** How long resolvers cache a record.
- **Propagation:** Time for changed DNS information to be observed globally.

### Approach A: Keep DNS with registrar or Cloudflare

Add the exact A/CNAME/TXT records Vercel displays. Benefits: centralized DNS/email control and provider flexibility. Trade-off: you must coordinate two dashboards and avoid proxy settings that conflict with verification.

### Approach B: Delegate DNS to Vercel

Replace nameservers with those Vercel provides. Benefits: simpler Vercel domain setup. Trade-off: DNS administration moves to the hosting provider and email records must also be recreated there.

### Steps

1. Add root and `www` domains in Vercel.
2. Copy—not guess—the displayed DNS records.
3. Add records at the authoritative DNS provider.
4. Remove only confirmed conflicting records; preserve email records.
5. Wait for propagation. Do not repeatedly change correct records.
6. Verify DNS with public lookup tools and Vercel.
7. Confirm SSL issuance, HTTPS redirect, and canonical root/`www` behavior.

### DNS Record Worksheet

| Host | Type | Value/target | TTL | Purpose | Source of instruction | Verified at |
|---|---|---|---|---|---|---|
| `@` | [A/ALIAS] | [VERCEL VALUE] | [TTL] | Production app | Vercel | |
| `www` | CNAME | [VERCEL VALUE] | [TTL] | Web alias | Vercel | |
| [HOST] | TXT | [VERIFICATION] | [TTL] | Ownership | Provider | |

---

## 16. Legal and Privacy Readiness

**This is an operational checklist, not legal advice. A qualified lawyer should review final policies before public launch. Private beta does not remove privacy obligations. Real compensation and career-history data are sensitive.**

- [ ] Privacy Policy and Terms of Service.
- [ ] Cookie Policy or documented no-nonessential-cookie position.
- [ ] Clear data-processing and Atlas limitation statements.
- [ ] Professional-history import consent and source-file retention language.
- [ ] Career Ledger ownership, correction, export, deletion, and retention processes.
- [ ] Compensation sensitivity and restricted-access explanation.
- [ ] Support, privacy, security, and legal contacts.
- [ ] Responsible-intelligence principles and human-final-decision statement.
- [ ] No financial/legal advice statement where relevant.
- [ ] Beta disclaimer, age eligibility, and future under-18 handling.
- [ ] GDPR, Turkish KVKK, international transfer, lawful basis, processor/subprocessor, consent, and withdrawal review.

### Discuss with a lawyer and accountant

Compare—without assuming the answer—a Türkiye company, UK limited company, US Delaware corporation, and possible EU establishment. Discuss founder and IP agreements, tax residence, permanent establishment, VAT/digital-service obligations, SaaS contracts, fundraising expectations, payroll, banking, data-processing roles, cross-border transfers, and trademark ownership. Do not choose a jurisdiction from a checklist alone.

Save written professional advice, assumptions, jurisdiction, date, and owner. Legal and tax conclusions are not interchangeable.

---

## 17. Security Readiness

| Control | Private beta | Public beta | Paid launch | Future |
|---|---:|---:|---:|---:|
| MFA, password manager, recovery codes | Required | Required | Required | |
| Secret scan and scoped production variables | Required | Required | Required | |
| Runtime RLS/cross-workspace/anonymous tests | Required | Required | Required | |
| Append-only protections and audit review | Required | Required | Required | |
| HTTPS and auth redirects | Required | Required | Required | |
| Upload type/5 MB limit; no raw-content logs | Required | Required | Required | |
| Backup status and restore procedure | Required | Required | Required | |
| Rate limiting and abuse-protection assessment | Required | Required | Required | Enhance continuously |
| Incident contact and founder recovery plan | Required | Required | Required | |
| Dependency audit and browser-console review | Required | Required | Required | Continuous |
| Error monitoring | Required | Required | Required | |
| Vulnerability-reporting process | Recommended | Required | Required | |
| Malware scanning for retained uploads | Document limitation | Required if retention enabled | Required | Enhance |

> **No-Go:** Any suspected cross-user exposure, missing RLS evidence, exposed secret, broken backup, or insecure authentication.

---

## 18. Monitoring and Analytics

Options include Sentry for application errors, Vercel logs/analytics, Supabase logs, PostHog for product analytics, Plausible for privacy-focused web analytics, and Better Stack or a similar independent uptime service. Verify current official features, privacy terms, regions, and pricing.

### Minimum private-beta setup

1. Vercel deployment/function logs.
2. Supabase Auth/database logs and usage alerts.
3. Error monitoring with source-map and sensitive-data scrubbing reviewed.
4. Independent uptime check for the production URL and login page.
5. Manual founder issue register.
6. Analytics optional initially; if used, collect event names and non-sensitive identifiers only.

### Proposed privacy-safe events

`registration_completed`, `email_verified`, `onboarding_completed`, `atlas_promise_accepted`, `import_started`, `import_completed`, `blueprint_opened`, `first_executive_brief_viewed`, `opportunity_viewed`, `application_created`, `return_visit`, `feedback_submitted`.

Never include CV text, employer names, compensation, free-form notes, email addresses, career history, access tokens, or document content in analytics properties.

---

## 19. Transactional Email

Production needs reliable verification, password reset, beta invitation, and support responses. Product notifications can wait.

Compare current official offerings from providers such as Resend, Postmark, SendGrid, Mailgun, Amazon SES, and Supabase-supported SMTP options. Evaluate Türkiye availability, data-processing terms, sender verification, deliverability tools, support, pricing, and operational complexity. Do not purchase from this playbook.

Required preparation:

- Verify sending domain/subdomain.
- Configure provider-issued SPF and DKIM; align DMARC.
- Use a monitored reply/support address where appropriate.
- Separate transactional and future marketing streams.
- Monitor bounces, complaints, blocks, and sender reputation.
- Include unsubscribe controls for marketing and legally required notification classes; essential security messages have different treatment—obtain legal guidance.
- Test verification/reset links on major mail providers and mobile devices.

---

## 20. Private Beta Configuration

Recommended model:

- Invite-only; approximately 10–20 initial participants.
- Founder-led onboarding and manual monitoring.
- Clearly labelled private beta with limitations and feedback expectation.
- No public marketing campaign or unsupported automation claims.
- Dedicated support channel, issue register, consent record, export commitment, and deletion process.
- Prioritize trust and feedback quality over participant volume.

Suggested participants: executives personally known by the founder, senior directors/VPs, CEOs, CHROs, executive recruiters, executive coaches, and board members. Begin with people likely to provide candid feedback and respect confidentiality—not merely impressive titles.

---

## 21. Private Beta Test Plan

For every script record: **Tester:** [ ] **Date/build:** [ ] **Expected:** [ ] **Actual:** [ ] **Pass/Fail:** [ ] **Evidence link:** [ ] **Issue:** [ ]. Use fictional test data unless the participant has explicitly consented.

### Script A — New executive

1. Open `https://[DOMAIN]`; confirm HTTPS and beta label.
2. Create an account, receive verification email, and verify.
3. Log in, accept Atlas Promise, and complete onboarding.
4. Confirm exactly one Executive Identity, Personal Workspace, Owner membership, settings, Blueprint context, Ledger context, and Atlas context.
5. Import small fictional/manual career history, review/edit/reject, then confirm.
6. View Executive Brief and Blueprint; verify no unconfirmed record became permanent.
7. Log out and back in; confirm the same Workspace and records persist.

**Expected:** Complete flow succeeds without demo data appearing as user data or secrets appearing in console/network errors.

### Script B — Password recovery

Request reset, use the email once, choose a new password, sign in, confirm old password/link no longer works, and verify Workspace persistence. **Expected:** Secure single-user recovery with HTTPS production redirect.

### Script C — Empty Workspace

Create a new test user and complete onboarding without import. **Expected:** Empty states and setup guidance; no fictional opportunities, applications, compensation, memories, or history presented as owned data.

### Script D — Cross-Workspace Isolation

Create fictional User A/Workspace A and User B/Workspace B. Attempt representative reads/writes to the other workspace through supported UI/API contexts. **Expected:** Zero records returned or explicit authorization denial; no cross-workspace insert/update.

### Script E — Compensation Privacy

Use ordinary member and compensation-enabled member contexts. **Expected:** Ordinary user cannot read compensation; explicitly permitted user can read only their Workspace compensation; neither can access another Workspace.

### Script F — Mobile Device

On a physical iOS and Android device or approved browser device mode, test 390px-equivalent login, onboarding, import review, dashboard, navigation, tasks, logout, and recovery. **Expected:** No page-level horizontal overflow, inaccessible controls, hidden actions, or keyboard obstruction.

### Script G — Invalid File Upload

Try executable/unknown extension, PDF/DOCX, malformed JSON, malformed CSV, and over-5-MB file. **Expected:** Safe rejection or clearly stated preview-only status; no upload persistence, raw logging, crash, or misleading success.

### Script H — Account Deletion Request Process

Submit request to `[PRIVACY_EMAIL]`, authenticate requester, log request, explain scope/timeline, perform only approved documented process, and retain legally required audit evidence. **Expected:** Request acknowledged and tracked; no ad hoc database deletion.

### Script I — Data Export Request Process

Submit request, verify identity, compile Workspace-owned structured data using approved process, review for other-user data, deliver securely, and record completion. **Expected:** Portable, scoped export with no credentials or cross-user data.

### Script J — Production Failure and Rollback

Using a controlled staging simulation, identify last known-good frontend deployment, practice Vercel rollback, verify database compatibility, run smoke tests, and record communications. **Expected:** Service restored without destructive database commands or evidence loss.

> **Stop and verify:** Any isolation, compensation, authentication, or persistence failure is an immediate No-Go.

---

## 22. Release Checklist

### Seven days before beta

- [ ] Owner: [ ] Status: [ ] Freeze candidate build and verify commit.
- [ ] Confirm database backup and documented restore path.
- [ ] Review all environment variables and auth redirects.
- [ ] Run full test plan on staging; repeat RLS tests against production safely.
- [ ] Finalize legal pages, support/security mailboxes, monitoring, rollback plan.
- [ ] Confirm invite list, consent language, feedback form, and founder availability.

### Two days before beta

- [ ] Deploy approved production build and verify domain/HTTPS.
- [ ] Test verification and reset emails across major mail providers.
- [ ] Test desktop, tablet, iOS, Android, and supported browsers.
- [ ] Review Vercel/Supabase logs, database health, quotas, and backups.
- [ ] Complete Go/No-Go draft; resolve every Red.

### Launch day

- [ ] Confirm no unexpected deployment or migration occurred overnight.
- [ ] Run login, onboarding, import, persistence, logout, and recovery smoke test.
- [ ] Confirm monitoring and support inbox.
- [ ] Send invitations in a small first batch.
- [ ] Remain available; record every issue and pause invitations if needed.

### First seven days after launch

- [ ] Review errors, auth failures, database health, email bounces, and support daily.
- [ ] Check backups and invite only at a manageable pace.
- [ ] Hold founder feedback calls; anonymize research notes.
- [ ] Triage security/privacy first, then blockers, then usability.
- [ ] Send thank-you messages and publish no participant names without consent.

---

## 23. Rollback and Incident Plan

### General rule

Do not improvise destructive fixes. Pause invitations, preserve evidence, communicate accurately, assign an owner, and record a timeline.

| Incident | Immediate beginner-safe response |
|---|---|
| Bad frontend deployment | Pause invites; use Vercel to redeploy last known-good commit; smoke-test auth/data compatibility |
| Authentication failure | Pause registration; inspect Supabase Auth/Vercel logs and redirect settings; do not bypass auth |
| Database migration failure | Stop rollout; preserve logs; do not reset production; assess transaction state with a database professional |
| RLS issue | Disable affected feature/access, pause invitations, preserve logs, treat as potential data incident |
| Verification email issue | Pause new invites; verify SMTP/domain/redirects; support existing users manually without sharing credentials |
| Domain outage | Check authoritative DNS, registrar, Vercel status, SSL; avoid random record changes |
| Accidental secret exposure | Revoke/rotate affected credential, review logs/history, remove exposure without hiding evidence, assess impact |
| Upload security issue | Disable imports, preserve files/logs safely, assess exposure, do not open suspicious files |
| Supabase/Vercel outage | Confirm official status, post accurate support update, avoid risky migrations, monitor recovery |

### Suspected cross-user data exposure

1. Pause invitations.
2. Disable affected functionality.
3. Preserve logs; do not delete evidence.
4. Assess affected records, users, duration, and access path.
5. Consult security and legal professionals.
6. Notify affected individuals and authorities when legally required.

### Emergency contacts

| Role | Name | Primary | Backup | Authority |
|---|---|---|---|---|
| Incident lead | [NAME] | [CONTACT] | [CONTACT] | Pause service/invitations |
| Security advisor | [NAME] | [CONTACT] | | Technical containment |
| Legal/privacy counsel | [NAME] | [CONTACT] | | Notification/legal advice |
| Vercel/Supabase support | [PLAN/URL] | [CASE METHOD] | | Provider support |

---

## 24. Cost Planning

Always verify current official pricing and taxes before purchase.

| Cost | Category | Private-beta note |
|---|---|---|
| Domain | Low annual cost | Renewal and defensive domains matter |
| Professional email | Low monthly cost | Per-user pricing common |
| Vercel | Free tier possible / usage dependent | Verify commercial limits |
| Supabase | Free tier possible / moderate monthly cost | Backups and limits may justify paid plan |
| Monitoring/analytics | Free tier possible / usage dependent | Privacy terms matter |
| Transactional email | Usage dependent | Volume, deliverability, support |
| Legal, company formation, accounting, trademark | Professional-service cost | Obtain scoped quotes |
| Design/support/backups | Low to professional-service cost | Based on founder capacity |

### Lean private-beta budget

One domain, one mailbox plan, free/entry hosting and database tiers if limits/backups are acceptable, manual feedback, and scoped legal review. Risk: lower support and recovery capability.

### Safer private-beta budget

Paid database backup/recovery where required, error/uptime monitoring, reliable transactional email, multiple professional mailboxes/aliases, security consultation, and lawyer-reviewed beta policies.

### Public-launch considerations

Higher availability, support, legal coverage, paid monitoring, abuse protection, transactional-email scale, accounting/VAT, trademark work, accessibility review, penetration/security testing, and reliable backup/restore exercises.

---

## 25. Scalability

Vercel can scale stateless Next.js requests, while Supabase/PostgreSQL stores durable data. Growth constraints are more likely to appear in database connections, inefficient queries, storage, email, provider limits, and operational support than in page rendering alone.

Monitor query plans and indexes, connection counts/pooling, database size, auth/email rates, file storage, function duration, and errors. Add caching only for safe, well-understood read patterns. Introduce background jobs and queues when work is genuinely asynchronous; add read replicas only when measured read load requires them. Consider data regions and latency before international expansion.

Provider-independent repositories and migrations preserve future options, but migration away still requires careful data/export/auth planning. Do not prematurely add microservices, multi-region databases, custom queues, replicas, or complex caching before measured need. First optimize correctness, indexes, isolation, monitoring, and support.

---

## 26. Final Go/No-Go Gate

Status values: **Green** = tested/ready; **Amber** = accepted limitation with owner/date; **Red** = unsafe or unverified.

| Category | Status | Evidence | Owner | Decision/action |
|---|---|---|---|---|
| Product | | | | |
| Security | | | | |
| Privacy | | | | |
| Authentication | | | | |
| Database | | | | |
| Deployment | | | | |
| Domain/DNS/SSL | | | | |
| Email | | | | |
| Legal | | | | |
| Support | | | | |
| Monitoring | | | | |
| Beta participants | | | | |
| Rollback readiness | | | | |

**Rule:** Any Red in authentication, RLS, data isolation, secrets, privacy, or backups means **No-Go**. Amber requires a named owner, written risk acceptance, and resolution date. Record final decision, time, attendees, and build/commit.

---

## 27. Private Beta Invitation Messages

### Full email

**Subject: Private invitation: Help test Executive Career OS**

Hi [Name],

I hope you’re doing well.

I’ve been building a platform that I wish had existed throughout my own executive career.

It’s called Executive Career OS.

The goal is not to create another job board, résumé builder, or generic AI assistant. We are building a private operating system that helps executives preserve their professional history, understand their ambitions, evaluate opportunities, prepare for interviews, manage applications, compare compensation, and make better long-term career decisions.

We are now starting a small, invitation-only private beta with a limited group of executives and trusted professionals.

At this stage, I am trying to learn:

- Does the platform feel trustworthy?
- Is the onboarding clear?
- Does importing professional history create immediate value?
- Does the Executive Blueprint help clarify career direction?
- Are Atlas’s explanations understandable and useful?
- Which parts would make you return regularly?
- What feels confusing, unnecessary, or incomplete?
- Would you trust this platform with your long-term professional history?

I am not looking for praise. Honest and critical feedback will be much more valuable.

How to participate:

1. Visit: [PRIVATE_BETA_URL]
2. Select “Create account.”
3. Register using your email address.
4. Verify your email.
5. Accept the Atlas Promise.
6. Complete the short onboarding.
7. Import a small part of your professional history or enter it manually.
8. Review your Executive Brief, Blueprint, and Atlas workspace.
9. Send me your honest feedback using [FEEDBACK_METHOD].

Please remember that this is a private beta. Some areas are still under development, and you should not upload information you are not comfortable testing in an early-stage product.

**Estimated time:** 30–45 minutes for the first review.

Your feedback will directly influence what we build next.

Thank you for considering it.

Best regards,  
Cüneyt Şen  
Founder, Executive Career OS  
[FOUNDER_EMAIL]  
[PRIVATE_BETA_URL]

### Short email

**Subject: Private invitation: Executive Career OS beta**

Hi [Name], I’m inviting a small group to test Executive Career OS—a private platform for preserving career history and preparing important executive decisions. I would value candid feedback, not praise. The first review takes about 30–45 minutes. If you are comfortable joining an early private beta, visit [PRIVATE_BETA_URL] and share feedback through [FEEDBACK_METHOD]. Please avoid uploading anything you are not comfortable testing at this stage. Thank you, Cüneyt.

### WhatsApp/LinkedIn message

Hi [Name]—I’ve been building Executive Career OS, a private operating system for professional history, opportunity decisions, interview preparation, and long-term career intelligence. I’m starting a very small private beta and would value your honest, critical feedback. It takes around 30–45 minutes. Would you be open to trying it? I’ll send the private link and guidance if so.

### Follow-up reminder

**Subject: Gentle reminder: Executive Career OS private beta**

Hi [Name], a quick, no-pressure reminder about the private beta invitation. If you have 30–45 minutes, your candid feedback on trust, onboarding, and immediate usefulness would be extremely valuable. The link is [PRIVATE_BETA_URL]. If the timing is not right, no response is needed. Best, Cüneyt.

### Thank-you email

**Subject: Thank you for testing Executive Career OS**

Hi [Name], thank you for the time and candor you brought to the private beta. I have recorded your feedback and will use it to improve the product. I will not quote or identify you publicly without explicit permission. If you would like an export, deletion, or clarification about your test data, contact [PRIVACY_EMAIL]. Best regards, Cüneyt.

---

## 28. Cüneyt: Do These Steps in This Exact Order

For each action, update **Owner**, **Status**, and **Evidence saved**.

1. **Select company and product naming candidates.** Where: `company/strategy` worksheet. Success: 3–5 candidates. Evidence: scoring table. Risk: premature attachment. Advice: brand advisor optional. Money: no. Reversible: yes.
2. **Perform preliminary name and trademark checks.** Where: official registries/databases. Success: conflicts documented. Evidence: dated links/screenshots. Advice: trademark lawyer required before major investment. Money: research free; advice costs. Reversible: yes.
3. **Select the domain.** Where: founder decision log. Success: approved domain with rationale. Evidence: decision entry. Risk: trademark/domain mismatch. Advice: legal review recommended. Money: not yet. Reversible: costly later.
4. **Purchase the domain securely.** Where: selected registrar. Success: domain in founder account. Evidence: invoice/register. Money: yes. Reversible: transferable.
5. **Enable MFA and domain protections.** Where: registrar Security/DNS. Success: MFA, recovery, lock, auto-renew, DNSSEC decision. Evidence: register without codes. Money: usually no. Reversible: settings reversible.
6. **Create professional company email.** Where: chosen email provider/DNS. Success: founder/support/privacy/security mail work. Evidence: delivery/authentication test. Money: likely. Reversible: provider migration possible.
7. **Confirm GitHub repository status.** Where: repository/GitHub Settings. Success: clean approved branch pushed, owner/remote known, no secrets. Evidence: command output and scan report. Money: possibly no. Reversible: settings mostly reversible.
8. **Create production Vercel project.** Where: Vercel. Success: repository imported with root `frontend`. Evidence: project/settings link. Money: free tier possible. Reversible: yes.
9. **Create production Supabase project.** Where: Supabase. Success: region/project owner recorded. Evidence: project reference register, no keys. Advice: legal/privacy input on region. Money: free tier possible. Reversible: migration required later.
10. **Apply migrations.** Where: approved Supabase CLI workflow. Success: seven migrations applied in order. Evidence: migration/log output. Risk: wrong project or partial schema. Advice: database support if uncertain. Money: no direct cost. Reversible: not casually—never reset production.
11. **Verify production database controls.** Where: Supabase SQL/catalog and test process. Success: tables, RLS, triggers, helpers, indexes verified. Evidence: signed test report. Money: no. Reversible: fixes require reviewed migration.
12. **Configure environment variables.** Where: Vercel Project Settings. Success: exact five evidenced names scoped correctly. Evidence: names/scopes only, never values. Money: no. Reversible: yes with redeploy.
13. **Configure authentication redirects.** Where: Supabase Auth URL settings. Success: production/staging verification and reset links use HTTPS. Evidence: settings screenshot without secrets. Reversible: yes.
14. **Configure transactional email.** Where: provider and Supabase Auth. Success: verified sender, SPF/DKIM/DMARC, bounce path. Evidence: verification tests. Money: possible. Reversible: yes, migration affects deliverability.
15. **Connect domain.** Where: Vercel and authoritative DNS. Success: root/www resolve correctly. Evidence: DNS worksheet. Money: included with domain/hosting. Reversible: yes.
16. **Verify HTTPS.** Where: production browser/Vercel. Success: valid certificate and canonical redirect. Evidence: dated check. Reversible: configuration yes.
17. **Test registration and verification.** Where: production with fictional account. Success: verified account/session. Evidence: Script A. Money: email usage. Reversible: test account removable through approved process.
18. **Test onboarding and idempotent provisioning.** Where: production UI/database audit. Success: exactly one Workspace/context. Evidence: test report. Reversible: use fictional test data.
19. **Test professional-history import.** Where: production UI. Success: consent, review-before-save, valid/invalid file behavior. Evidence: Script G/results. Reversible: cancel/reject before save.
20. **Test persistence.** Where: logout/login flow. Success: same scoped records return. Evidence: Script A. Reversible: test records managed by approved process.
21. **Test RLS and cross-workspace isolation.** Where: controlled production test identities. Success: all denials/pass conditions. Evidence: signed matrix. Advice: security review recommended. Money: professional review possible. Reversible: policy fixes via migration.
22. **Test compensation privacy.** Where: permission test users. Success: restricted/allowed behavior exact. Evidence: Script E. Reversible: yes via permissions.
23. **Test password recovery.** Where: production email/browser. Success: secure reset and persistence. Evidence: Script B. Reversible: password can change again.
24. **Prepare legal and privacy pages.** Where: counsel and product website. Success: reviewed beta terms/privacy/contact/processes. Evidence: approved versions. Advice: lawyer required. Money: yes. Reversible: policies update with notice/consent requirements.
25. **Document export and deletion processes.** Where: operations register. Success: verified identity, scope, secure delivery/deletion workflow. Evidence: Scripts H/I. Advice: legal/privacy review. Money: possible. Reversible: deletion may not be.
26. **Configure monitoring and uptime.** Where: selected providers. Success: test error/alert reaches founder without sensitive payload. Evidence: alert test. Money: free tier possible. Reversible: yes.
27. **Run dependency, console, upload, and secret reviews.** Where: repository/staging/production browser. Success: no critical unresolved finding. Evidence: reports. Advice: security professional recommended. Money: possible. Reversible: fixes vary.
28. **Verify backups and practice restore planning.** Where: Supabase/dashboard/runbook. Success: backup timestamp/retention and restoration steps understood. Evidence: provider status and exercise record. Money: paid plan may be required. Reversible: settings yes.
29. **Prepare support and incident process.** Where: company email/issue register. Success: owner, contacts, response priorities, cross-user procedure. Evidence: tested mailbox/tabletop. Advice: legal/security contacts. Money: possible.
30. **Prepare feedback process.** Where: privacy-reviewed form/interview guide. Success: feedback method avoids sensitive analytics. Evidence: test response. Money: free tier possible. Reversible: yes.
31. **Select first beta participants.** Where: private founder list. Success: 10–20 trusted, diverse candidates with rationale. Evidence: secure list. Money: no. Reversible: invitations can pause.
32. **Run all ten test scripts.** Where: production/staging as specified. Success: pass evidence or resolved issues. Evidence: completed test plan. Money: usage dependent. Reversible: test data controlled.
33. **Perform formal Go/No-Go review.** Where: founder meeting/decision log. Success: no prohibited Red. Evidence: signed table/build hash. Advice: security/legal participants recommended. Money: possible.
34. **Send invitations in a small batch.** Where: founder mailbox. Success: recipients receive accurate private-beta message. Evidence: invitation register, not email contents. Money: minimal. Reversible: future invitations can pause; sent email cannot be recalled.
35. **Monitor the first seven days personally.** Where: Vercel, Supabase, monitoring, support, feedback. Success: daily review and prompt triage. Evidence: operations log. Money: usage/support time. Reversible: operational choices yes.

> **Final stop and verify:** Keep deployment paused until every required owner, status, evidence field, legal review, backup check, and Go/No-Go condition is complete. Do not begin public marketing from this playbook.
