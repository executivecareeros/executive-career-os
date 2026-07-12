# Email Migration Status

Purpose: Record the current operational hold on the Orendalis Microsoft 365 email migration and define the conditions for resuming DKIM validation.

## Current Stage

**Waiting for Microsoft DKIM synchronization**

Active DKIM migration work is suspended. Public DNS is correct, both Microsoft DKIM selector CNAME records resolve publicly, Exchange Online and the licensed mailbox are operational, and the approved aliases are configured. Microsoft Defender continues to report `CnameMissing`.

## Blocked By

Microsoft internal DKIM publication/synchronization.

The current evidence supports treating this as a Microsoft synchronization window unless new evidence indicates a configuration problem.

## Next Automatic Check

Tomorrow morning, `2026-07-13` in the Europe/Istanbul timezone, and no sooner than 4–6 hours after the last verification.

No additional DKIM checks should be performed before this verification window.

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
