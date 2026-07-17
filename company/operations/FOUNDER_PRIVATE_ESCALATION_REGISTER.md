# Founder Private Escalation Register

**Visibility:** Founder and explicitly authorized Orendalis operators only.  
**Storage rule:** Internal repository record; never expose through product pages, public APIs, search indexing, analytics, or executive/employer views.  
**Data rule:** Do not record passwords, tokens, MFA codes, private keys, payment data, or raw sensitive user documents.

## Active issues

| Issue ID | Created | Status | Priority | Category | Affected feature | Environment | Luna attempts | Recommended model | Founder action | Next review |
|---|---|---|---|---|---|---|---:|---|---|---|
| ESC-2026-0717-001 | 2026-07-17 | Recorded for Sol | P1 | Geographic eligibility and confidence ranking | Authenticated opportunities, search, Atlas | Production | 1 | Sol | Confirmed geographic profile; deeper ranking review required | 2026-07-24 |

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
- **Why Luna cannot complete it:** Requires deeper cross-surface ranking review and authenticated production acceptance beyond the bounded implementation pass.
- **Current workaround:** Treat the current ranking as not accepted for high-confidence production use; preserve explicit eligibility labels.
- **Risk of waiting:** Executives may see geographically impractical roles and lose trust.
- **Recommended Sol mission:** Complete and validate the geographic confidence ranking across profile schema, search defaults/filters, Ranked Opportunities, Atlas explanations, deterministic fixtures, desktop/mobile, and production.
- **Estimated Sol effort:** One focused mission.
- **Required access:** Authenticated production session, repository, deployment status, and read-only runtime evidence if failures appear.
- **Resolution:** Open.

## Closed issues

None recorded in this register.
