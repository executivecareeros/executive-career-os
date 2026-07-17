# Atlas Decision Workspace

Last updated: 2026-07-17 · Owner: Sol / Atlas Product · Version: `atlas-decision-workspace-v1`

## Purpose

The Atlas Decision Workspace preserves an executive-controlled opportunity journey from first review through terminal decision. It orchestrates existing Orion decisions and Atlas reviews; it adds no reasoning engine, hidden score, or automatic action.

## Workspace contract

The workspace contains an immutable timeline, current decision stage, executive tasks, reviewed evidence collection, investigation status, reassessment records, decision notes, open and completed questions, and decision history.

Every operation returns a new workspace snapshot. Earlier snapshots, reviews, recommendations, confidence statements, Unknowns, and timeline events remain unchanged.

## Authority

Only the executive may change a stage, accept or complete a task, complete a question, add a decision note, or request reassessment. Atlas may suggest a task and produce an explicitly requested reassessment; it never performs actions automatically.

## Current evidence

The deterministic fixture covers all ten workspace objects and all fifteen registered stages, preserving a withheld review and its later evidence-backed reassessment. Live workflow usability remains Unknown until product rendering and consented validation occur.
