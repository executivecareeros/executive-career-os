# Decision Protocol

> Purpose: Ensure material Orendalis decisions are explainable, owned, reviewable, and preserved.

## A Decision Record Is Required When

- architecture or data boundaries change;
- a provider, recurring cost, contract, or external dependency is introduced;
- security, privacy, retention, authentication, or authorization changes;
- a product principle, roadmap direction, category, brand, or customer promise changes;
- production, public availability, or irreversible action is approved;
- a meaningful alternative is rejected for durable reasons;
- an exception to ODS is granted.

## Decision Standard

Record:

1. decision and accountable owner;
2. context and desired outcome;
3. verified facts;
4. assumptions and unknowns;
5. alternatives considered, including no action;
6. benefits, costs, risks, and trade-offs;
7. security, privacy, customer, operational, and financial implications;
8. evidence and confidence;
9. approval and date;
10. implementation conditions;
11. reversal or migration path;
12. review date or revisit trigger.

## Decision Quality

A decision is not improved by hiding uncertainty. Prefer a reversible experiment when evidence is weak. Do not confuse consensus with accountability or urgency with importance.

## Location

- architecture decisions: `docs/adr/`;
- founder and company decisions: `company/founders/DECISION_LOG.md` or the designated decision record;
- operational approvals: the relevant operations or release record;
- protocol exceptions: `company/protocols/PROTOCOL_GOVERNANCE.md` and the affected work record.

Never create a second authoritative register for the same decision class.
