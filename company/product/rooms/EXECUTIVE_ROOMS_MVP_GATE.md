# Executive Rooms MVP Gate

> Status: Founder approved the bounded invite-only MVP on 2026-07-18. Runtime commit `3974350` is deployed and Ready; the isolated database migration is applied and verified. No room or invitation data has been fabricated.

## Product promise

Executive Rooms are private professional knowledge environments. They are not social media. Topics precede profiles; knowledge precedes engagement; no followers, engagement feed, popularity score, unsolicited direct messages, or silent Atlas monitoring is permitted.

## Five use cases requiring validation

| Use case | Executive outcome | Smallest MVP proof | Validation still required |
|---|---|---|---|
| Confidential opportunity diligence | Executives compare evidence and unknowns before pursuing a role | Invite-only room, topic, sourced messages, pin, explicit `@Atlas summarize` | Five target executives confirm this is safer or faster than email/group chat |
| Industry transition council | Executives exchange current market evidence without a popularity contest | Private room, verified participant identity, searchable history, citations | Participants find one decision-relevant insight and trust its provenance |
| Board readiness circle | Small peer group prepares for board opportunities | Invite-only membership, structured topic, bookmarks, moderated resources | Executives complete one preparation decision without exposing private career data |
| Company diligence room | Executives discuss a canonical company briefing and open questions | Company reference, evidence links, replies, explicit Atlas comparison | Users understand fact versus interpretation and identify one unresolved question |
| Time-boxed executive roundtable | A temporary cohort collaborates then closes predictably | Scheduled room, visible expiry, archive/export controls, deletion workflow | Participants understand retention before joining and accept the close-out behavior |

These remain customer-value hypotheses. The Founder explicitly approved a bounded internal prototype; external invitation or commercial rollout remains gated by real executive validation.

## MVP boundary

In scope: invite-only rooms; owner, moderator and participant roles; topic; join/leave; private history; replies; pins; bookmarks; optional presence; moderation audit; archive; explicit Atlas invocation; source-preserving summary.

Out of scope: public discovery, files, external guests, direct messages, reactions, polls, calendar, permanent public rooms, cross-room search, reputation, recommendation feeds, automatic Atlas monitoring, AI training on room content, protocol-level IRC compatibility.

## Definition of ready

- five use cases validated;
- Founder selects retention/deletion option;
- legal/privacy basis reviewed;
- permission matrix accepted;
- threat model accepted;
- moderation and appeal runbook accepted;
- accessibility journey specified;
- operating cost measured or bounded;
- rollback and deletion semantics accepted.

## Proposed bounded architecture after approval

Reuse existing Supabase, authentication, workspace isolation, RLS, append-only audit, Atlas evidence and Vercel application boundaries. Do not introduce a new provider or realtime dependency for MVP. Polling or deliberate refresh is acceptable until measured executive value justifies realtime infrastructure.

## Cost boundary

Engineering can reuse current infrastructure, but database growth, moderation time, retention storage and realtime cost are Unknown until a bounded prototype is measured. No paid service or material quota increase is approved.

## Rollback

Feature flag Rooms off; deny all room access; preserve security/moderation audit for the approved security retention period; execute participant-content deletion or export according to the selected policy. Rollback must not silently retain content beyond the disclosed rule.

## Founder decisions recorded

1. Bounded invite-only internal prototype: approved.
2. Retention: 90-day bounded room archive; 12-month minimum-body security/moderation audit.
3. Participants: verified Orendalis executive accounts only.
4. Atlas: explicit command only; no scheduled or ambient summaries.
5. Moderation: owner/moderator model approved; room owner is accountable during the internal prototype.

## Runtime evidence

- Atomic room and owner-membership creation.
- Recipient-bound invitations to existing verified executive identities.
- Owner, Moderator and Participant permissions enforced in database functions.
- Row-level room isolation on rooms, memberships, messages, pins, bookmarks, invitations and audit.
- Replies, pins, personal bookmarks, archive and explicit Atlas invocation.
- Source IDs preserved for every Atlas room response; ambient monitoring explicitly disabled.
- Append-only moderation audit with safe metadata only.
- No public discovery, files, guests, DMs, reactions, feeds or new infrastructure.
- Contract test, lint, TypeScript and production build pass.
- Live authenticated `/rooms` validation passes with the correct empty state and creation boundary.
- Staging database validation confirms 7 room tables, 9 controlled functions and 7 row-level isolation policies.
- Initial state is clean: zero rooms, memberships, messages and invitations.
