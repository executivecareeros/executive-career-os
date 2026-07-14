# Evidence and Reporting Standard

> Purpose: Standardize how Orendalis proves work, communicates confidence, and prevents fabricated or ambiguous status.

## Evidence Levels

| Level | Meaning | Example |
| --- | --- | --- |
| Observed | Directly inspected in the relevant system or artifact | Deployed page displays the expected state |
| Measured | Produced by a repeatable command, test, or query | Build passed; table count returned |
| Corroborated | Supported by independent sources | Provider UI and public DNS agree |
| Inferred | Reasonable conclusion from evidence, labeled as inference | Likely provider synchronization delay |
| Reported | Stated by a human or provider but not independently verified | Founder reports receiving an email |
| Unknown | Evidence is unavailable or conflicting | Exact delivery latency not exposed |

## Claim Rules

- State source and timestamp for volatile external facts.
- Use exact values for generated provider configuration; never reconstruct them.
- Report failures and warnings alongside successes.
- Distinguish local, staging, and production evidence.
- Screenshots support evidence but do not replace structured validation.
- A clean repository does not prove deployment; a healthy deployment does not prove the user journey.

## Completion Report

Every material completion report includes:

1. outcome and decision;
2. scope completed;
3. files, systems, or records changed;
4. validation performed and results;
5. approvals used;
6. failures, skipped checks, and warnings;
7. residual risks and known limitations;
8. rollback status;
9. commit or revision where applicable;
10. repository or operational state;
11. exact next action or gate.

## Confidence

Use qualitative confidence only when useful:

- **Very High:** direct, repeatable, complete evidence;
- **High:** strong direct evidence with minor limitations;
- **Medium:** partial evidence or meaningful inference;
- **Low:** sparse, indirect, or conflicting evidence.

Confidence never converts an assumption into fact.
