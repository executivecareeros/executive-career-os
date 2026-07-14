# Documentation Protocol

> Purpose: Keep Orendalis records authoritative, concise, current, safe, and historically truthful.

## Document Classes

- **Constitution and policy:** governing principles and mandatory rules;
- **Decision:** context, alternatives, approval, and revisit conditions;
- **Architecture:** current design, boundaries, and rationale;
- **Runbook:** controlled operational procedure;
- **Register:** authoritative current-state inventory;
- **Report:** evidence and outcome from a defined review or operation;
- **History:** immutable record of what occurred;
- **Plan and backlog:** proposed future work, not current fact.

## Authority

Each subject has one authoritative current-state record. Supporting reports may point to it but must not create competing registers. Historical documents are preserved and marked superseded rather than silently rewritten.

## Required Metadata

Material records state purpose, owner or authority, status, date or review cadence, scope, and links to related authoritative records where useful.

## Writing Standard

Use professional plain language. Separate current fact, historical fact, estimate, proposal, and unknown. Avoid hype, temporary conversational context, unexplained acronyms, and claims unsupported by evidence.

## Safety

Do not record secrets, credentials, recovery codes, private tokens, full personal identifiers, confidential message bodies, or unnecessary personal data. Use safe metadata and redaction.

## Change Rules

- update documentation in the same coherent change when facts change;
- preserve decision and audit history;
- add superseded notes and authoritative links to stale records;
- validate Markdown, links, duplicates, secret patterns, and repository scope;
- do not claim future or partial work as completed;
- use absolute dates for time-sensitive facts.

## Review

Review protocols and policies quarterly; runbooks after incidents and provider changes; registers when state changes; architecture with material design changes; and release records at closure.
