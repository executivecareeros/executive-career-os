# Invitation-Only Access

> Purpose: Define the private-beta registration control and its security properties.

Public registration is disabled because `/register` requires a founder-issued token. Tokens contain 256 bits of randomness, are returned once, and are stored only as SHA-256 digests. They must never be logged or committed.

Invitations are Workspace-scoped and record the invited email, intended role, creator, expiry, acceptance, revocation, version, and audit events. Inspection returns only the stable invitation ID, state, and expiry. Acceptance requires an authenticated identity whose verified email matches the invitation.

Pending, Accepted, Expired, Revoked, and Invalid are terminally interpreted. Accepted invitations cannot be replayed. Expired and revoked invitations cannot provision a beta Workspace. Creating invitations requires `Invite Members`; onboarding requires a previously accepted invitation.

No invitation has been issued or sent as part of this sprint.
