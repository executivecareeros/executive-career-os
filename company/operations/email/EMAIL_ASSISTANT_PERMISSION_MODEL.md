# Email Assistant Permission Model

Purpose: Define the least-privilege authority, approval boundaries, and audit expectations for a future Orendalis email assistant serving the founder mailbox.

## Governing Principle

The assistant supports judgment; it does not exercise uncontrolled mailbox authority. The founder retains final authority over communication, security, contracts, payments, and disclosure.

## Mailbox Scope

Access is limited to `cuneyt.sen@orendalis.com`. Tenant-wide mailbox access and broad application permissions are prohibited unless technically unavoidable, separately risk-assessed, and explicitly approved.

Prefer delegated access acting on behalf of the signed-in founder. Application-only access creates greater privacy and persistence risk and is outside the initial design.

## Capability Matrix

| Capability | Initial state | Minimum authority | Human control |
|---|---|---|---|
| Search selected messages | Permitted after approval | Delegated mail read scope | Founder defines mailbox and selection boundaries |
| Read selected messages | Permitted after approval | Delegated mail read scope | Only messages relevant to the requested task |
| Summarize unread or important messages | Permitted after approval | Delegated mail read scope | Output minimizes private content |
| Identify deadlines and requested actions | Permitted after approval | Delegated mail read scope | Treat inference as uncertain until reviewed |
| Classify or categorize messages | Conditional | Delegated mail write scope | Approve classification rules first |
| Flag security or billing concerns | Permitted after approval | Delegated mail read scope | No link or attachment action |
| Prepare reply drafts | Conditional | Delegated mail write scope | Draft only; never send automatically |
| Notify the founder | Conditional | Approved notification connector | Metadata-only by default |
| Send, reply, or forward | Prohibited by default | Would require send authority | Case-by-case explicit founder approval |
| Delete messages | Prohibited | Not requested | No delegated authority granted for this purpose |
| Change security settings | Prohibited | Not requested | Founder/admin action only |
| Accept contracts or approve payments | Prohibited | Not applicable | Founder action only |

## Permission Strategy

### Monitoring-only stage

Use the Office 365 Outlook connector under the founder's delegated connection. Configure only the actions required to read the matched message metadata, send the external alert, and apply the approved category. The connector's actual consent screen must be reviewed before approval because connector scopes may be broader than the individual actions used.

### Future custom assistant stage

Start with delegated `Mail.Read` when message bodies are required. `Mail.ReadBasic` is preferred where subject, sender, timestamps, and metadata are sufficient because it excludes bodies and attachments. Add delegated `Mail.ReadWrite` only if draft creation or categorization is approved. Do not request `Mail.Send` during the initial stage.

Microsoft documents that `Mail.ReadWrite` does not include mail sending, while `Mail.Send` is a separate permission. This separation must be preserved.

## Reply Approval Workflow

For every proposed reply:

1. Read the complete relevant thread within the approved scope.
2. Produce a concise summary, requested action, proposed reply, and risks or uncertainties.
3. Save the reply as a draft only.
4. Notify the founder without copying unnecessary thread content.
5. Wait for explicit approval tied to that draft.
6. Sending remains a founder action unless a separately approved, narrowly controlled send mechanism is introduced later.

Approval for one draft does not authorize future replies.

## Prohibited Behaviors

- Automatic sending, forwarding, or deletion
- Opening unknown attachments
- Acting on links in suspicious messages
- Changing authentication, recovery, forwarding, or inbox rules
- Disclosing confidential information to external notification channels
- Storing passwords, tokens, phone numbers, private messages, or recovery material in the repository
- Reusing consent or authority for a different mailbox or purpose

## Privacy and Retention

- Process the minimum content needed for the specific task.
- Prefer metadata-only alerts.
- Keep OAuth credentials in the provider-managed connection store.
- Record decisions and action outcomes, not full private messages.
- Define retention before production activation.
- Revoke connections when the case or assistant purpose ends.

## Audit Expectations

Audit records should identify the actor, time, mailbox, operation, message identifier, approval reference, outcome, and error state. They must not reproduce message bodies or secrets. Draft creation and any future send action require distinct audit events.

## Approval Gates

Founder approval is required before:

- Connecting Power Automate to Outlook
- Granting any Microsoft Graph permission
- Adding mail write authority
- Preparing or saving reply drafts through automation
- Activating live monitoring
- Enabling any send capability

## Known Limitations

Delegated access is bounded by the signed-in user's existing rights, but an Outlook connector may still request a broader consent bundle than a custom Graph application. Exact scopes must be inspected at consent time. Least privilege cannot be claimed until that review is complete.

## Authoritative References

- [Microsoft Graph permissions overview](https://learn.microsoft.com/en-us/graph/permissions-overview)
- [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Create a draft message](https://learn.microsoft.com/en-us/graph/api/mailfolder-post-messages)
