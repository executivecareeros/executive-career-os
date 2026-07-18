# Executive Rooms Permission Matrix

> Deny by default. Visibility, membership, message access, moderation and knowledge promotion are independent permissions. Server and RLS enforcement are mandatory.

| Action | Platform admin | Room owner | Moderator | Participant | Non-member |
|---|---:|---:|---:|---:|---:|
| Discover invite-only room | Security/support purpose only | Yes | Yes | Only after invitation | No |
| View topic/member list | Audited support only | Yes | Yes | Yes | No |
| Read history | Audited support only | Yes | Yes | Yes while active member | No |
| Post/reply | No by default | Yes | Yes | Yes unless muted | No |
| Pin/bookmark shared item | No | Yes | Yes | No | No |
| Bookmark privately | No | Yes | Yes | Yes | No |
| Invite participant | No | Yes | If delegated | No | No |
| Remove/mute participant | Emergency safety only | Yes | Yes | No | No |
| Change topic/settings | No | Yes | If delegated | No | No |
| Archive room | Emergency safety only | Yes | No | No | No |
| Invoke Atlas | No | Yes | Yes | Yes | No |
| Promote Atlas output to shared knowledge | No | Yes | Yes | No | No |
| Export own content | No | Yes | Yes | Yes | No |
| Export full room | Legal/security gate | Yes, subject to participant notice | No | No | No |
| View moderation audit | Security/legal need | Own room | Own room | Own appeal only | No |

## Invariants

- Removing membership revokes future reads immediately; treatment of prior exports follows disclosed retention policy.
- Owners cannot delete or alter moderation audit.
- Atlas receives only the room and message scope explicitly invoked in the command.
- Search rechecks current membership on every query.
- Platform support access is exceptional, time-bounded, purpose-recorded and auditable.
- No role may grant itself a higher role.

