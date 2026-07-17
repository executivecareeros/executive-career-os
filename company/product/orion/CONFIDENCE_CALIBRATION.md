# Confidence Calibration

Last updated: 2026-07-17 · Version: `orion-executive-validation-v1`

Each calibration point retains recommendation ID, predicted confidence, latest verified observed outcome, reviewed validity verdict, and absolute error. Outcome is contextual; the reviewed validity verdict determines whether recommendation confidence is evaluated as supported or unsupported.

Mean absolute calibration error is reported over reviewed Supported/Not Supported judgments. Inconclusive judgments are preserved but excluded. Calibration drift compares earlier and later halves only when at least four points exist. Confidence reliability remains `Insufficient Evidence` below 20 points; at 20 or more it is `Reliable` when mean error is at most 0.15, otherwise `Needs Review`.

No calibration result automatically changes a confidence value, threshold, model, or historical recommendation. Any future calibration change requires reviewed evidence, a versioned decision, validation, and explicit release authority.
