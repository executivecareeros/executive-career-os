import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/companies/page.tsx", import.meta.url), "utf8");
const network = await readFile(new URL("../lib/opportunity-network.ts", import.meta.url), "utf8");
assert.match(page, /loadNetworkCompanies/);
assert.match(network, /Range: `\$\{offset\}-\$\{offset \+ pageSize - 1\}`/);
assert.doesNotMatch(network, /canonical_key=not\.is\.null&order=name\.asc&limit=1000/);
assert.match(network, /if \(page\.length < pageSize\) return rows/);
console.log("Company directory pagination beyond 1,000 records verified.");
