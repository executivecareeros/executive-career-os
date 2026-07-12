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
7. Microsoft Defender continued to report `CnameMissing`; active migration work was suspended for the Microsoft synchronization window.

MX, SPF, DMARC, and Proton mail-routing records have not been migrated as part of the DKIM publication work described here.

## Record Status

| Record | Status | Purpose |
| --- | --- | --- |
| `EMAIL_MIGRATION_STATUS.md` | **Current controlling status** | Records the operational hold, success and failure conditions, and change freeze. |
| `DKIM_DNS_VALIDATION_REPORT.md` | **Current validation evidence** | Confirms both selector CNAME records resolve publicly and records Microsoft's pending detection state. |
| `DKIM_KEY_GENERATION_REPORT.md` | **Historical** | Preserves the Microsoft key-generation event and exact selector values before DNS publication. |
| `EMAIL_CUTOVER_CHECKLIST.md` | **Historically useful; partially superseded** | Preserves the broader cutover plan. Its pre-DNS `NoDKIMKeys` and unpublished-selector state was superseded by the key-generation and DNS-validation reports. Unchecked MX, SPF, DMARC, mail-flow, rollback, and post-cutover controls remain relevant. |

When records conflict, use the newest factual evidence and the current controlling status. Do not rewrite historical reports merely to make them appear current.

## Current Blocker

The next blocked action is **Microsoft DKIM synchronization**. Public DNS resolves both selectors, but Microsoft Defender still reports `CnameMissing`.

Do not regenerate keys, recreate or delete the CNAMEs, enable DKIM signing, or modify MX, SPF, DMARC, or Proton records while the synchronization hold is active. If Microsoft still reports `CnameMissing` after the documented 48-hour window, recommend escalation to Microsoft Support.
