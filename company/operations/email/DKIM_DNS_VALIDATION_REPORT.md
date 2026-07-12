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

---

## Readiness Verification — 2026-07-12 23:47:33 +03

### Microsoft Status

- Accepted domain: `orendalis.com`
- Domain type: Authoritative
- Current DKIM status: `CnameMissing`
- Signing status: Disabled
- Microsoft detail message: DKIM signatures are not being added for this domain.
- Microsoft last-check time displayed: `12 Tem 2026 22:49:29`
- Synchronization guidance displayed: DKIM key synchronization may take several minutes.
- Warning state: Microsoft still does not recognize the required CNAMEs.

### Microsoft Expectations

| Selector | Host Microsoft displays | Destination Microsoft displays | Comparison with public DNS |
| --- | --- | --- | --- |
| Selector 1 | `selector1._domainkey` | `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | **MATCH** |
| Selector 2 | `selector2._domainkey` | `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | **MATCH** |

DNS names are case-insensitive. The lowercase destinations returned by DNS are equivalent to Microsoft's mixed-case display values.

### Fresh Public DNS Evidence

Public resolver used: Cloudflare `1.1.1.1`.

| Public hostname | Record | TTL | Target | Result |
| --- | --- | ---: | --- | --- |
| `selector1._domainkey.orendalis.com` | CNAME | 3600 | `selector1-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.` | Exists; resolves; matches Microsoft |
| `selector2._domainkey.orendalis.com` | CNAME | 3600 | `selector2-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.` | Exists; resolves; matches Microsoft |

### Microsoft Destination Validation

| Microsoft destination | TXT lookup result | Infrastructure readiness |
| --- | --- | --- |
| `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | `NXDOMAIN` | Public key not published |
| `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft` | `NXDOMAIN` | Public key not published |

The Orendalis CNAME records are correct, but Microsoft has not published either referenced destination in public DNS. This is consistent with the `CnameMissing` state in Microsoft Defender.

### Decision

**NOT READY**

Blocker classification: **Microsoft synchronization**.

There is no DNS mismatch and no incorrect Orendalis CNAME identified. DKIM signing must not be enabled while both Microsoft destinations return `NXDOMAIN` and Defender reports `CnameMissing`.

### Recommended Next Action

Make no configuration change. Wait for Microsoft's DKIM key publication and synchronization window, then perform one read-only verification. If both Microsoft destination names remain `NXDOMAIN` and Defender still reports `CnameMissing` after 48 hours, escalate to Microsoft Support with this evidence.

No DKIM, DNS, MX, SPF, DMARC, Proton, or mail-routing setting was changed during this verification.
