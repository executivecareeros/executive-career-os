# Email Deliverability

> Purpose: Preserve evidence from controlled staging email-delivery checks.

## Controlled Test — 14 July 2026

| Check | Result |
| --- | --- |
| Recipient | Founder mailbox only |
| Subject | `Confirm your email address` |
| Resend status | Delivered |
| Microsoft receipt | Confirmed at 00:39 Europe/Istanbul |
| Initial placement | Quarantine |
| Microsoft verdict | High-confidence phishing; advanced filter |
| SPF | Pass |
| DKIM | Pass |
| DMARC | Pass |
| Composite authentication | Pass |
| TLS | Provider transport completed; protocol detail was not exposed in the reviewed dashboards |
| Inbox arrival | Successful only after administrator release at approximately 00:43 |
| Spam/Junk placement | Not placed in Junk; quarantined before Inbox delivery |

Resend and DNS authentication are working. The unresolved issue is Microsoft Defender classification, not SMTP connectivity or domain authentication.

No second confirmation message was requested during this test.
