# Engineering Reasoning Model

Status: Authoritative reasoning contract · Version: 1.0 · Owner: Engineering Intelligence · Last validated: 2026-07-17

## Evidence hierarchy

1. **Observed:** values and events present in versioned operations snapshots.
2. **Inferred:** a bounded interpretation supported by observed measurements and stated as inference.
3. **Unknown:** a required fact is absent, invalid, contradictory, or below the module’s minimum sample requirement.

M4 recommendations use observed evidence. Alternative explanations are hypotheses for human investigation, not inferred facts.

## Trend reasoning

Three samples are the minimum. Direction requires a meaningful change threshold and is qualified by directional consistency. Confidence increases only with sample count and consistency. Two samples cannot establish a trend.

## Anomaly reasoning

Five samples are the minimum. The current measurement is compared with the prior median and median absolute deviation. This robust method avoids treating a single earlier outlier as the baseline.

## Recommendation reasoning

A known pattern must match deterministic evidence. The output then states:

- the observations that matched;
- exact supporting measurements;
- confidence derived from evidence sufficiency;
- plausible alternatives;
- a reversible investigation action; and
- expected operational impact.

If the pattern cannot be evaluated, no conclusion is generated. Missing evidence produces the evidence-gap pattern rather than a guessed diagnosis.

## Prohibited reasoning

Never infer provider intent, legal status, employer identity, credential validity, root cause, complete-feed semantics, or live production health from fixtures, silence, correlation, or an averaged score.
