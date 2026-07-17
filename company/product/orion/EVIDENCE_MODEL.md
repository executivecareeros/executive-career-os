# Evidence Model

Last updated: 2026-07-17 · Version: `orion-knowledge-graph-v1`

Every graph assertion answers: what is known, how it is known, who supplied it, when it was observed, confidence and basis, and whether it can be reproduced.

Evidence is append-only and contains a source record identity, connector, data source, observation and recording times, bounded facts, confidence, and an optional reproduction reference. Assertions group all observed values for one entity field. One value is `Supported`; multiple values are `Conflicted`; an explicit null is `Unknown`. Conflicts retain all values and their evidence—newer evidence does not erase older evidence.

Confidence describes support for the assertion, not employer quality or business desirability. Atlas may explain evidence but may not convert absent evidence into certainty. Raw connector payloads are deliberately excluded from the Atlas knowledge view.
