# Known Operational Patterns

Status: Versioned deterministic knowledge model · Version: 1.0 · Owner: Engineering Intelligence · Last validated: 2026-07-17

| Pattern | Required evidence | Recommendation | Alternative explanation |
|---|---|---|---|
| Unsafe replay | Measured replay with one or more unexpected closures | Pause activation and inspect lifecycle evidence | A complete snapshot can intentionally close records only when the manifest authorizes it |
| Freshness drift | Cadence ratio above 1.5 | Inspect scheduler, backlog, and latest failure before changing cadence | A deliberately paused schedule produces the same ratio |
| Failure spike | Current failure count is anomalous against at least four prior samples | Search failures by class and code; compare request volume | A larger cohort or temporary provider incident can increase absolute failures |
| Evidence gap | One or more of 14 required operational fields is absent | Collect approved missing evidence; retain Unknown | A certified but inactive connector is expected to lack live evidence |
| Health degradation | Current evidence-derived state ranks below the previous state | Compare freshness, replay, and failure evidence at the transition | A stricter evidence requirement can lower health without provider degradation |

## Knowledge rules

Patterns are code-reviewed, deterministic, versioned, and provider-independent. Each requires explicit evidence, alternatives, and an advisory-only action. New patterns require a reproducible signature and test; conversational observations are not automatically promoted to engineering knowledge.

Known failure and recovery signatures remain the classified failures and recovery events defined by the Engineering Operations Platform. Unknown codes remain Unknown until a repeatable signature is established.
