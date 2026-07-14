# Design Partner Invitation Workflow

> Purpose: Move one approved candidate from qualification to secure access without uncontrolled recruitment or personal-data leakage.

## Sequence

1. **Nominate:** founder identifies a candidate; no invitation is created.
2. **Qualify:** apply mandatory criteria and rubric; record only necessary safe metadata.
3. **Capacity check:** confirm the active wave has space and founder support capacity.
4. **Readiness check:** confirm product, security, privacy, email, support, recovery, and legal gates for the intended data mode.
5. **Founder decision:** record invite, defer, or decline.
6. **Pre-invitation contact:** use approved language to explain purpose, limitations, expected time, observation, data mode, voluntary withdrawal, and support.
7. **Interest confirmation:** candidate confirms interest before account invitation; instruct them not to send documents or sensitive information by email.
8. **Create invitation:** founder uses Company Control to create a single-use, email-bound, expiring invitation.
9. **Deliver securely:** founder sends the link through the approved channel. Manual founder delivery is acceptable; copy the link only at creation and never store it in Git or learning records.
10. **Track state:** Pending, Accepted, Expired, or Revoked remains authoritative in Invitation Management.
11. **Follow up once:** if Pending, send at most one approved reminder before expiry unless the candidate requests otherwise.
12. **Close:** accepted candidates enter the Success Journey; expired, revoked, declined, or withdrawn invitations are recorded without pressure to rejoin.

## Invitation Content Requirements

State:

- why the person was invited;
- that this is a private design-partner program, not a job service;
- what the product does and does not do;
- expected first-session and return-session commitment;
- observation and feedback expectations;
- supported data mode and prohibited data;
- confidentiality and voluntary withdrawal;
- support and privacy contacts;
- invitation expiry and single-use nature.

## Failure Handling

- Invalid or expired link: verify status; create a new invitation only after confirming candidate identity and founder approval.
- Wrong email: revoke immediately; do not edit or reuse the token.
- Suspected forwarding or exposure: revoke and assess as a security event.
- Duplicate pending invitation: use the existing invitation or revoke it before creating another.
- Delivery failure: confirm address through the approved relationship channel; do not expose account existence to third parties.

## Prohibited Actions

No bulk invitations, public links, shared accounts, reusable tokens, spreadsheet exports containing links, social promotion, or automatic enrollment. Acceptance of an invitation does not constitute consent for marketing, testimonials, or unrelated research.
