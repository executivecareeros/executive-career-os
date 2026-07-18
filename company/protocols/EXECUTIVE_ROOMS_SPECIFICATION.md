# Executive Rooms Specification

> Status: Product specification; no implementation claim. Rooms are professional knowledge environments, not social media.

## Principles

Rooms before profiles. Topics before popularity. Knowledge before engagement. No algorithmic feed, follower economy, influencer mechanics, vanity metrics or required direct-message network.

## Scope

Permanent/temporary and public/private/invite-only/verified-executive rooms; owner/moderator/participant roles; topics; participant list; presence/Away/DND; join/leave; searchable history; archive; pins; bookmarks; notifications; polls; scheduling; files; Markdown; reactions; replies/quotes; moderation/audit; directory/favorites; Room Wiki, FAQs, Best Answers, resources, themes and milestones.

Modern service mapping: NickServ→Executive Identity; ChanServ→Room Management; MemoServ→Notifications; WHOIS→Executive Profile; bots→Atlas Assistants; modes→Room Settings; operators→Platform Administrators; MOTD→Founder/platform announcements.

## Permission and safety model

- Deny by default; visibility, membership and content access are separate permissions.
- Owner cannot bypass platform safety/audit rules.
- Moderation actions are append-only and appeal-capable.
- Presence is optional and privacy-preserving.
- Files require malware/type/size/retention controls.
- Search respects room visibility at query time.
- Cross-room knowledge requires explicit source-room permission and preserves provenance.
- Legal/privacy/retention/threat modelling is a Founder gate before build.

## Atlas and Room Intelligence

Allowed only by explicit command (`@Atlas summarize`, `meeting-notes`, `compare-companies`, `opportunities`, `companies-mentioned`, `create-wiki`, `export`) or approved schedule. Moderator-authorized promotion creates versioned knowledge with sources, confidence, author/moderator and revision history. Atlas cannot silently monitor or train on room content.

## IRC compatibility

The product preserves the mental model—not protocol-level compatibility. Actual IRC protocol/client compatibility is **Unknown** and requires a separate Founder decision because it affects identity, moderation, security and maintenance.

## MVP acceptance gate

Before implementation: five validated executive use cases; privacy/retention/legal decision; threat model; permission matrix; moderation runbook; data model; accessibility; operating cost; rollback/deletion semantics; Founder approval. MVP then proves room lifecycle, invite-only access, moderation audit, history/search permissions and explicit Atlas invocation without vanity mechanisms.
