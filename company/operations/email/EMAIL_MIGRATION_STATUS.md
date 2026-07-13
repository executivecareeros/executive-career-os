# Email Migration Status

Purpose: Record the current operational hold on the Orendalis Microsoft 365 email migration and define the conditions for resuming DKIM validation.

## Current Stage

**Microsoft mail routing operational; waiting for Microsoft DKIM remediation**

Mail routing was cut over to Microsoft 365 on 2026-07-13. Microsoft completed the domain setup, public DNS resolves the Microsoft MX, single SPF, and Autodiscover records, and the founder confirmed receipt of an external test message at the primary mailbox.

Active DKIM work remains suspended. Both Microsoft DKIM selector CNAME records resolve publicly, but Microsoft Defender continues to report `CnameMissing`. Microsoft support case `2607130050001139` tracks the missing Microsoft-side selector publication.

## Blocked By

Microsoft internal DKIM publication/synchronization.

The current evidence supports treating this as a Microsoft synchronization window unless new evidence indicates a configuration problem.

## Next Check

Recheck only in response to a Microsoft support update or a separately approved verification window. Do not repeatedly retry DKIM detection.

## Success Condition

Microsoft detects both selectors and allows DKIM signing.

Detection alone does not authorize enabling DKIM. Signing must remain disabled until the founder provides separate explicit approval.

## Failure Condition

Microsoft still reports `CnameMissing` 48 hours after the selector records were published.

Only after this condition is met should escalation to Microsoft Support be recommended.

## Change Freeze

Until the scheduled verification window, do not:

- Modify DNS.
- Regenerate DKIM keys.
- Recreate or delete the DKIM CNAME records.
- Enable DKIM signing.
- Change MX, SPF, or DMARC.
