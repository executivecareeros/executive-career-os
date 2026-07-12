# DKIM DNS Validation Report

Purpose: Record the controlled publication and validation of the two Microsoft 365 DKIM selector records for `orendalis.com`.

## Change Scope

Only the following two DNS records were added in Porkbun. Microsoft DKIM signing was not enabled.

| Selector | Type | Host | Target | TTL |
| --- | --- | --- | --- | --- |
| Selector 1 | CNAME | `selector1._domainkey` | `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | 3600 seconds |
| Selector 2 | CNAME | `selector2._domainkey` | `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | 3600 seconds |

Porkbun displays the targets in lowercase. DNS names are case-insensitive, so this does not alter their meaning.

## Selector 1 Validation

- Porkbun record: Present
- Public hostname: `selector1._domainkey.orendalis.com`
- Public DNS result: `selector1-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.`
- Public resolution: Successful

## Selector 2 Validation

- Porkbun record: Present
- Public hostname: `selector2._domainkey.orendalis.com`
- Public DNS result: `selector2-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.`
- Public resolution: Successful

## Propagation Status

Both CNAME records resolve through public DNS. Public DNS propagation is complete at the time of this report.

## Microsoft Detection Status

Rechecked: `2026-07-12 23:00:28 +03`

Microsoft Defender continues to report `CnameMissing` for `orendalis.com`. Both Orendalis selector CNAMEs still resolve to the exact Microsoft-generated destinations, but those Microsoft destination names do not yet return published DKIM key records.

This evidence indicates a Microsoft-side DKIM key publication or synchronization delay, rather than a missing or malformed Porkbun CNAME. Microsoft synchronization can take several hours and, in some tenants, up to 24–48 hours after key creation and DNS publication.

DKIM signing remains **disabled**. No attempt was made to enable it.

### Remaining Warning

- Microsoft status: `CnameMissing`
- Selector 1 CNAME detection: Pending in Microsoft
- Selector 2 CNAME detection: Pending in Microsoft
- Microsoft DKIM destination key publication: Pending

## Change Boundary Confirmation

No other DNS records were changed. In particular:

- MX was not changed.
- SPF was not changed.
- DMARC was not changed.
- Existing Proton records were not removed or modified.
- Website, wildcard, and ACME records were not changed.

## Next Step

Wait at least 4–6 hours before the next Microsoft detection check. If `CnameMissing` remains after 24 hours, recheck the Microsoft-generated selector values against the tenant and consider Microsoft 365 support. Allow up to 48 hours before treating the delay as a provisioning fault.

After Microsoft detects both selectors, confirm that the domain no longer reports `CnameMissing`. Enabling DKIM signing requires a separate explicit founder approval.
