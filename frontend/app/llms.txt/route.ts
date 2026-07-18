const body = `# ORENDALIS

> ORENDALIS is a private executive career platform that helps executives search a global opportunity universe and review evidence-backed guidance from Atlas.

## Public website

- Homepage: https://www.orendalis.com/
- Purpose: executive opportunity discovery and decision support
- Language: English

## Product principles

- Unknown information remains unknown.
- Atlas distinguishes confirmed evidence, estimates, and unanswered questions.
- Private CV, profile, application, and decision data is never public content.
- Opportunity information is attributable to employer-controlled or explicitly identified source records.

## Contact

- Website: https://www.orendalis.com/
`;

export function GET() {
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
