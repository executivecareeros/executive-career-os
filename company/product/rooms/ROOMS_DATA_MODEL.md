# Executive Rooms Logical Data Model

Status: Founder gate; design only. No schema or runtime records are authorized by this document.

## Model

- `Room`: workspace-scoped purpose, topic, lifecycle, retention policy, visibility fixed to invite-only, and immutable creator provenance.
- `RoomMembership`: one executive identity, one room, one explicit role, membership state, joined/left timestamps, and the invitation that authorized entry.
- `RoomInvitation`: recipient-bound, single-use, expiring invitation with issuer, acceptance, revocation, and audit provenance. Tokens are never stored in plaintext.
- `RoomMessage`: room-scoped author, body, creation time, edit state, deletion state, and immutable authorship. Soft removal preserves audit evidence without exposing content.
- `RoomReply`: a message with one parent message in the same room. Cross-room references are invalid.
- `RoomPin`: moderator-visible shared curation referencing one message in the same room.
- `RoomBookmark`: private member curation; never visible to other members or Atlas without explicit action.
- `ModerationEvent`: actor, target, reason category, action, timestamps, and evidence reference. Message bodies are not copied into audit logs.
- `ModerationAppeal`: one appeal per moderation event, reviewer separated from the original action where practical.
- `AtlasInvocation`: explicit member request, disclosed input scope, purpose, status, and model provenance.
- `AtlasOutput`: evidence-linked output, confidence, unknowns, and recipient scope. It is not shared room knowledge by default.
- `PromotedKnowledge`: explicit human decision promoting selected Atlas output or message evidence into shared workspace knowledge.

## Invariants

Every record is workspace-scoped and, where applicable, room-scoped. Membership is checked on every read and write. Room discovery does not exist in the MVP. Invitation possession alone is insufficient without the intended authenticated identity. Atlas receives no ambient room stream. Deleted content cannot reappear through search, summaries, exports, or Atlas context.

## Identity and data minimization

Reuse the existing Executive Identity and Workspace membership. Do not create a parallel profile, reputation score, contact graph, or public identity. A room stores only the identity reference and the minimum role state necessary for authorization.

## Search and indexing

Any search index must retain workspace and room authorization boundaries, deletion state, and retention expiry. Private bookmarks and moderation evidence are excluded from ordinary room search. Search is not approved for the first proof unless its isolation can be demonstrated independently.

## Deletion semantics

Account closure, room archival, message removal, retention expiry, and legal hold are distinct states. Deletion must propagate to derived search and Atlas artifacts. Audit records retain event facts but not removed message bodies unless a documented legal hold requires them.
