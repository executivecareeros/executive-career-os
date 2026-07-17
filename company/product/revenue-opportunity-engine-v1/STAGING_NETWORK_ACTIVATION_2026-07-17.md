# Staging Network Activation — 2026-07-17

> Historical activation snapshot. It is superseded for current state by [`../orion/ORION_EXECUTION_STATUS.md`](../orion/ORION_EXECUTION_STATUS.md). The zero-schedule state below describes the pre-activation moment and is retained as audit evidence.

## Verified State

- Staging project: `orendalis-staging`
- Geographic profile migration `202607170001`: applied
- Durable ingestion migration `202607170002`: applied
- Ingestion tables: present
- Row-level security: enabled
- Workspace-isolation policies: present
- Atomic queue claim function: present
- Provider schedules created: 0
- Live opportunities ingested by this activation: 0
- Production changes: none

## Coverage Strategy

The active network strategy is `tmci-geography-v1`. TMCI measures the global Opportunity Network independently from Founder or executive profile data. Missing regions score zero, and remote scope remains unknown unless source evidence defines its geographic boundary.

## Current Approval Gate

The durable database boundary is ready, but it does not execute autonomously. The next activation step requires a dedicated server-only scheduler credential to be stored in Vercel and used by an authenticated scheduled route. The credential must never enter Git, browser code, reports, or chat.

No provider source will be marked live until a scheduled run creates real run evidence and canonical inventory in staging.
