# Microsoft Support Notification Runbook

Purpose: Provide the controlled operating procedure for configuring, testing, approving, and maintaining notifications for Microsoft DKIM support case `2607130050001139`.

## Status

- Support case: Submitted and open
- Flow design: Complete
- Outlook connection: Not created
- Test: Not performed
- Gmail alert: Not active
- Live monitoring: Not active

## Proposed Flow

### Trigger

Use the Office 365 Outlook connector action **When a new email arrives (V3)** against the Inbox of the founder mailbox. Keep attachment inclusion disabled.

### Conditions

1. Normalize subject, sender address, and the minimum body text required for matching.
2. Require the support case number or a verified Microsoft thread identifier.
3. Require at least one DKIM-topic signal.
4. Compare the actual sender domain with the reviewed Microsoft support allowlist.
5. Inspect available authentication indicators.
6. Route authentication failures, reply-to mismatches, or unexpected attachments to suspicious review.
7. Check the stable message identifier against the processed-message register.

### Case-Matched Actions

1. Create a metadata-only summary containing received time, sender, subject, case number, action-required assessment, and a safe Outlook link when supported.
2. Send an email alert to the founder-approved external alert address.
3. Apply the Outlook category `Microsoft Support — DKIM` to the original message.
4. Do not mark the original message read.
5. Write the identifier and action outcomes to the restricted deduplication register.

Recommended alert subject:

`Microsoft DKIM Support Update — Orendalis`

Recommended alert body:

> A new message relevant to the Orendalis Microsoft DKIM support case has arrived.
>
> Received: [date and time]
>
> Sender: [sender address]
>
> Subject: [subject]
>
> Case: [case number]
>
> Summary: [short safe summary]
>
> Founder action appears required: [yes/no/uncertain]
>
> Review the original message in Outlook: [safe Microsoft link, if available]

Do not include complete message content or attachments.

## Controlled Test Plan

Testing requires founder approval to connect Power Automate to Outlook. After configuration, but before live activation:

1. Keep the production flow disabled or use an isolated test condition.
2. Send a harmless test message with subject `TEST — Microsoft DKIM Support Monitoring` and a clearly non-production test marker.
3. Configure the temporary test branch to require that exact subject and marker.
4. Confirm exactly one flow run and one external alert.
5. Confirm received time, sender, subject, case field, summary, and action-required field are accurate.
6. Confirm the original remains unread.
7. Confirm no attachment or full body is copied.
8. Replay or retry the same message identifier and confirm no duplicate alert.
9. Send one unrelated test message and confirm no alert.
10. Remove or disable the temporary test branch and retain the test evidence in restricted operational records.

### Acceptance Criteria

- One relevant test produces one alert.
- An unrelated message produces no alert.
- Duplicate processing produces no second alert.
- The summary contains no secrets or unnecessary message content.
- The original message is categorized but remains unread.
- Failed-authentication simulation follows the suspicious path.

## Activation Gate

After presenting test evidence, stop. Live activation requires explicit founder approval. Do not infer approval from permission to run the test.

## Suspicious Message Procedure

- Do not click links, open attachments, reply, or forward.
- Compare the actual sender and reply-to domains.
- Review message authentication results in Outlook.
- Open the Microsoft 365 Admin Center independently rather than through the message.
- Compare the update with the existing case record.
- Escalate uncertainty to the founder.

## Operational Review

- Review failed runs after each notification and at least monthly.
- Review connection ownership and consent quarterly.
- Review the sender allowlist whenever Microsoft changes the support thread sender.
- Remove the flow after case closure unless another approved purpose exists.
- Revoke unused connections and delete deduplication records according to the approved retention period.

## Recovery

If the flow stops, keep the mailbox as the source of truth. Reauthenticate the connection interactively, inspect missed messages manually by case number, restore the last reviewed flow definition, rerun the controlled test, and obtain approval before reactivation if permissions or logic changed.

## Current Test Result

Not tested. No Power Automate connection or Gmail alert has been activated.

