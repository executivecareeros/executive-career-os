# Executive Rooms MVP Gate

> Status: Founder gate in preparation. No room data, users, schema, provider, deployment, or production behavior exists.

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

These are hypotheses, not validated customer evidence. Implementation remains gated until the Founder accepts the validation evidence or explicitly approves a bounded internal prototype.

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

## Founder decisions required before runtime implementation

1. Approve a bounded invite-only internal prototype using the five use cases above.
2. Select retention option in `ROOMS_RETENTION_AND_DELETION.md`.
3. Confirm verified Orendalis executive accounts are the only MVP participants.
4. Confirm Atlas is command-only, with no scheduled summaries in MVP.
5. Accept the moderation/appeal ownership model and name the accountable human moderator.

