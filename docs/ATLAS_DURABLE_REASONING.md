# Atlas Durable Reasoning

> Purpose: Define how deterministic Atlas reasoning uses and preserves beta-user evidence.

Atlas loads the active Blueprint revision, confirmed professional history, selected opportunity, company context, and optional compensation records from the authenticated Workspace. It does not import demonstration inputs.

The persisted snapshot records normalized input, evidence record IDs, the Blueprint revision, opportunity, compensation references, ruleset and engine versions, input hash, conflicts, trade-offs, questions, alternatives, confidence, recommendation, unknowns, and what would change the recommendation. Missing values remain unknown. Currency values are not converted.

The snapshot stores explanation artifacts and rule outputs, not hidden chain-of-thought. Finalization rejects a snapshot whose Blueprint or opportunity references do not match the current decision request.
