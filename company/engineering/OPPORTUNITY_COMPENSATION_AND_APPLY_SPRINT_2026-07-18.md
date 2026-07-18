# Opportunity Compensation and Apply Sprint

Date: 2026-07-18  
Governing authority: ODS 4.0 and Founder Backlog

## Outcome

Opportunity cards and Opportunity Review now provide a direct, truthful external application action. Verified employer/ATS records use **Apply on employer site**. A private unverified LinkedIn observation uses **Open source listing** so the product never overstates application authority.

The ingestion boundary now preserves structured provider compensation and conservatively extracts an explicitly published salary range from source descriptions. Extraction requires compensation language, a range, and a currency symbol or code. It never estimates a missing range. A bare dollar symbol preserves the published numbers while leaving currency unconfirmed.

Existing canonical records display that same explicit range immediately from their saved source text, without waiting for the next provider schedule. The next normal refresh persists the structured fields.

When a refreshed provider observation adds compensation to an existing canonical opportunity, the merge upgrades that canonical record without producing a duplicate.

## Validation

- Published compensation extraction: passed, including ambiguous currency and negative cases for revenue figures, experience ranges and non-numeric claims.
- Direct application actions: passed on cards and reviews; external links use `noopener noreferrer`.
- Canonical compensation refresh: passed.
- Opportunity Universe: passed.
- Provider Pack Alpha: passed.
- TypeScript: passed.
- ESLint: passed.
- Production build: passed; 126 routes generated.

## Product-truth boundary

The action opens the employer-controlled or approved ATS source; it does not claim that ORENDALIS submitted an application. Existing records gain newly disclosed compensation only when their provider is refreshed. The authoritative inventory remains 16,102 active canonical opportunities at the latest point-in-time snapshot; no higher inventory count is claimed in this sprint.

## Next measured action

Deploy, run the existing approved provider refresh, then measure compensation completeness and validate the two application actions in the authenticated live journey. Continued employer and opportunity expansion remains active through the existing provider scheduler; no unapproved source was added here.
