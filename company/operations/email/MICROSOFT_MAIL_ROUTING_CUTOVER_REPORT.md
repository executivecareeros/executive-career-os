# Microsoft 365 Mail-Routing Cutover Report

> Purpose: Preserve the factual record of the controlled migration of `orendalis.com` mail routing from Proton Mail to Microsoft 365.

## Operation

- Date: 2026-07-13
- Change type: Controlled production email DNS cutover
- Domain: `orendalis.com`
- Primary mailbox: `cuneyt.sen@orendalis.com`
- Microsoft 365 domain setup result: Completed

## Pre-Change Snapshot

Before the cutover, public DNS routed mail to Proton Mail through MX priorities 10 and 20. Two root SPF records authorized Porkbun and Proton. Autodiscover resolved through the Porkbun wildcard. Microsoft and Proton verification records, Proton DKIM records, Microsoft DKIM records, and the existing DMARC policy were present.

## Approved Changes Performed

| Record | Action | Result |
| --- | --- | --- |
| Proton MX records | Removed | Replaced by the Microsoft MX record. |
| Root MX | Added `0 orendalis-com.mail.protection.outlook.com` with TTL 3600 | Publicly resolved. |
| Root SPF TXT records | Removed the Porkbun and Proton policies | No duplicate SPF policy remained. |
| Root SPF TXT | Added `v=spf1 include:spf.protection.outlook.com -all` with TTL 3600 | Publicly resolved as the single SPF policy. |
| `autodiscover` CNAME | Added `autodiscover.outlook.com` with TTL 3600 | Publicly resolved. |

## Records Deliberately Preserved

- DMARC remained `v=DMARC1; p=quarantine`.
- Microsoft DKIM selector CNAME records were not changed.
- DKIM signing was not enabled.
- Proton DKIM CNAME records were not removed.
- Proton verification TXT records were not removed.
- Microsoft domain-verification TXT was not removed.
- Website, wildcard, Vercel, ACME, Resend, Supabase, and GitHub records were not changed.

## Validation Evidence

- Microsoft 365 reported that domain setup for `orendalis.com` was complete.
- Public DNS returned the Microsoft MX target.
- Public DNS returned one Microsoft SPF policy.
- Public DNS returned the Microsoft Autodiscover CNAME.
- Outlook Web loaded the licensed mailbox and its folders.
- The founder sent an external test message to `cuneyt.sen@orendalis.com` and confirmed receipt after the cutover.
- No mail-delivery error was reported during the controlled inbound test.

## Remaining Validation and Risk

- DKIM remains blocked by Microsoft selector publication/synchronization and is tracked in Microsoft support case `2607130050001139`.
- Outbound message-header validation for SPF, DKIM, DMARC, and TLS remains pending.
- Delivery to each alias and Outlook desktop/mobile synchronization were not re-tested during this operation.
- Proton DKIM and verification records remain available as historical/provider remnants. They must not be removed without a separately approved cleanup step.

## Rollback Status

The pre-change Proton MX and SPF values are preserved in the operational history. No rollback was required because the controlled inbound test succeeded.

## Operational Decision

**Mail routing cutover successful with non-blocking issues.**

Microsoft 365 now receives mail for the primary Orendalis mailbox. DKIM completion and the remaining authentication/header checks are separate follow-up work.

## Provider-Remnant Cleanup — 2026-07-15

After a final read-only verification confirmed that Microsoft 365 was the sole root-domain MX provider, the single root SPF policy authorized Microsoft, and the complete Porkbun zone contained no Proton references beyond five obsolete records, the founder approved their removal.

Removed only:

- Two root TXT records beginning `protonmail-verification=`.
- `protonmail._domainkey` CNAME.
- `protonmail2._domainkey` CNAME.
- `protonmail3._domainkey` CNAME.

Porkbun showed 15 records after cleanup and no remaining Proton values. The authoritative Porkbun server, Cloudflare resolver, and Google resolver continued to return the Microsoft MX, Microsoft SPF, Autodiscover, both Microsoft selector CNAMEs, and the existing DMARC policy. Resend, Vercel, website, wildcard, and ACME records were not modified. A controlled Microsoft 365 message was sent from and received by the founder mailbox after the cleanup.
