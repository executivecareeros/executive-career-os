# WhatsApp Notification Feasibility

Purpose: Assess a future WhatsApp notification channel for Microsoft support updates without using personal-session automation or creating unapproved Meta infrastructure.

## Decision

WhatsApp notification is feasible only through the official Meta WhatsApp Business Platform, but it is not ready for implementation. The repository contains no verified evidence that Orendalis currently has a Meta Business portfolio, WhatsApp Business Account, registered sender number, approved authentication, or notification template.

Email remains the production notification channel.

## Required Official Architecture

```text
Power Automate case-matched flow
    ↓ metadata-only HTTPS request or approved connector
Secure server-side integration
    ↓ Meta WhatsApp Cloud API
Approved business sender and notification template
    ↓
Founder-verified destination number
```

Personal WhatsApp Web scraping, browser automation, unofficial libraries, session-cookie storage, and automation from a personal WhatsApp account are prohibited.

## Prerequisites

- Meta Business portfolio owned by Orendalis
- WhatsApp Business Account
- Business verification where required by Meta
- Dedicated, eligible sender number
- Secure authentication and secret storage outside the repository
- Approved outbound notification template where required
- Founder-verified destination number entered directly into the provider configuration
- Data-processing, retention, access, and incident procedures
- Founder approval for terms, sender registration, payment method, template submission, and first message

## Power Automate Integration Options

### Custom connector

A Power Automate custom connector can call an approved server-side endpoint or Meta API, but it may require Power Automate Premium licensing. It also introduces connector governance, credential storage, error handling, and data-loss-prevention requirements.

### HTTPS webhook or Azure intermediary

An authenticated webhook to a minimal server-side service can isolate Meta credentials from Power Automate. This adds hosting, monitoring, secret-management, and operational costs. Direct client-side calls are not acceptable.

No connector or webhook has been created.

## Proposed Template

Template name:

`orendalis_microsoft_support_update`

Message:

> Orendalis received a new Microsoft support update for case {{1}}.
>
> Subject: {{2}}
>
> Action required: {{3}}
>
> Please review the original message in Outlook.

The message contains no email body, confidential content, attachments, or direct message links.

## Costs

Exact cost is unknown and must be confirmed in the applicable Meta and Microsoft billing accounts before approval.

- Meta pricing depends on message category, recipient market, current free-entry or service-window rules, and Meta's then-current rate card.
- A business sender number or telecom service may add recurring cost.
- Power Automate Premium may be required for a custom connector or premium HTTP capability. Microsoft's public US list price currently shows Power Automate Premium at USD 15 per user per month when paid yearly, but regional availability and Türkiye pricing must be verified at checkout.
- A server-side intermediary may add hosting, logging, monitoring, and secret-management costs.

No purchase or payment method is authorized by this document.

## Privacy and Security Implications

- WhatsApp receives case metadata and therefore becomes an additional processor and disclosure channel.
- Notification content must remain minimal and exclude full emails, attachments, personal data, and confidential case evidence.
- Phone numbers and API credentials must not enter repository history.
- Access tokens require managed secret storage, rotation, and revocation procedures.
- Delivery receipts and provider logs require a defined retention policy.
- Template variables must be constrained to prevent accidental sensitive-content disclosure.

## Reliability and Failure Handling

- Email remains the source-of-truth notification channel.
- A WhatsApp failure must not block or retry the email alert.
- Use a stable event identifier to prevent duplicate WhatsApp messages.
- Bound retries and route permanent failures to an operational alert.
- Disable the channel immediately if credentials, sender status, or template approval becomes invalid.

## Known Limitations

- Current Meta ownership and account status are unknown.
- Sender eligibility and template approval are not confirmed.
- Exact regional pricing is not established.
- No approved integration, secure runtime, or live test exists.
- Meta policies and rates can change and must be reviewed immediately before implementation.

## Approval Gates

Separate founder approval is required before creating a Meta Business account, registering a sender, accepting terms, adding payment, submitting the template, configuring an integration, entering the destination number, or sending any WhatsApp message.

## Authoritative References

- [WhatsApp Business Platform pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Power Automate pricing](https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing)
