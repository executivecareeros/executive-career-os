# Executive Decision Intelligence

Last updated: 2026-07-17 · Owner: Sol · Version: `orion-decision-intelligence-v1`

## Purpose

Executive Decision Intelligence transforms the Employment Knowledge Graph into explainable decision support. It does not choose for an executive. It establishes what is known, what supports or challenges a course of action, what remains Unknown, and what evidence should be collected next.

## Five gates

Every recommendation must improve decision quality, be fully explained, cite graph evidence, expose measurable confidence, and increase executive trust. If any gate fails, Atlas returns `Do not recommend` and an evidence-collection action.

## Reusable domains

| Domain | Decision supported | Current foundation |
|---|---|---|
| Opportunity Intelligence | Whether an opportunity deserves further investigation | Opportunity, employer, role, source evidence |
| Employer Intelligence | How much employer diligence is required | Employer identity, opportunity relationship, conflicts |
| Compensation Intelligence | What compensation is known and must be clarified | Explicit range, currency, opportunity relationship |
| Career Progression Intelligence | Whether a move represents progression or trade-off | Requires verified career sequence and scope evidence |
| Market Intelligence | What observed market patterns support | Requires representative scope and multiple independent employers |
| Executive Fit Intelligence | Which evidenced alignments and gaps matter | Requires confirmed executive context and explicit comparisons |

The first three domains are supported by the certification fixture. The final three deliberately remain `Insufficient Evidence` in that fixture. No title-based seniority, market generalization, compensation estimate, eligibility assumption, or personal-fit guess is permitted.

## Decision contract

Every assessment contains summary, supporting evidence, confidence and method, known facts, Unknowns, alternative interpretations, reasons for, reasons against, context, suggested next actions, all five gate results, and recommendation eligibility.

## Reuse

One contract can serve opportunity detail, company profile, ranked opportunities, application decisions, Blueprint, Career Ledger, market briefing, negotiation preparation, and future Atlas conversations without domain-specific opaque scores.
