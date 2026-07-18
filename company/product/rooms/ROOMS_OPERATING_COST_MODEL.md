# Executive Rooms Operating Cost Model

Status: measurement design; no paid service approved.

## MVP cost boundary

Use the existing application, Supabase database, authentication, RLS, audit, and Atlas invocation path. Do not add a realtime, search, notification, moderation, or analytics vendor for the first proof. Atlas cost is zero unless a member explicitly invokes it.

## Measures

Measure stored messages and derived bytes per active room, read/write operations per active member, retained moderation evidence, notification volume, explicit Atlas invocations and tokens, deletion work, and human moderation minutes.

## Approval thresholds

Founder approval is required before a new paid provider, material infrastructure tier change, contractual commitment, or materially higher personal-data processing scope. A prototype must report cost per active room, cost per active executive, and cost per explicit Atlas-assisted decision before broader rollout.

## Efficiency rules

Archive inactive rooms, apply the approved retention policy, paginate history, avoid ambient embeddings and summaries, and batch non-urgent notifications. Cost reduction may never weaken authorization, deletion, moderation, or audit controls.
