# Company Asset Register

> Purpose: Provide the master inventory of company-controlled and planned assets.

> **Historical state notice — 13 July 2026:** Use `company/operations/access-and-environments/` for current provider, environment, access, and billing state. The Vercel, cloud Supabase, and Google Workspace rows below predate creation of Orendalis staging and selection of Microsoft 365. They are preserved as historical inventory rather than silently rewritten.

## Master inventory

| Asset Name | Category | Owner | Status | Provider | Purchase Date | Renewal Date | Cost | Billing Cycle | Auto Renewal | Account Owner | Recovery Email | Criticality | Business Impact | Backup | Location | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GitHub Organization | Repositories / Source Code | Founder | Active; security configuration pending | GitHub Free | 2026-07-12 | N/A | USD 0 | Free | N/A | Founder | Founder-controlled; not stored in Git | Critical | Company source ownership and access control | Local repository clone | `https://github.com/Orendalis` | One owner; no repositories; organization-wide 2FA not yet enforced |
| GitHub Repository | Repositories / Source Code | Founder | Active under existing `executivecareeros` owner; migration not approved | GitHub | N/A | N/A | [VERIFY] | [PLAN] | N/A | [OWNER] | [RECOVERY] | Critical | Source and history unavailable if lost | Local clone | `https://github.com/executivecareeros/executive-career-os` | Do not rename or transfer until separately approved; branch and security settings remain unverified |
| Supabase | Databases / Authentication | Founder | Active locally; production pending | Supabase | [DATE] | [DATE] | [VERIFY] | [PLAN] | [YES/NO] | [OWNER] | [RECOVERY] | Critical | Production data/authentication dependency | Verify | [PROJECT REGISTER] | Local runtime verified; production account not claimed |
| Vercel | Hosting | Founder | Planned/needs configuration | Vercel | [DATE] | [DATE] | [VERIFY] | [PLAN] | [YES/NO] | [OWNER] | [RECOVERY] | Critical | Frontend availability | Git repository | [PROJECT URL] | Vercel-compatible frontend; production unverified |
| Atlas Documentation | Documentation / IP | Founder | Active | Internal | N/A | Quarterly review | Internal | N/A | N/A | Founder | N/A | High | Intelligence principles and operating memory | Git | `docs/` and `company/` | Version controlled |
| Executive Career OS Documentation | Documentation / IP | Founder | Active | Internal | N/A | Quarterly review | Internal | N/A | N/A | Founder | N/A | High | Product and company institutional memory | Git | `docs/`, `company/` | Version controlled |
| Company Constitution | Legal / Documentation | Founder | Active—living document | Internal | N/A | Annual review | Internal | N/A | N/A | Founder | N/A | High | Trust and governance foundation | Git | `docs/founders/` | Not a substitute for executed legal agreements |
| Founder Documentation | Company / Documentation | Founder | Active | Internal | N/A | Quarterly review | Internal | N/A | N/A | Founder | N/A | High | Founder continuity | Git | `company/founders/` | Living records |
| Vision Documents | Brand / Documentation | Founder | Active | Internal | N/A | Annual review | Internal | N/A | N/A | Founder | N/A | Medium | Strategic alignment | Git | `docs/vision/` | Living records |
| Playbooks | Documentation / Security | Founder | Active | Internal | N/A | Quarterly review | Internal | N/A | N/A | Founder | N/A | High | Operational launch and recovery guidance | Git + authorized copies | `company/launch/` | Review before use |
| Google Workspace | Email | Founder | Planned | Google | [PENDING] | [PENDING] | [VERIFY] | [PLAN] | [PENDING] | [OWNER] | [RECOVERY] | High | Company communications | Provider-dependent | [ADMIN URL] | Do not claim purchase |
| Stripe | Payments | Founder | Planned | Stripe | [PENDING] | N/A | [VERIFY] | Usage | N/A | [OWNER] | [RECOVERY] | High | Future revenue collection | Provider export | [ACCOUNT] | Not implemented |
| `orendalis.com` | Domains / Brand | Founder | Registered; initial registrar setup pending | Porkbun | 2026-07-12 | Pending registrar finalization (one-year term) | USD 11.08 | Annual | Not yet verified | Founder | Founder-controlled; not stored in Git | Critical | Identity, website, and email | Registrar recovery setup pending | `DOMAIN_REGISTER.md` | Renewal shown at checkout: estimated USD 11.08/year; order evidence retained in registrar account |
| Trademark | Trademarks / IP | [OWNER] | Pending research/legal advice | [OFFICE/COUNSEL] | [PENDING] | [PENDING] | Professional-service cost | Filing/renewal | N/A | [OWNER] | [CONTACT] | High | Brand protection | Legal records | `INTELLECTUAL_PROPERTY_REGISTER.md` | Domain availability is not trademark clearance |
| Business Registration | Company / Legal | Founder | Pending jurisdiction/advice | [REGISTRY] | [PENDING] | [PENDING] | Professional-service cost | Periodic | [PENDING] | [OWNER] | [CONTACT] | Critical | Legal ability to contract/operate | Certified records | [SECURE LOCATION] | No jurisdiction chosen |

## Category coverage

Company, Brand, Domains, Trademarks, Copyrights, Source Code, Repositories, Hosting, Databases, Authentication, Storage, Email, Payments, Analytics, Monitoring, Design, Documentation, Legal, Accounting, Marketing, Social Media, Developer Accounts, AI Providers, Third-party Services, Security, Hardware, Licenses, and Certificates must each be reviewed even when no asset currently exists.
