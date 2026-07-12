# Orendalis Name Adoption Plan

## Objective

Secure and operationalize Orendalis as the company identity without premature disclosure, loss of digital assets, or avoidable legal/technical risk.

## Sequencing principle

Legal clearance and asset security should overlap confidentially. Do not announce the name, publish a public repository rename, or commission irreversible production work before counsel’s initial clearance view and domain acquisition.

## Phase 0 — Ownership and authority (Day 0)

- Identify the legal entity that will own the trademark and domains.
- Approve two named domain administrators and one emergency recovery contact.
- Use company-controlled email addresses and a company-controlled password manager; never register core assets in a founder’s personal account.
- Require hardware security keys or passkeys for registrar, DNS, email, source control, and social accounts.
- Record renewal, recovery, and succession procedures in the company’s access register.

## Phase 1 — Domain acquisition (Day 0–1)

### Exact domain

1. Recheck `orendalis.com` immediately before registration.
2. Register it directly without discussing the candidate publicly or querying aftermarket brokers.
3. Choose a multi-year term if desired, but rely on auto-renew rather than duration alone.
4. Enable auto-renew and use a payment method with expiry monitoring.
5. Apply registrar lock immediately and enable registry lock later if available and justified by company scale.

The Verisign `.com` RDAP service returned 404 for `orendalis.com` on 12 July 2026. This is not a reservation or guarantee.

### Registrar recommendation

**Primary recommendation: Cloudflare Registrar**, if the company is comfortable using Cloudflare as authoritative DNS. Its current official documentation states that registration and renewal are sold at registry/ICANN cost, WHOIS data is redacted by default, auto-renew is enabled by default, and one-click DNSSEC is available.

**Operational alternatives:** Porkbun, Namecheap, or Dynadot may be considered if procurement, TLD coverage, support, or DNS independence is more important. Before selecting any registrar, verify current renewal pricing—not merely first-year pricing—along with account security, DNSSEC support, transfer controls, role-based access, recovery procedures, and support responsiveness.

Avoid choosing solely on a promotional price. Do not use a web host or site builder as the long-term registrar for the core corporate domain.

### Defensive registrations

After exact-domain registration and counsel’s initial approval, consider:

- priority country-code domains for incorporation, launch, and major customer markets;
- common typing errors that present credible fraud risk;
- selected product domains only where there is a real use or abuse case.

Do not register hundreds of speculative variants. Maintain a defensible portfolio with a documented purpose and renewal owner.

## Phase 2 — Privacy and account security (Day 0–2)

- Enable WHOIS/privacy redaction where registry rules permit it.
- Understand that privacy does not hide ownership from the registrar, registry, lawful requests, or all corporate databases.
- Keep registrant data accurate; privacy is not permission to use false contact information.
- Enable phishing-resistant multifactor authentication for every administrator.
- Store recovery codes offline in two controlled locations.
- Turn on domain-change and transfer alerts.
- Use least privilege: billing, DNS, and ownership roles should not automatically be shared with every developer.
- Document an offboarding process that removes access immediately when responsibilities change.

## Phase 3 — DNS foundation (Day 1–3)

1. Select authoritative DNS and create the zone before any public service depends on it.
2. Establish minimal records for the apex domain and `www`; redirect one canonical hostname to the other.
3. Enable DNSSEC after confirming nameserver delegation. Follow the provider’s sequence carefully; mismatched DS records can make the domain unreachable.
4. Use conservative TTLs during migration, then raise them after stabilization.
5. Restrict DNS administration and enable audit logging/alerts.
6. Add CAA records to restrict which certificate authorities may issue certificates for the domain.
7. Monitor certificate transparency logs for unexpected issuance.
8. Keep a tested rollback procedure and export of critical DNS records.

Cloudflare’s current documentation describes DNSSEC as cryptographic authentication for DNS records and warns that an incorrect migration sequence can cause resolution failures.

## Phase 4 — Email setup (Day 2–7)

### Provider selection

Choose one primary business-email platform—normally Google Workspace or Microsoft 365—based on the company’s existing productivity suite, compliance needs, identity strategy, and administration capability. Avoid splitting normal employee mail across multiple providers.

### Required controls

- Create named accounts rather than shared passwords.
- Reserve role addresses such as `security@`, `legal@`, `privacy@`, `press@`, `support@`, and `domains@`; route them to accountable teams.
- Publish SPF for the authorized sending systems.
- Enable DKIM signing for every legitimate sender.
- Deploy DMARC in monitoring mode (`p=none`) only long enough to inventory legitimate traffic, then progress to quarantine and rejection.
- Configure MX, autodiscover, and provider verification records exactly as documented.
- Separate marketing/transactional sending onto controlled subdomains when appropriate to protect the corporate domain’s reputation.
- Enforce phishing-resistant MFA, disable legacy authentication, and create joiner/mover/leaver procedures.
- Test inbound, outbound, forwarding, calendar invitations, recovery, and impersonation protection before migration.

## Phase 5 — Trademark timing (Day 0–30)

1. **Before public use:** Retain qualified counsel for comprehensive searches covering exact, phonetic, visual, and meaning similarities; federal/national, state, company-name, domain, app, and common-law sources; and priority jurisdictions.
2. **Define ownership and scope:** Confirm the applicant entity and accurately identify current and genuinely intended goods/services. Do not overclaim categories.
3. **File promptly after a favorable clearance opinion:** Where eligible, consider intent-to-use or equivalent filing routes before launch. The USPTO states that a US intent-to-use application can establish an earlier application filing date before use, but registration still requires later proof of use.
4. **Coordinate internationally:** Counsel should decide whether national, EU, UK, Turkish, Madrid-system, or other routes fit the launch plan and priority deadlines.
5. **Preserve evidence:** Keep dated specimens, launch records, invoices, screenshots, and brand-guideline versions.
6. **Monitor:** Track application deadlines and later renewals. The USPTO recommends checking pending status periodically; counsel should own the docket.

Do not file through an automated filing service as a substitute for legal clearance. The USPTO notes that database searching alone is not conclusive and that confusing similarity can arise from appearance, sound, meaning, or commercial impression across related goods/services.

## Phase 6 — Social and platform handles (Day 1–7)

- Build a priority list: LinkedIn, YouTube, GitHub, X, Instagram, major app stores, and platforms actually relevant to customers or recruitment.
- Secure `orendalis` first; use a consistent fallback such as `orendaliscompany` only where the exact handle is unavailable.
- Do not use multiple inconsistent additions (`official`, `hq`, `team`, country codes) unless platform constraints require them.
- Register through company-owned email, enable strong MFA, and record recovery information centrally.
- Claim app-store developer/publisher identities in the legal company name when the entity and trademark plan are ready.
- Reserve handles defensively but do not create empty public profiles prematurely; use private or minimal holding states where platform rules allow.
- Create an impersonation monitoring and takedown process before announcement.

## Phase 7 — Brand system and public launch (Weeks 2–8)

- Lock the approved spelling: **Orendalis**.
- Standardize pronunciation: **oh-ren-DAH-liss**.
- Create wordmark, logo, color, typography, voice, legal-line, and accessibility standards.
- Do not invent an etymology and present it as historical fact.
- Prepare a short company descriptor that can change without changing the name.
- Update incorporation/DBA records, contracts, privacy materials, invoices, product footers, and employer branding under legal guidance.
- Use a staged launch checklist with named owners and rollback paths.

## Phase 8 — Internal repository rename strategy

No repository should be renamed merely to make internal code look branded. Rename only repositories whose names represent the parent company rather than a stable product.

### Recommended approach

1. Inventory repositories, package names, container registries, deployment projects, environment variables, secrets, CI/CD references, documentation links, badges, webhooks, OAuth callbacks, mobile identifiers, and external integrations.
2. Classify each item:
   - **Company-level:** eligible for Orendalis naming.
   - **Product-level:** retain product identity, such as Executive Career OS or Atlas Intelligence.
   - **Technical/internal:** rename only if the old company placeholder causes operational or security confusion.
3. Prepare a dependency map and migration order before changing repository names.
4. Rename during a controlled window; preserve redirects where the source-control platform supports them.
5. Update local remotes, CI/CD, deployment systems, documentation, access policies, and monitoring.
6. Verify builds and deployments only when a separate implementation change is authorized. This plan itself makes no code change.
7. Keep a temporary old-to-new mapping and announce it internally.

The current `executive-career-os` repository appears product-specific, so it should normally retain its product name unless the founders intentionally redefine it as the company monorepo.

## Phase 9 — Future product naming conventions

Use a flexible endorsed architecture:

- **Orendalis** is the company and trust mark.
- Products receive distinct names based on their user promise and category.
- During early growth: “Executive Career OS by Orendalis.”
- After corporate awareness grows: product names may stand alone with a restrained Orendalis endorsement.

### Rules

- Do not prefix every product with Orendalis.
- Do not reuse the corporate name as the default product name.
- Avoid repeating `OS` unless the product genuinely represents an operating layer and the portfolio logic remains clear.
- Reserve descriptive terms for features; use ownable names for strategic products.
- Test every product name for pronunciation, conflict, portfolio confusion, and conversational use.
- Maintain a central naming registry containing owner, purpose, status, domains, handles, trademark filings, pronunciation, and retirement date.
- Define product retirement rules so abandoned names and domains do not become security or impersonation liabilities.

## Completion checklist

- [ ] Attorney issues favorable clearance opinion.
- [ ] `orendalis.com` is registered to the correct company entity.
- [ ] Auto-renew, registrar lock, privacy, MFA/passkeys, and recovery controls are enabled.
- [ ] DNS, DNSSEC, CAA, certificates, and monitoring are verified.
- [ ] Business email passes SPF, DKIM, and DMARC tests.
- [ ] Priority domains and handles are secured.
- [ ] Trademark applications are filed on counsel’s timetable.
- [ ] Native-language checks are documented.
- [ ] Brand standards and launch assets are approved.
- [ ] Repository inventory and rename decision are recorded.
- [ ] Product naming governance is assigned.
- [ ] Naming phase is formally closed.

> **Legal disclaimer:** This plan provides operational guidance and preliminary availability context only. Final trademark clearance and filing strategy must be performed by qualified trademark counsel. Final legal clearance is outside the scope of this document.

## Current official references

- Cloudflare Registrar overview: https://developers.cloudflare.com/registrar/
- Cloudflare Registrar DNSSEC: https://developers.cloudflare.com/registrar/get-started/enable-dnssec/
- Cloudflare DNSSEC migration guidance: https://developers.cloudflare.com/dns/dnssec/
- USPTO federal trademark searching: https://www.uspto.gov/trademarks/search/federal-trademark-searching
- USPTO intent-to-use applications: https://www.uspto.gov/trademarks/apply/intent-use-itu-applications
- USPTO trademark process: https://www.uspto.gov/trademarks/basics/trademark-process
