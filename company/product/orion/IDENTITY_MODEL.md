# Identity Model

Last updated: 2026-07-17 · Version: `orion-knowledge-graph-v1`

Canonical IDs are deterministic and namespaced. Opportunity identity reuses the Coverage Engine's canonical Opportunity ID. Employer identity uses, in order: an explicit provider canonical employer key; a verified employer-controlled domain; otherwise a source-scoped identity.

Names alone never prove that two employers are the same legal entity. Source-scoped employers remain separate until evidence supports reconciliation. External IDs and aliases carry their evidence. Every merge, separation, or pending decision is append-only identity history with candidates, evidence, reasoning, decision time, and outcome. A `Merged` decision without evidence is rejected.

Conflicting identity evidence remains visible. A future legal-entity registry or employer claim can add evidence and a new decision; it may not rewrite prior observations or decision history.
