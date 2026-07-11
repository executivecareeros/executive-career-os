# Career Ledger

The ledger is append-only. Corrections append an entry referencing the earlier event. Archive and restore append new events; neither deletes nor overwrites history. Events preserve actor, source, evidence, reason, confidence, correlation, causation, documents, compensation references, and serializable prior/new values.

Future database repositories must preserve ordering and immutability. Agent events must identify agent and run. Sensitive history requires future access control, retention, and export policies. Current records are fictional demo data only.

## Lifecycle, replay, and corrections

Recruitment milestones are optional ISO timestamps. Each populated milestone is represented as a ledger event; missing dates never produce placeholders. Duration helpers calculate only observed intervals.

Archive, restore, and correction UI actions append temporary entries referencing the original with `correctsEntryId` and `causationId`. Career Replay groups by day, month, year, company, opportunity, or application and supports focused historical views.

Typed historical queries cover applications, recruiter interactions, requested and offered compensation, decisions, rejection and decline reasons, Atlas recommendations, CV versions, interviews, employer responses, and comparable demo response times.
