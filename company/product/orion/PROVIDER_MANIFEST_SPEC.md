# Provider Manifest Specification

**Status:** Active · **Owner:** Opportunity Coverage Engine · **Schema version:** 1.0 · **Effective:** 2026-07-17

## Purpose

The manifest declares provider behavior that was previously repeated in adapters. It is configuration, not authority: an approved manifest does not bypass legal, contractual, security, production, or founder gates.

## Required sections

| Section | Required facts |
|---|---|
| `version` | Manifest schema version. Current value: `1.0`. |
| `identity` | Stable provider ID, display name, reliability category, factual description. |
| `access` | Approved access model, HTTPS endpoint origins, request timeout. |
| `pagination` | `none` or bounded `offset`, including page size and parameter names. |
| `fields` | Provider paths/evidence for source ID, title, employer ID/name, location, compensation, and publication time where available. |
| `timestamps` | Whether publication time is provider-supplied or unavailable; discovery time is collection time. |
| `lifecycle` | Incremental or complete-when-untruncated snapshot; provider or employer-feed scope. |
| `retry` | Explicit retryable HTTP statuses and stable error codes. |
| `reliability` | Rating, numeric score, and evidence-based rationale. |
| `capabilities` | Jobs is mandatory; companies is optional. |
| `scheduler` | Whether scheduling is supported and the default cadence. |

## Validation invariants

- identity and provider source IDs match;
- every endpoint origin is valid HTTPS;
- timeout, page size, cadence, and reliability scores are bounded;
- retry statuses are explicit;
- the jobs capability is present;
- complete snapshots do not imply completeness when the configured result limit truncates the source;
- field declarations describe source evidence and never authorize guessing;
- manifest version changes require backward-compatibility review.

## Current manifests

Greenhouse, Lever, Ashby, and Workable have version 1.0 manifests. Greenhouse and Workable declare incremental lifecycle behavior because their current contracts do not prove complete-inventory semantics. Lever declares offset pagination at a maximum of 100 records per page and employer-feed lifecycle scope. Ashby declares a single public listing response and employer-feed lifecycle scope.

## Change control

A provider manifest change requires connector and common certification tests. Changes to access model, endpoint origin, legal status, personal-data handling, or material cost require the relevant ODS gate. A mapping correction must preserve prior source evidence and must not silently rewrite canonical history.
