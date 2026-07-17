# Decision Confidence Model

Last updated: 2026-07-17 · Version: `orion-decision-intelligence-v1`

Decision confidence is deterministic and conservative. It is not a weighted attractiveness score.

| Level | Rule |
|---|---|
| Unknown | No cited evidence |
| Low | Any required evidence/context is missing, or any relevant assertion conflicts; score cannot exceed 49 |
| Moderate | All requirements present but the weakest cited evidence is below 75 |
| High | All requirements present, no unresolved conflict, weakest cited evidence is at least 75 |
| Very High | High conditions plus at least two independent sources and weakest cited evidence at least 90 |

The numeric value, when present, equals the weakest cited evidence—not an average. Strong evidence cannot hide a weak required input. Confidence describes support for the decision assessment, not the probability of receiving an offer or achieving a career outcome.

Unknown remains Unknown. More recent evidence does not silently erase conflicting history. Live calibration requires measured executive outcomes and is outside M6.
