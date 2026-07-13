# Orendalis Access and Environments Register

> Purpose: Provide the authoritative current-state map of Orendalis accounts, providers, environments, access recovery, subscriptions, integrations, and unresolved setup work without storing secrets.

## Source-of-Truth Map

| Information class | Authoritative record |
| --- | --- |
| Accounts | `ACCOUNT_REGISTER.md` |
| Providers | `PROVIDER_REGISTER.md` |
| Environments | `ENVIRONMENT_REGISTER.md` |
| Access and recovery | `ACCESS_AND_RECOVERY_REGISTER.md` |
| Subscriptions and billing | `SUBSCRIPTION_AND_BILLING_REGISTER.md` |
| Integrations | `INTEGRATION_REGISTER.md` |
| Open setup work | `OPEN_SETUP_ITEMS.md` |
| Founder orientation | `FOUNDER_QUICK_REFERENCE.md` |

These files are authoritative for current operating state as of **13 July 2026**. Historical asset, launch, email, investment, and staging records remain evidence and must not be rewritten merely to look current.

Current staging reconciliation: Vercel assigned `https://project-qmvs1.vercel.app` but no deployment exists; Supabase project `ymprcckbrgkijnuwhdne` is Healthy with no migrations and a recent provider backup; Auth URLs and Vercel variables are not configured. The controlled operations browser still requires access to the owning Supabase account before configuration can resume.

## Evidence Rules

- Record only facts supported by provider evidence, repository history, or a founder-confirmed event.
- Use **Founder to Verify**, **Unknown**, or **Not Configured** instead of inference.
- A provider capability is not treated as configured until verified.
- Provider-generated public identifiers may be recorded; credentials and secret values may not.
- Each material change must update the relevant register and cite a safe verification source.
- Review critical accounts monthly and after any owner, billing, security, recovery, or integration change.

## Conflict Handling

When an older document conflicts with this register, preserve the older record as history, note the conflict here or in `OPEN_SETUP_ITEMS.md`, and use this register for current decisions. Confirmed conflicts at creation were:

- Asset records describe Vercel as planned; the Orendalis Pro workspace and staging project now exist.
- Asset and recovery records describe cloud Supabase as absent; the Orendalis Pro organization and staging project now exist.
- Google Workspace and Proton appear in older provider plans. Microsoft 365 Business Basic is the chosen company mailbox platform, while Proton DNS records remain part of the unfinished routing migration.
- Older deployment audits say staging does not exist; Vercel and Supabase staging resources now exist, but staging is not deployed or accepted.

## Security Boundary

Never record passwords, access tokens, API keys, database passwords, service-role keys, card details, full recovery codes, session material, private messages, or secret callback values in this folder.
