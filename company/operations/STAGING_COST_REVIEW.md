# Staging Cost Review

> Purpose: Present the minimum known staging commitment and isolate every unknown before purchase.

**Pricing checked:** 13 July 2026. USD list prices are not checkout quotes and exclude tax, currency conversion, add-ons, and usage overages.

| Provider | Plan | Monthly | Annual | Optional | Required | Unknown |
| --- | --- | ---: | ---: | --- | --- | --- |
| Vercel | Pro, one deploying seat | USD 20 + usage | USD 240 + usage | Additional seats, add-ons and overage | Yes for the recommended commercial/private-org-repository staging path | Tax, billing currency, exchange rate, live checkout, actual usage |
| Supabase | Pro, one Micro project | From USD 25 | From USD 300 | Custom domain USD 10/month; PITR from approximately USD 100/month plus qualifying compute; higher compute | Yes for non-pausing staging with daily backups | Tax, billing currency, exchange rate, live checkout, actual usage |
| GitHub | Current documented Free plan | USD 0 | USD 0 | Team if future governance requires it | Existing source provider required; paid upgrade not required now | Live organization controls and future paid need |
| Microsoft 365 | Existing Business Basic | Existing commitment | Founder invoice | No staging upgrade | Mailbox dependency exists; no staging purchase | Exact existing invoice and tax are outside this review |
| Porkbun / DNS | Existing domain | Existing commitment | Founder invoice | `staging.orendalis.com` only after a later approval | No new staging cost now | Existing renewal amount outside this review |

## Minimum New Base Commitment

- **Monthly:** USD 45 before tax, exchange rate, and usage.
- **Annualized:** USD 540 before tax, exchange rate, and usage.
- **First approved scope:** Vercel Pro plus Supabase Pro only.
- **Not approved:** Supabase custom domain, PITR, upgraded compute, Vercel add-ons, extra seats, GitHub Team, external monitoring, transactional email, or DNS work.

## Cost Controls

1. Founder reviews the live checkout and renewal terms immediately before each purchase.
2. Record tax, currency, renewal date, and payment owner after—and only after—purchase succeeds.
3. Keep Supabase's documented default Pro spend cap enabled.
4. Set Vercel usage alerts and an explicit low stop/action threshold before deployment; do not accept an unreviewed default threshold.
5. Review invoices weekly during staging acceptance and monthly afterward.
6. No add-on or limit increase without a new approval record.

## Cancellation and Financial Rollback

- Vercel: disable deployments and downgrade through the documented support/help process; current terms say downgrade becomes effective at the next renewal period.
- Supabase: export required evidence, disconnect runtime access, then downgrade to Free. Supabase documents immediate downgrade and account credits—not payment-method refunds—for unused prepaid subscription time. Overage can still be invoiced.
- Never delete a project as a cost-control shortcut before recovery evidence and destructive-action approval.

Sources: [Vercel Pro](https://vercel.com/docs/plans/pro-plan), [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing), and [Supabase subscription management](https://supabase.com/docs/guides/platform/manage-your-subscription).
