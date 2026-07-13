# Staging Transactional Email Status

> Purpose: Record the verified current state of staging authentication email without storing credentials.

## Current State

- Provider: Resend Free
- Sending domain: `auth.orendalis.com`
- Sender: `Orendalis <no-reply@auth.orendalis.com>`
- Supabase project: `Orendalis/orendalis-staging`
- Custom SMTP: Enabled
- SMTP credential location: Supabase staging only
- DNS verification: Complete
- Provider delivery: Successful
- Authentication: SPF pass, DKIM pass, DMARC pass, composite authentication pass
- Founder Auth user: Email confirmed on 14 July 2026
- Founder bootstrap: Not executed

## Acceptance Blocker

The controlled confirmation message was accepted by Microsoft but classified as high-confidence phishing and quarantined by the default anti-spam policy. It reached the Inbox only after an administrator released the verified test message. This fails the no-quarantine acceptance condition and must be resolved before design-partner invitations.

## Next Action

Investigate Microsoft Defender's advanced-filter verdict and the Supabase-hosted single-use confirmation URL. Do not weaken tenant-wide anti-phishing protection. Retest with one controlled message only after a reviewed remediation.
