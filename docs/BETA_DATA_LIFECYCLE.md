# Beta Data Lifecycle

> Purpose: Define the implemented beta boundary for export, closure, deletion, consent withdrawal, and retention.

The product provides supervised request submission and visible status. It does not promise immediate hard deletion.

| Data class | Default treatment |
|---|---|
| Mutable profile, opportunity, notes, and settings | Eligible for correction, export, archive, or deletion after identity verification and dependency review |
| Append-only Blueprint revisions, decisions, and Career Ledger | Preserved as historical record; correction is appended |
| Security and workflow audit | Retained for integrity and incident review under the approved retention policy |
| Legally retained records | Retained only when a documented obligation applies |
| Anonymized aggregate | May remain only after re-identification risk review |

Active duplicate requests of the same type are rejected. Founder review must record disposition and any retention exception. Automated export packaging and destructive execution are not yet accepted; request intake is the implemented safe boundary.
