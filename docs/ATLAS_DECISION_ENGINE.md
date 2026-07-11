# Atlas Decision Intelligence Engine

> **Purpose:** Define the deterministic reasoning boundary between Executive Career OS data and any future explanation provider.

## Deterministic Philosophy

Atlas begins with decisions, not generated text. Identical normalized inputs and ruleset versions produce identical structured decisions. Recommendations expose evidence, constraints, conflicts, risks, missing information, confidence factors, reason codes, and a permanent snapshot shape.

Future providers may explain Atlas artifacts, but must not invent, replace, or silently modify decision logic.

## Decision Engine

The engine performs eight explicit operations: collect, normalize, evaluate, score, rank, recommend, explain, and snapshot. It accepts revision-scoped Blueprint context alongside Career Ledger, compensation, opportunity, company, application, discovery, historical decision, and future signal records.

The result is structured data rather than generated prose.

## Evidence

Every recommendation cites typed evidence. Categories include Blueprint, Career Ledger, compensation, company, opportunity, application, discovery, historical decision, principle, objective, market signal, future provider, and unknown. Each item carries weight, confidence, time, source, entity, and a reason code. Ledger-backed evidence retains its ledger reference.

## Confidence

Confidence is deterministic. It combines data completeness, evidence quantity and freshness, known compensation, recruiter, company, opportunity and market state, then applies explicit penalties for conflicts and missing information. The exact factors and impacts remain visible. Results map to Very Low, Low, Moderate, High, or Very High.

## Conflicts

Conflict rules detect salary, travel, exclusions, company size, board, leadership, language, compensation, Blueprint, risk, and career-principle issues as data becomes available. Each conflict identifies severity, evidence, governing constraint, reason code, and possible-resolution code. Atlas never resolves a conflict automatically.

## Career Capital

Career Capital impact is classified as Strong Positive, Positive, Neutral, Negative, or Strong Negative. It is deliberately not reduced to a numeric score. Contributing factors remain explicit.

## Reasoning Chain

Every run records the same visible sequence:

1. Reason
2. Evidence
3. Assessment
4. Conflict Review
5. Confidence
6. Decision
7. Recommendation
8. Snapshot

Each step references its artifacts and completion state. Nothing is hidden behind a narrative response.

## Decision History and Snapshots

A snapshot records timestamp, Blueprint revision, evidence, reasoning chain, confidence, conflicts, normalized input references, recommendation, and engine/ruleset/normalization versions. Future comparisons can therefore identify what changed without rewriting earlier decisions.

## Scenario Engine

Scenarios copy the baseline context, apply explicit changes such as compensation, travel, or country, and run the same deterministic engine again. They compare recommendation categories and reason codes. They do not predict future events.

## LLM Boundary

A future model provider may explain, summarize, create reports, prepare interviews, draft cover letters, or suggest CV improvements from completed snapshots. It must never determine access, alter evidence, resolve conflicts, set confidence, or replace the deterministic recommendation.

## Current Limitations

Sprint 12 uses fictional local demonstration data. Decisions are not persisted, scheduled, or written to the Career Ledger. No AI provider, prompt, chat, API, backend, database, scraping, or browser automation is present.
