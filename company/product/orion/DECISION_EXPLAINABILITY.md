# Decision Explainability

Last updated: 2026-07-17 · Version: `orion-decision-intelligence-v1`

An explainable decision must let an executive answer:

1. What question is Orion helping me decide?
2. Which observed facts support the assessment?
3. Which facts argue against it?
4. What is context rather than a recommendation?
5. What is Unknown or conflicted?
6. What alternative interpretation remains plausible?
7. Why does the confidence level apply?
8. What should I verify next?

Evidence traceability runs from each reason to graph evidence, then to connector, data source, and observation time. A recommendation is ineligible if required evidence is absent. Exposing an evidence gap is preferable to a fluent but unsupported explanation.

Explainability coverage measures assessments containing a summary, disclosed Unknowns, next actions, and all five gate results. It does not measure writing quality or executive usefulness; those require live executive validation.
