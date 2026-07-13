# Microsoft Dependencies Runbook

> Purpose: Define how Orendalis operates around Microsoft 365 dependencies without unsafe mail, DNS, or tenant changes.

## Trigger

Microsoft mailbox, Outlook, admin, licensing, authentication, support, or DKIM dependency affects staging operations or company communication.

## Responsible Owner

Founder / Microsoft 365 Administrator and Infrastructure Owner.

## Current Boundary

- One Microsoft 365 Business Basic mailbox is documented as operational.
- Aliases are documented.
- DKIM completion remains dependent on Microsoft case `2607130050001139`.
- Staging preparation does not authorize Microsoft, DNS, MX, SPF, DKIM, or DMARC changes.
- Microsoft 365 is company communication infrastructure, not the application authentication database.

## Procedure

1. Confirm whether the issue affects mailbox access, sending, receiving, admin access, licensing, or DKIM only.
2. Check Microsoft service health and the existing support case before changing anything.
3. Preserve safe error messages, timestamps, affected addresses, and case updates; never record message content or credentials unnecessarily.
4. For access loss, use documented Microsoft account recovery and MFA methods from a trusted device.
5. For mailbox outage, use an approved alternate founder contact channel and do not reroute DNS impulsively.
6. For DKIM, keep the documented change freeze until Microsoft confirms remediation and a separately approved migration resumes.
7. For billing/license risk, notify the founder before service expiry and obtain approval before purchase or plan change.
8. Update the support case log only with factual provider responses.

## Verification

Verify administrator access, mailbox sign-in, folder synchronization, controlled internal sending/receiving, aliases, service health, and support-case state as applicable. Staging email acceptance remains separate.

## Rollback

No configuration change is authorized by this runbook. If an independently approved mail change fails, use the email rollback snapshot and migration runbooks under `company/operations/email/`.

## Postmortem Requirements

Required for company-wide email loss, account compromise, unapproved DNS/mail change, lost administrator access, billing suspension, or a missed security notification caused by Microsoft unavailability.
