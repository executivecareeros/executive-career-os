# Microsoft Support Case Log

Purpose: Preserve the factual record and follow-up status of the Microsoft 365 support request concerning DKIM provisioning for `orendalis.com`.

## Case 2607130050001139

- **Subject:** Exchange Online DKIM provisioning failure – Microsoft-generated DKIM selector targets return NXDOMAIN
- **Submission date and time:** 13 July 2026, 12:19:41 (Microsoft portal display; timezone not shown)
- **Contact email:** `cuneyt.sen@orendalis.com`
- **Callback number:** `+90 532 650 5086`
- **Assigned product:** Exchange Online requested; the submitted-case view did not display a separate assigned-product field
- **Severity:** C (`Önem C` in the Microsoft portal; low-to-medium impact)
- **Initial status:** Open (`Aç` in the Microsoft portal)
- **Attachment:** Not attached; the complete approved issue description was submitted in the request

## Submitted Issue Summary

Exchange Online, the licensed mailbox, Outlook Web, sending and receiving, accepted domains, aliases, licensing, and the customer-side DKIM CNAME records were reported as operational or verified. Microsoft Defender continued to report `CnameMissing`, while the Microsoft-generated selector destination hostnames returned `NXDOMAIN`, preventing DKIM signing from being enabled.

Microsoft was asked to investigate DKIM backend provisioning, missing selector publication, tenant synchronization, stale `CnameMissing` evaluation, and whether backend tenant reprovisioning is required. The request explicitly stated that DKIM keys should not be rotated or regenerated unless Microsoft confirms that remediation.

## Expected Next Action

Microsoft assigns a support representative, investigates the Exchange Online DKIM publication state for the tenant, and advises whether Microsoft-side repair or any customer-side action is required.

## Initial Automated Response

Microsoft displayed the following response immediately after submission:

> Servis isteği açıldı
>
> İsteğinize bir destek temsilcisi atanıyor.

The portal recorded the event at `13.07.2026 12:19:41`.

## Change-Control Confirmation

This support submission did not change DNS, Exchange configuration, DKIM, MX, SPF, DMARC, or existing Proton records.

## 18 July 2026 Verification Update

- Microsoft Support advised publishing the tenant DKIM records through Exchange Online PowerShell using `Set-DkimSigningConfig -Identity orendalis.com -PublishTxtRecords`.
- The Founder subsequently replied that the issue appeared fixed "for now"; this was an operational acknowledgement, not independent proof that DKIM signing was active.
- A fresh public DNS check at 18:23 TRT confirmed that both customer-side selector CNAME records resolve to the expected Microsoft-managed destinations.
- Both Microsoft-managed destination hostnames still returned `NXDOMAIN` from public DNS.
- The case therefore remains **Open**. Closure requires Microsoft-side selector publication followed by verification of a DKIM-signed outbound message. No customer DNS change is indicated by the current evidence.
