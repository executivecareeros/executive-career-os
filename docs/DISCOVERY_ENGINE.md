# Opportunity Discovery Engine

> **Purpose:** Define the source-agnostic foundation for discovering, normalizing, and evaluating executive opportunities.

## Why Source-Agnostic

Executive opportunities appear across corporate career sites, applicant tracking systems, executive search firms, professional networks, referrals, feeds, and manual research. No single source is complete or permanent.

Executive Career OS therefore treats sources as replaceable inputs. Atlas evaluates opportunities, not the systems that published them. Source-specific behavior remains behind connector contracts.

## Normalization

Every connector translates its source record into one canonical Opportunity model through the Opportunity Normalizer. Normalization creates a stable boundary between discovery and career intelligence, allowing scoring, comparison, memory, and decision support to remain independent of source formats.

Normalization must preserve unknown values rather than invent them. It must also retain the original record's provenance and the normalization version used.

## Connector Architecture

A connector has a consistent lifecycle: connect, discover, normalize, report health, and disconnect. Connectors expose typed results, errors, configuration, health, and statistics. They do not place source-specific concepts into Atlas.

Sprint 10 connectors are deterministic demonstration stubs. They make no network requests and contain no credentials, scraping, or browser automation.

## Future Connectors

The connector boundary can accommodate official APIs, verified feeds, corporate websites, job boards, recruiter submissions, referrals, manual imports, and future channels. A new source should require a connector and reliability policy, not changes to Atlas.

## Corporate ATS Support

Corporate applicant tracking systems such as Greenhouse, Lever, Workday, SAP SuccessFactors, SmartRecruiters, Ashby, and ICIMS are represented as independent connectors. Future support should prefer documented, authorized interfaces and preserve the employer's original identifiers and URLs.

## Executive Search Support

Executive search opportunities may be confidential, partially disclosed, or relationship-led. Their connector model must support restricted evidence, recruiter attribution, mandate confidence, and deliberate human verification without weakening privacy.

## Opportunity Provenance

Every normalized opportunity retains its source, connector, discovery time, original URL, original identifier, normalization version, import run, confidence assessment, and evidence. When persistence is enabled, the import will produce a Career Ledger entry so provenance becomes part of permanent career history.

Corrections should append new evidence or ledger events rather than erase the original discovery record.

## Source Reliability and Discovery Confidence

Reliability describes the source category and its expected authority. Discovery confidence describes how strongly the available evidence supports a particular normalized opportunity. Official or direct sources may begin with greater reliability, but completeness, freshness, corroboration, and manual verification still matter.

Confidence must remain explainable. It is not a substitute for executive judgment, and formulas are intentionally deferred.

## Atlas Integration

Atlas consumes only normalized opportunities and their provenance. It should eventually use the Executive Blueprint to shape discovery around preferred countries, industries, compensation, leadership level, travel, languages, company size, ownership, and executive principles.

Atlas must never depend directly on a connector. Typed discovery results and ledger events keep source acquisition separate from analysis, recommendations, and memory.

## Current Boundary

This foundation defines contracts, demonstration adapters, and a dashboard preview. It does not perform live discovery, execute schedules, call APIs, scrape websites, automate browsers, or persist imported records.
