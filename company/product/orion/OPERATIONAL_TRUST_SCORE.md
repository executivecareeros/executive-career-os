# Operational Trust Score

Status: Authoritative metric · Version: `orion-operations-v1` · Owner: Sol / Engineering Operations · Last validated: 2026-07-17

## Purpose

Operational Trust Score (OTS) states whether the weakest required connector control is trustworthy. It is an engineering safety metric, not a provider ranking, commercial score, or executive recommendation.

## Method

OTS uses the **weakest measured control**. It does not use arbitrary weights or averages that could hide a failed safety control.

The required components are:

1. Connector health.
2. Replay safety.
3. Certification.
4. Freshness against declared cadence.
5. Failure control.
6. Recovery success.
7. Determinism.

When all seven components have evidence, OTS equals their minimum score. If any component lacks evidence, OTS is `null` with `Insufficient evidence`. A high-performing component cannot compensate for an unsafe replay, failed certification, stale feed, or offline connector.

## Component evidence

- Health: deterministic health-state mapping.
- Replay safety: zero unexpected closures in an evidenced replay.
- Certification: common deployment-readiness gate passed.
- Freshness: latest successful discovery divided by manifest cadence.
- Failure control: successful runs divided by observed runs.
- Recovery success: failed runs followed by a later successful run; no failures yields 100 only when run evidence exists.
- Determinism: replay canonical delta equals zero.

## Interpretation

| Score | Meaning |
|---|---|
| 100 | Every required measured control passed |
| 75 | Weakest control is in a warning or recovering condition |
| 50 | At least one control is degraded |
| 0 | At least one required safety control failed |
| Unknown | One or more required controls lack evidence |

Scores are comparable only within the same OTS version. Formula changes require a new version and preserved historical methodology.

## M3A fixture result

Greenhouse, Lever, Ashby, and Workable each scored 100 in the deterministic two-run certification fixture: deployable probe, passed certification, safe replay, zero canonical delta, freshness within cadence, no failures, and deterministic inventory. This is fixture evidence, not a claim about current live provider health.
