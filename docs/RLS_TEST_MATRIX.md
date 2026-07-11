# RLS Test Matrix

> Purpose: Define executable authorization expectations for workspace-owned career data.

| Context | Workspace A | Workspace B | Compensation A | Outcome |
|---|---:|---:|---:|---|
| A owner | Allowed | Denied | Allowed | Pass |
| A ordinary active member | Allowed records | Denied | Denied | Pass |
| A compensation-enabled member | Allowed records | Denied | Allowed | Pass |
| A invited inactive person | Denied | Denied | Denied | Pass |
| B owner/member | Denied | Own workspace only | Denied | Pass |
| No membership | Denied | Denied | Denied | Pass |
| Anonymous | No privilege | No privilege | No privilege | Pass |

`npm run test:rls` creates seven fictional identities transactionally, switches to the local authenticated role with distinct JWT subjects, evaluates actual policies, and rolls back. Database privileges deny deletes globally; append-only triggers provide a second immutable-history boundary.

The suite uses equivalent authenticated PostgreSQL contexts rather than Auth HTTP tokens. Full cookie/session tests remain part of the future authentication release.
