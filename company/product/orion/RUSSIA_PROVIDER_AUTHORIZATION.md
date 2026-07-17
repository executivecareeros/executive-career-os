# Russia Provider Authorization

Last reviewed: 2026-07-18 · Status: Founder and provider authorization required

## Proposed source

HeadHunter's official vacancy API is the strongest structured candidate for closing the verified Russia coverage gap. Vacancy search and vacancy detail are documented API capabilities, and the API supports registered application and OAuth authorization models.

## Why activation is gated

HeadHunter's published API terms state that an application must not enable extraction of data to form another database that is made available to other persons. Orendalis operates an executive opportunity network, so enabling persistent vacancy ingestion without written provider confirmation would create material contractual uncertainty. The integration must not be activated on the assumption that public technical access equals permission for this use.

## Required authorization

1. Founder approval to register Orendalis as a HeadHunter developer application and accept the applicable API terms.
2. Written HeadHunter confirmation, partnership permission, or a commercial agreement explicitly permitting Orendalis to ingest, retain, refresh, canonicalize, and present vacancy records in its opportunity network.
3. Confirmation of rate limits, retention/deletion requirements, attribution and logo rules, permitted territories, commercial-use conditions, and any required user or application OAuth flow.
4. Security review before storing an application credential. No applicant, résumé, message, or employer-account personal data is in the proposed scope.

## Cost and obligations

- Published price for the proposed usage: unavailable; do not estimate.
- Expected immediate cost: unknown until HeadHunter responds.
- Operational obligations: application registration, OAuth where required, correct User-Agent and attribution, rate-limit handling, archival/deletion synchronization, provider health monitoring, and compliance with written usage scope.

## Recommendation

Do not activate. Founder should authorize a provider inquiry and application registration only after reviewing the terms. Request written permission for a read-only, vacancy-only, provenance-preserving commercial integration. Continue global expansion through already approved providers while the inquiry is pending.

## Primary sources

- [HeadHunter API documentation](https://github.com/hhru/api)
- [Official authorization documentation](https://github.com/hhru/api/blob/master/docs/authorization.md)
- [Official vacancy documentation](https://github.com/hhru/api/blob/master/docs/vacancies.md)
- [HeadHunter API service terms](https://dev.hh.ru/admin/developer_agreement)
