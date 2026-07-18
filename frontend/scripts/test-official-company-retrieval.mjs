import assert from "node:assert/strict";
import { retrieveOfficialCompanyFacts } from "../lib/company-intelligence/official-company-retriever.ts";

const publicResolver = async () => [{ address: "93.184.216.34", family: 4 }];
const privateResolver = async () => [{ address: "127.0.0.1", family: 4 }];
const html = `<script type="application/ld+json">${JSON.stringify({ "@type": "Organization", name: "Acme", description: "Official Acme overview" })}</script>`;
let request;
const fetcher = async (url, init) => {
  request = { url: url.toString(), init };
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "content-length": String(new TextEncoder().encode(html).byteLength) } });
};

const result = await retrieveOfficialCompanyFacts({ officialDomain: "acme.example", observedAt: "2026-07-18T10:00:00Z", fetcher, resolver: publicResolver });
assert.equal(request.url, "https://acme.example/");
assert.equal(request.init.redirect, "error");
assert.equal(request.init.cache, "no-store");
assert.match(request.init.headers["User-Agent"], /^ORENDALIS-/);
assert.equal(result.facts[0]?.value, "Official Acme overview");
assert.equal(result.bytes, new TextEncoder().encode(html).byteLength);
assert.equal(result.status, 200);

let fetched = false;
await assert.rejects(() => retrieveOfficialCompanyFacts({ officialDomain: "localhost", fetcher: async () => { fetched = true; return new Response(html); }, resolver: privateResolver }), /public HTTPS/);
assert.equal(fetched, false);
await assert.rejects(() => retrieveOfficialCompanyFacts({ officialDomain: "acme.example", fetcher, resolver: privateResolver }), /public network addresses/);
await assert.rejects(() => retrieveOfficialCompanyFacts({ officialDomain: "acme.example", fetcher: async () => new Response("{}", { status: 200, headers: { "content-type": "application/json" } }), resolver: publicResolver }), /not HTML/);
await assert.rejects(() => retrieveOfficialCompanyFacts({ officialDomain: "acme.example", fetcher: async () => new Response("small", { status: 200, headers: { "content-type": "text/html", "content-length": "2000001" } }), resolver: publicResolver }), /safe extraction limit/);
await assert.rejects(() => retrieveOfficialCompanyFacts({ officialDomain: "acme.example", fetcher: async () => new Response("x".repeat(2_000_001), { status: 200, headers: { "content-type": "text/html" } }), resolver: publicResolver }), /safe extraction limit/);
console.log("Official company retrieval security checks passed.");
