# Executive Rooms Threat Model

## Protected assets

Room membership, executive identity, private messages, career/company/opportunity references, files in future scope, Atlas prompts/outputs, moderation actions, exports, presence and audit history.

## Trust boundaries

Browser ↔ Vercel; Vercel ↔ Supabase; workspace ↔ room; member ↔ non-member; participant ↔ moderator; room content ↔ Atlas; room ↔ search/export; support administrator ↔ customer data.

## Priority abuse cases and mandatory controls

| Threat | Impact | Required control | Acceptance evidence |
|---|---|---|---|
| IDOR/cross-room read | Confidential content exposure | Room-scoped RLS; unpredictable IDs; negative tests for every role | Non-member and former-member reads fail at DB and application boundaries |
| Invitation forwarding | Unauthorized access | Single-use, expiring invitation bound to authenticated identity | Reuse, expiry and identity mismatch tests pass |
| Privilege escalation | Room takeover | Server-enforced role transitions; owner cannot bypass platform audit | Participant/moderator escalation tests fail |
| Search leakage | Reveals private topics/content | Search applies current room membership at query time | Non-member search returns zero content and metadata |
| Atlas overreach | Silent monitoring or cross-room disclosure | Explicit command only; scoped payload; provenance; no training; no cross-room retrieval | Audit proves exact invocation, scope, sources and output |
| Prompt injection in messages | Manipulates Atlas/action | Room content treated as untrusted evidence; no autonomous tools/actions | Injection corpus cannot change policy or access scope |
| Export abuse | Mass disclosure | Full-room export restricted, notified, rate-limited and audited | Export permission and notification tests pass |
| Harassment/impersonation | Executive harm | Verified identity, reporting, mute/remove, evidence preservation, appeal | Moderation drill completes within target time |
| Presence stalking | Behavioral surveillance | Presence off by default; coarse status; user control; no historical presence analytics | Disabled presence generates no visible or retained history |
| Deletion mismatch | Trust/legal failure | Disclosed retention policy; tombstone/security-audit separation; verified deletion job | Account/room deletion rehearsal matches policy |
| Admin misuse | Insider exposure | Least privilege, purpose logging, access review, break-glass process | Audited support-access test and revocation pass |
| Notification leakage | Private topic in email/push | Generic notification text; content visible only after authenticated access | Notification fixtures contain no room message content |

## Security stop conditions

Stop release for any cross-room read, unscoped Atlas retrieval, unaudited moderation/admin access, unclear retention, invitation replay, notification content leak, or inability to revoke a former member.

