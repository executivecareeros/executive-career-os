# Executive Rooms Retention and Deletion Decision

> Founder approval required because this changes collection, retention, export and deletion of confidential personal data.

## Recommended option — bounded retention

- Active invite-only room history: retained while the room is active.
- Archived room participant access: 90 days, with visible expiry.
- Participant-authored content after account closure: removed from participant-visible history within 30 days unless legally required; conversation continuity uses a neutral tombstone.
- Security/moderation audit: minimum necessary identifiers and hashes retained 12 months, not message bodies unless required for an active incident/legal hold.
- Atlas transient request payloads: not stored outside the versioned output/evidence record approved by the user; no model training.
- Temporary rooms: owner chooses 30 or 90 days at creation; expiry cannot be silently extended.

Advantages: understandable, bounded, supports useful history and appeals. Trade-off: archives are not permanent institutional memory unless moderators promote sourced knowledge separately.

## Alternative 1 — participant-controlled permanent rooms

Keep history until the owner closes the room, then provide 90-day export/deletion. Higher knowledge value, higher privacy/storage/moderation burden, and greater risk of forgotten sensitive content.

## Alternative 2 — short-lived rooms

Delete participant-visible messages after 30 days, preserving only promoted sourced knowledge and security audit. Lowest privacy burden but weaker ongoing executive value and searchable continuity.

## Required behaviors for every option

- Show retention before join and at room creation.
- Permit correction, export and consent withdrawal where applicable.
- Revoke access immediately on leave/removal.
- Separate participant-visible deletion from limited security/legal retention.
- Pause deletion only for a documented legal hold or active incident, with restricted access.
- Test room closure, participant deletion, account closure, export and backup expiry.

