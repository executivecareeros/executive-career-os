# Decision Outcome Model

Last updated: 2026-07-17 · Version: `orion-executive-validation-v1`

Supported outcomes are Applied, Declined, Interviewed, Offer Received, Offer Accepted, Opportunity Withdrawn, and Outcome Unknown. Each append-only event records occurrence time, recording time, verification state, and evidence references. Executive-confirmed or system-observed outcomes require evidence; unverified outcomes remain explicitly unverified.

Outcomes are separate from recommendation acceptance and reviewed validity. An offer may follow an unsupported recommendation; a rejection may follow a well-supported recommendation. The platform reports outcome distribution and follow-up coverage without causal attribution.

Recommendation validity is established only by a separate reviewed judgment—Supported, Not Supported, or Inconclusive—with evidence, reasoning, reviewer type, and review time.
