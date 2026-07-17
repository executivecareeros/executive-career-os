# Executive Feedback Model

Last updated: 2026-07-17 · Version: `orion-executive-validation-v1`

Structured feedback records Accepted, Rejected, or Deferred; bounded rejection reasons; useful and insufficient recommendation evidence IDs; confidence perception; additional evidence requested; clarity, trust, Unknown-handling, and alternative-quality ratings; and optional baseline/actual research minutes.

Evidence feedback may reference only evidence cited by the immutable recommendation. Rejection reasons require a Rejected response. Time values outside 0–10,080 minutes are rejected.

Free text remains `{ text, reviewStatus }`. Pending text is excluded from canonical learning and metrics interpretation. Reviewed text may be retained as reviewed qualitative evidence but is never automatically converted into a fact, label, confidence change, or training signal.
