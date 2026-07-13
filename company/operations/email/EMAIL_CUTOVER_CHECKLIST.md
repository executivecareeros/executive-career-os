# Orendalis Email Cutover Checklist

Purpose: Preserve the verified migration controls and track the remaining validation after migrating `orendalis.com` email routing from Proton to Microsoft 365.

## Confirmed ready

- [x] `orendalis.com` ownership verified in Microsoft 365.
- [x] Microsoft verification TXT record is publicly available.
- [x] Microsoft 365 Business Basic license is active for one user.
- [x] Primary Exchange Online mailbox is `cuneyt.sen@orendalis.com`.
- [x] Outlook Web opens successfully and mailbox folders synchronize.
- [x] Founder confirmed successful sending and receiving.
- [x] Exchange Admin Center loads successfully.
- [x] Exchange Online service health reports healthy with no incident or advisory.
- [x] `orendalis.com` and `Orendalis.onmicrosoft.com` appear as authoritative accepted domains.
- [x] Approved aliases are attached to the primary mailbox:
  - `hello@orendalis.com`
  - `support@orendalis.com`
  - `privacy@orendalis.com`
  - `security@orendalis.com`
  - `legal@orendalis.com`
  - `atlas@orendalis.com`
  - `ceo@orendalis.com`
- [x] Exact Microsoft MX target obtained: `orendalis-com.mail.protection.outlook.com`.
- [x] Exact Microsoft Autodiscover target obtained: `autodiscover.outlook.com`.
- [x] Exact Microsoft SPF value obtained: `v=spf1 include:spf.protection.outlook.com -all`.

## Blocking prerequisite

- [x] Obtain separate founder approval to initiate Microsoft DKIM key creation for `orendalis.com` without enabling signing or changing DNS.
- [x] Create the Microsoft-managed DKIM key pairs in Microsoft Defender.
- [x] Record the exact Microsoft-provided Selector1 CNAME host and destination.
- [x] Record the exact Microsoft-provided Selector2 CNAME host and destination.
- [ ] Do not infer or construct DKIM destinations.

Historical note: Microsoft originally reported `NoDKIMKeys`. The managed key pairs and selector values were subsequently generated and recorded. Microsoft later reported `CnameMissing` because its selector destinations were not published; DKIM signing remains disabled and is tracked through Microsoft support.

## Pre-cutover verification

- [x] Refresh and preserve a complete Porkbun DNS rollback snapshot.
- [x] Confirm the existing Proton MX, SPF, DKIM, verification, DMARC, wildcard, website, and ACME records before the change.
- [x] Confirm the founder-approved cutover window.
- [x] Confirm access to Porkbun, Microsoft 365 Admin, and Outlook Web.
- [x] Confirm rollback values and rollback order before the first DNS change.
- [x] Confirm aliases remain attached to `cuneyt.sen@orendalis.com`.
- [x] Confirm the existing DMARC policy remains `p=quarantine` unless the founder separately approves a change.

## Controlled DNS migration

- [x] Replace all root SPF policies with one Microsoft SPF TXT record.
- [x] Add the explicit Microsoft Autodiscover CNAME.
- [x] Add both exact Microsoft DKIM CNAME records.
- [x] Verify public DKIM CNAME propagation.
- [ ] Enable DKIM in Microsoft only after both selector records resolve correctly.
- [x] Replace Proton MX records with the exact Microsoft MX record.
- [x] Do not change website, wildcard, or ACME records.
- [x] Do not remove Proton DKIM or verification records during the cutover.

## Post-cutover validation

- [x] Verify inbound mail to the primary address.
- [ ] Revalidate outbound mail from the primary address and inspect the delivered headers.
- [ ] Verify delivery to every approved alias.
- [ ] Verify Outlook Web and Outlook for macOS synchronization.
- [ ] Verify SPF passes and aligns.
- [ ] Verify DKIM passes and aligns.
- [ ] Verify DMARC passes with the existing policy.
- [ ] Verify TLS for inbound and outbound delivery.
- [ ] Observe spam placement and message headers.
- [x] Remove Proton MX and SPF records as part of the approved routing change.
- [ ] Remove retained Proton DKIM and verification records only after successful validation and separate approval.
- [ ] Recheck public DNS and Microsoft service health.

## Rollback trigger

Rollback if Microsoft cannot receive mail, send mail, authenticate messages, or deliver aliases reliably after the cutover. Restore the preserved Proton MX and SPF configuration first, verify Proton delivery, and investigate before attempting another migration.
