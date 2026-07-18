# Founder Decision Log

> Purpose: Preserve material company decisions and their reasoning.

## Entry template

- Date:
- Decision:
- Owner:
- Context:
- Alternatives considered:
- Evidence:
- Risks and trade-offs:
- Revisit trigger:
- Outcome:

## Foundational decisions

- Executive Career OS creates the Career Intelligence Platform category.
- Trust, explainability, and permanent historical memory precede autonomous capability.
- Atlas augments executive judgment and never owns the final decision.

## 2026-07-19 — Controlled production launch authorized

- Date: 2026-07-19
- Decision: Activate ORENDALIS production for controlled use by consented real executives.
- Owner: Founder
- Context: The canonical production deployment, apex redirect, `www` hostname, TLS, public acquisition routes, authentication boundaries and launch-critical build were verified. The Founder explicitly approved go-live.
- Alternatives considered: Remain in internal testing; delay until all residual hardening work is complete; controlled launch with measured acceptance.
- Evidence: Production revision `9beaf3d`; Vercel deployment Ready; live domain and TLS audit; passed build, lint and targeted product tests; `PRODUCTION_LAUNCH_RECORD_2026-07-19.md`.
- Risks and trade-offs: Real-executive activation, signed-in performance, mobile continuity, recovery alerts and authorization require cohort evidence. Controlled launch yields that evidence without claiming full acceptance prematurely.
- Revisit trigger: First consented executive completes the journey, or any security, availability, privacy or material runtime incident occurs.
- Outcome: Production activated; controlled executive acceptance is the next release gate.
