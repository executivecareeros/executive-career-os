# Executive Rooms Specification

## Access modes

- Atlas- and ORENDALIS-managed rooms are always **Open** to every signed-in, verified executive.
- An executive-created room can be **Open** or **Invitation Only**.
- Invitation-only rooms are absent from the public room directory until membership is accepted.
- Owners can create cryptographically random invitation links. Only a SHA-256 digest is stored; the secret is shown once, expires within 30 days, has a bounded use count, and can be revoked.
- Invitation secrets use the URL fragment so they are not transmitted in the initial page request or ordinary server logs.
- Access mode and permanence are separate: an invitation-only room is still temporary until the Founder approves permanence.

> Status: Governing product specification with implemented MVP evidence. Rooms are professional knowledge environments, not social media.

## Principles

Rooms before profiles. Topics before popularity. Knowledge before engagement. No algorithmic feed, follower economy, influencer mechanics, vanity metrics or required direct-message network.

## Scope

The active MVP is an open directory for signed-in, verified ORENDALIS executives. Any verified executive may join an active room. Executive-created rooms begin as temporary, require a stated purpose, language and permanence reason, and become permanent only after a Founder decision. Owner/moderator/participant roles, topics, participant list, live presence, join, history, archive, pins, bookmarks, replies, moderation audit and explicit Atlas invocation are implemented. Private/invite-only modes, polls, scheduling, files, Markdown, reactions, Room Wiki, FAQs, Best Answers, resources, themes and milestones remain later governed scope.

ORENDALIS-managed rooms default to English. Creators may select any room language; the selected language is visible before joining. The Local Services Marketplace requires each top-level request or recommendation to include service category, city and country.

Modern service mapping: NickServ→Executive Identity; ChanServ→Room Management; MemoServ→Notifications; WHOIS→Executive Profile; bots→Atlas Assistants; modes→Room Settings; operators→Platform Administrators; MOTD→Founder/platform announcements.

## Permission and safety model

- Anonymous access is denied. Active-room discovery and joining are open only to authenticated, verified executives; content and actions remain protected by membership and RLS.
- Owner cannot bypass platform safety/audit rules.
- Moderation actions are append-only and appeal-capable.
- Presence is optional and privacy-preserving; only current aggregate state is exposed.
- Files require malware/type/size/retention controls.
- Search respects room visibility at query time.
- Cross-room knowledge requires explicit source-room permission and preserves provenance.
- Legal/privacy/retention/threat modelling is a Founder gate before build.

## Atlas and Room Intelligence

Allowed only by explicit command (`@Atlas summarize`, `meeting-notes`, `compare-companies`, `opportunities`, `companies-mentioned`, `create-wiki`, `export`) or approved schedule. Moderator-authorized promotion creates versioned knowledge with sources, confidence, author/moderator and revision history. Atlas cannot silently monitor or train on room content.

## IRC compatibility

The product preserves the mental model—not protocol-level compatibility. Actual IRC protocol/client compatibility is **Unknown** and requires a separate Founder decision because it affects identity, moderation, security and maintenance.

## MVP governance and acceptance

Founder approval was granted for the open verified-executive model, temporary-to-permanent governance, ten Atlas-administered English rooms, language selection and structured local-service classification. Atlas administration is a platform label and never impersonates a human identity; Atlas still cannot monitor room content silently. Remaining acceptance requires a real multi-executive conversation, mobile/keyboard review, moderation exercise, retention exercise and Founder review of the permanence alert flow.
