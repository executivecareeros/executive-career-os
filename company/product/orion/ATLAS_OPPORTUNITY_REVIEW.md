# Atlas Opportunity Review

Last updated: 2026-07-17 · Owner: Sol / Atlas Product · Version: `atlas-opportunity-review-v1`

## Purpose

Atlas Opportunity Review turns one existing Orion Opportunity Intelligence assessment into concise, evidence-backed executive decision support. It introduces no new reasoning, scoring, graph, or evidence model.

## Canonical review

Every review contains Executive Summary, Recommendation or Recommendation Withheld, Opportunity Overview, Employer Overview, Evidence Summary, Confidence Statement, Known Unknowns, Conflicting Evidence, Reasons to Pursue, Reasons for Caution, Suggested Next Investigations, and Decision Summary.

Each section references one or more M9 experience objects. Every reference resolves inside the review, every evidence ID remains within the source assessment, and every section states its decision purpose.

## Recommendation boundary

Atlas creates a Recommendation object only when the assessment is eligible and all five M6 gates pass. Otherwise the review state is `Recommendation Withheld`, no Recommendation object exists, and Atlas explains the missing evidence, uncertainty, conflicts, and next investigation.

## Current evidence

The deterministic fixture validates one eligible and one withheld review. Both completed all twelve sections with traceable evidence in an estimated two-minute average. These are contract results, not live executive outcomes.
