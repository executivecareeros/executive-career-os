# Orendalis Email Cutover Checklist

Purpose: Track the remaining verified actions required before migrating `orendalis.com` email routing from Proton to Microsoft 365.

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

Microsoft currently reports `NoDKIMKeys` and DKIM is disabled for both accepted domains. Microsoft creates the two managed key pairs when DKIM setup is initiated; this is not a passive provisioning delay. The DNS cutover must not begin until the custom-domain selector values are generated, displayed, and recorded.

## Pre-cutover verification

- [ ] Refresh and preserve a complete Porkbun DNS rollback snapshot.
- [ ] Confirm the existing Proton MX, SPF, DKIM, verification, DMARC, wildcard, website, and ACME records have not changed.
- [ ] Confirm the founder-approved cutover window.
- [ ] Confirm access to Porkbun, Microsoft 365 Admin, Exchange Admin, Defender, and Outlook Web.
- [ ] Confirm rollback values and rollback order before the first DNS change.
- [ ] Confirm aliases remain attached to `cuneyt.sen@orendalis.com`.
- [ ] Confirm the existing DMARC policy remains `p=quarantine` unless the founder separately approves a change.

## Controlled DNS migration

- [ ] Replace all root SPF policies with one Microsoft SPF TXT record.
- [ ] Add the explicit Microsoft Autodiscover CNAME.
- [ ] Add both exact Microsoft DKIM CNAME records.
- [ ] Verify public DKIM CNAME propagation.
- [ ] Enable DKIM in Microsoft only after both selector records resolve correctly.
- [ ] Replace Proton MX records with the exact Microsoft MX record.
- [ ] Do not change website, wildcard, or ACME records.
- [ ] Do not remove Proton records until Microsoft mail flow is validated.

## Post-cutover validation

- [ ] Verify inbound mail to the primary address.
- [ ] Verify outbound mail from the primary address.
- [ ] Verify delivery to every approved alias.
- [ ] Verify Outlook Web and Outlook for macOS synchronization.
- [ ] Verify SPF passes and aligns.
- [ ] Verify DKIM passes and aligns.
- [ ] Verify DMARC passes with the existing policy.
- [ ] Verify TLS for inbound and outbound delivery.
- [ ] Observe spam placement and message headers.
- [ ] Remove Proton MX, SPF, DKIM, and verification records only after successful validation and separate approval.
- [ ] Recheck public DNS and Microsoft service health.

## Rollback trigger

Rollback if Microsoft cannot receive mail, send mail, authenticate messages, or deliver aliases reliably after the cutover. Restore the preserved Proton MX and SPF configuration first, verify Proton delivery, and investigate before attempting another migration.
