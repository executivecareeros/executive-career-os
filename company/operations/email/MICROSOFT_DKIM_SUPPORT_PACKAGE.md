# Microsoft 365 DKIM Support Package

> Purpose: Provide Microsoft Support with a factual, support-safe record of the unresolved DKIM publication issue for `orendalis.com`.

## Case Summary

Exchange Online is operational for `orendalis.com`. The licensed mailbox can send and receive mail, Outlook Web loads and synchronizes folders, Exchange service health was reported healthy, accepted domains are authoritative, and seven aliases are attached to the primary mailbox.

Microsoft Defender displays exact Selector1 and Selector2 CNAME requirements for `orendalis.com`. Both records are published exactly as specified and resolve publicly with TTL 3600. However, Defender continues to report `CnameMissing`, and both Microsoft destination hostnames return `NXDOMAIN` from a public resolver. DKIM signing remains disabled.

Requested Microsoft Support outcome: investigate and complete Microsoft-side DKIM key publication/synchronization for the two generated selector destinations. No DNS change is requested unless Microsoft identifies a documented discrepancy.

## 1. Timeline

All dates and times use the Europe/Istanbul timezone unless stated otherwise. Unknown times are not inferred.

| Date / time | Event | Evidence / status |
| --- | --- | --- |
| 2026-07-12; exact time not recorded | Microsoft 365 tenant creation | Founder confirmed the Microsoft 365 account and tenant were created. Default tenant domain is `Orendalis.onmicrosoft.com`. |
| 2026-07-12; exact time not recorded | Domain verification | Microsoft 365 successfully verified ownership of `orendalis.com`; Microsoft verification TXT remained active. |
| 2026-07-12; exact time not recorded | License and mailbox activation | One Microsoft 365 Business Basic license became active for `cuneyt.sen@orendalis.com`. Outlook Web opened and synchronized mailbox folders. |
| 2026-07-12; exact time not recorded | Mailbox functional validation | Founder confirmed successful sending and receiving from `cuneyt.sen@orendalis.com`. Exchange Admin Center loaded and Exchange Online health showed no incident or advisory. |
| 2026-07-12; exact time not recorded | Alias configuration | Seven aliases were confirmed attached to the licensed mailbox. |
| 2026-07-12; exact time not recorded | DKIM key generation | Microsoft-managed DKIM keys were created for `orendalis.com`. Defender displayed the two exact selector CNAME values. Signing remained disabled. |
| 2026-07-12; before 23:00 +03; exact time not recorded | CNAME publication | Both Microsoft DKIM CNAME records were added in Porkbun with TTL 3600. No MX, SPF, DMARC, Proton, website, wildcard, or ACME record was changed. |
| 2026-07-12 23:00:28 +03 | First recorded post-publication verification | Both customer-domain CNAMEs resolved publicly. Defender still reported `CnameMissing`; Microsoft destination key records were unavailable. |
| 2026-07-12 23:47:33 +03 | Complete readiness verification | Microsoft expectations and public CNAMEs matched. Defender still reported `CnameMissing`. Both Microsoft destination hostnames returned `NXDOMAIN` through Cloudflare `1.1.1.1`. |

## 2. Exact Selector Values

These values are transcribed exactly as Microsoft Defender displayed them.

### Selector1

- Host name: `selector1._domainkey`
- Points to address or value: `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`

### Selector2

- Host name: `selector2._domainkey`
- Points to address or value: `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`

DNS names are case-insensitive. Public DNS displays the destination labels in lowercase without changing their meaning.

## 3. Public DNS Evidence

Fresh verification at `2026-07-12 23:47:33 +03` used Cloudflare public resolver `1.1.1.1`.

| Query | Type | TTL | Answer | Comparison |
| --- | --- | ---: | --- | --- |
| `selector1._domainkey.orendalis.com` | CNAME | 3600 | `selector1-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.` | Exact DNS-equivalent match with Microsoft |
| `selector2._domainkey.orendalis.com` | CNAME | 3600 | `selector2-orendalis-com._domainkey.orendalis.w-v1.dkim.mail.microsoft.` | Exact DNS-equivalent match with Microsoft |

Both customer-domain records exist, resolve publicly, and match Microsoft's displayed requirements.

## 4. Microsoft Status Messages

Current custom-domain state observed in Microsoft Defender:

- Domain: `orendalis.com`
- Accepted-domain type: `Yetkili` / Authoritative
- DKIM status: `CnameMissing`
- Toggle state: `Devre dışı` / Disabled
- Detail message: `Bu etki alanı için DKIM imzası eklenmiyor.`
- Synchronization message: `DKIM anahtarlarının eşitlenmesi birkaç dakika sürebilir. DNS barındırma sağlayıcınıza aşağıdaki CNAME kayıtlarını ekleyin ve ardından DKIM'i etkinleştirmek için bu sayfaya geri dönün.`
- Microsoft last-check time displayed: `12 Tem 2026 22:49:29`

The default tenant signing domain `Orendalis.onmicrosoft.com` displayed `NoDKIMKeys` and remained disabled. The support request concerns the custom accepted domain `orendalis.com` only.

## 5. Exchange Online Status

| Check | Result |
| --- | --- |
| Microsoft 365 license | Active: Microsoft 365 Business Basic, one user |
| Primary mailbox | `cuneyt.sen@orendalis.com` |
| Outlook Web | Opens successfully |
| Mailbox folders | Available and synchronized |
| Sending | Founder-confirmed successful |
| Receiving | Founder-confirmed successful |
| Exchange Admin Center | Loads successfully |
| Exchange Online service health | Healthy; no blocking incident or advisory observed |
| Accepted domains | `orendalis.com` and `Orendalis.onmicrosoft.com`, both authoritative |

## 6. Operational Proof

### Mailbox is operational

- Outlook Web opened the licensed mailbox.
- Inbox and mailbox folders synchronized.
- Founder successfully sent and received email using `cuneyt.sen@orendalis.com`.

### Exchange Online is healthy

- Exchange Admin Center loaded successfully after initial provisioning.
- Exchange Online service health showed no blocking incident or advisory during readiness review.
- The earlier accepted-domain tenant-resolution error no longer prevented mailbox operation.

### Aliases exist

Microsoft confirmed these aliases are attached to `cuneyt.sen@orendalis.com`:

- `hello@orendalis.com`
- `support@orendalis.com`
- `privacy@orendalis.com`
- `security@orendalis.com`
- `legal@orendalis.com`
- `atlas@orendalis.com`
- `ceo@orendalis.com`

Inbound alias delivery after a future MX cutover is not claimed because mail routing has not been migrated from Proton.

### CNAMEs are correct

- Both public CNAME records exist.
- Both use TTL 3600.
- Both targets are exact DNS-equivalent matches with the values Microsoft Defender currently displays.
- No selector mismatch or incorrect Orendalis CNAME was identified.

### Microsoft destinations return NXDOMAIN

At `2026-07-12 23:47:33 +03`, TXT queries through Cloudflare `1.1.1.1` returned `NXDOMAIN` for both Microsoft-managed destinations:

- `selector1-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`
- `selector2-orendalis-com._domainkey.Orendalis.w-v1.dkim.mail.microsoft`

This means the Orendalis CNAMEs point to the exact Microsoft-generated names, but Microsoft has not published those destination names in public DNS.

## 7. Exact Errors and Status Codes

### Current unresolved status

- `CnameMissing` for `orendalis.com` in Microsoft Defender.
- DNS response status `NXDOMAIN` for each Microsoft-managed selector destination.

### Earlier provisioning error

The following error was observed earlier in provisioning:

`Failed to resolve tenant name from accepted domain 'Orendalis.onmicrosoft.com'`

Mailbox operation, Outlook Web access, Exchange Admin access, and service health subsequently became functional. The historical error is included because it may indicate an earlier tenant-provisioning or accepted-domain synchronization issue relevant to the current DKIM publication failure.

### Informational Microsoft states

- `NoDKIMKeys` was shown immediately after custom-domain key creation before the custom domain later displayed `CnameMissing`.
- `NoDKIMKeys` remains visible for `Orendalis.onmicrosoft.com`; that default domain is outside the requested custom-domain investigation.

## 8. Support-Safe Tenant Information

The following identifiers are operational metadata and do not include credentials or secrets:

| Field | Value |
| --- | --- |
| Organization / brand | Orendalis |
| Custom domain | `orendalis.com` |
| Default tenant domain | `Orendalis.onmicrosoft.com` |
| Microsoft tenant ID | `a7fe70b8-5937-4f8d-a90f-df4649f5658d` |
| Primary licensed account | `cuneyt.sen@orendalis.com` |
| Microsoft 365 plan | Microsoft 365 Business Basic; one active user |
| Accepted domains | `orendalis.com`, `Orendalis.onmicrosoft.com` |
| DKIM management surface | Microsoft Defender email authentication settings, DKIM view |

No passwords, session tokens, cookies, recovery codes, payment data, DNS-account credentials, or private message contents are included.

## 9. Problem Summary for Microsoft Support

Microsoft 365 and Exchange Online are operational for the verified custom domain `orendalis.com`. The licensed mailbox `cuneyt.sen@orendalis.com` can send and receive mail, Outlook Web and Exchange Admin Center work, service health is clear, both accepted domains are authoritative, and the approved aliases are attached.

Microsoft Defender generated and currently displays two DKIM CNAME requirements for `orendalis.com`. Both CNAME records are publicly available at TTL 3600 and exactly match the Microsoft-displayed destinations. Nevertheless, Defender continues to report `CnameMissing`. Independent public DNS queries show that both Microsoft-managed destination hostnames return `NXDOMAIN`, so the CNAME chain cannot reach a Microsoft-published DKIM public key.

Please investigate Microsoft-side DKIM key publication and synchronization for the custom domain `orendalis.com` in tenant `a7fe70b8-5937-4f8d-a90f-df4649f5658d`. Please do not rotate or regenerate the keys unless Microsoft determines that the existing generated destinations are invalid and provides a documented remediation path. DKIM signing remains disabled, and no MX, SPF, DMARC, Proton, or other mail-routing change is requested as part of this support investigation.

## Evidence References

- `DKIM_KEY_GENERATION_REPORT.md`
- `DKIM_DNS_VALIDATION_REPORT.md`
- `EMAIL_MIGRATION_STATUS.md`
- `EMAIL_CUTOVER_CHECKLIST.md`

This package was prepared for support submission only. Microsoft has not been contacted by this action, and no configuration was changed.
