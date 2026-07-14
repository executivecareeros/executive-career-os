# Orendalis Email Operations Records

> Purpose: Preserve the factual operational history, validation evidence, and controlled next steps for Orendalis professional email infrastructure.

## Scope

This folder is the permanent repository location for Microsoft 365 email migration and DKIM readiness records. It contains operational evidence only; it must never contain passwords, recovery codes, tenant secrets, payment details, or private message content.

## Migration Sequence

1. Microsoft 365 was purchased and the `orendalis.com` domain was verified.
2. Exchange Online provisioning, mailbox operation, accepted domains, and service health were validated.
3. The primary mailbox and approved aliases were confirmed.
4. Exact Microsoft MX, Autodiscover, SPF, and DKIM selector values were collected.
5. Microsoft-managed DKIM keys were generated without enabling signing.
6. The two approved DKIM CNAME records were published in Porkbun and confirmed through public DNS.
7. Microsoft Defender continued to report `CnameMissing`; Microsoft support case `2607130050001139` was opened for the selector-publication failure.
8. Mail routing was migrated from Proton to Microsoft 365 using the Microsoft-provided MX, SPF, and Autodiscover values.
9. Microsoft completed the domain setup, public DNS resolved the new records, and the founder confirmed receipt of an external test message at the primary mailbox.
10. On 2026-07-15, a separately approved cleanup removed the three obsolete Proton DKIM CNAMEs and two Proton verification TXT records. The authoritative zone retained Microsoft, DMARC, Resend, Vercel, website, wildcard, and ACME records unchanged.

## Record Status

| Record | Status | Purpose |
| --- | --- | --- |
| `MICROSOFT_MAIL_ROUTING_CUTOVER_REPORT.md` | **Current mail-routing record** | Records the approved DNS changes, validation evidence, preserved records, rollback status, and remaining risks. |
| `EMAIL_MIGRATION_STATUS.md` | **Current DKIM status** | Records the unresolved Microsoft selector-publication blocker and DKIM change freeze. |
| `DKIM_DNS_VALIDATION_REPORT.md` | **Current validation evidence** | Confirms both selector CNAME records resolve publicly and records Microsoft's pending detection state. |
| `DKIM_KEY_GENERATION_REPORT.md` | **Historical** | Preserves the Microsoft key-generation event and exact selector values before DNS publication. |
| `EMAIL_CUTOVER_CHECKLIST.md` | **Current checklist** | Preserves completed migration controls and identifies remaining DKIM, alias, client, and message-authentication validation. |

When records conflict, use the newest factual evidence and the current controlling status. Do not rewrite historical reports merely to make them appear current.

## Current Blocker

Microsoft 365 mail routing is operational. The remaining email-authentication blocker is **Microsoft DKIM selector publication/synchronization**. Public DNS resolves both customer-side selector CNAMEs, but Microsoft Defender still reports `CnameMissing`, and the Microsoft-generated destination names remain unavailable.

Do not regenerate keys, recreate or delete the Microsoft selector CNAMEs, enable DKIM signing, or modify MX, SPF, or DMARC while Microsoft support investigates. Proton DNS remnants have been removed; any Proton account or subscription closure remains a separate founder action.
