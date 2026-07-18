# Search Taxonomy and Discoverability Evidence — 2026-07-18

## Search trust correction

- Explicit US state codes in provider country fields are grouped under United States.
- Explicit countries in location strings populate Countries and are excluded from Cities.
- Cities contain only the first explicit non-country, non-region location segment.
- Regions use the stable global registry: Worldwide, EU, Europe, EMEA, MENA, APAC, CIS, Africa, North America, and South America.
- Region filtering derives membership from explicit country and location evidence.
- A single filter is sufficient to search.
- Search submission produces visible result-count feedback and moves the executive to results.
- Primary search and opportunity actions provide hover, active, focus, and motion feedback.

## Source trust correction

- Repeated observations from the same provider remain available as canonical provenance.
- User-facing provider labels are deduplicated.
- Atlas source-confidence coverage counts a provider once rather than inflating confidence through repeated observations.

## Public discoverability

- Canonical production identity remains `https://www.orendalis.com`.
- Organization, WebSite, and SoftwareApplication structured data contain only truthful public claims.
- `/llms.txt` gives machine-readable product context without exposing private executive data.
- Robots and sitemap continue to expose only the public acquisition surface.

## Live domain finding

At 2026-07-18 19:57 TRT, `https://www.orendalis.com` returned HTTP 200 from Vercel with valid HSTS. The bare apex returned HTTP 302 to the obsolete `orendalis-com.l.ink` forwarding destination. Correcting that registrar forwarding remains the only domain action in this cycle; mail, Resend, Microsoft 365, and all other DNS records are outside scope.

## Validation

- Executive search regression: pass.
- Public acquisition regression: pass.
- Opportunity Universe regression: pass.
- Opportunity Intelligence regression: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass.
