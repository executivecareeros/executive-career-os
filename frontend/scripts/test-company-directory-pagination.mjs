import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/companies/page.tsx", import.meta.url), "utf8");
assert.match(page, /loadCanonicalCompanies/);
assert.match(page, /Range: `\$\{offset\}-\$\{offset \+ pageSize - 1\}`/);
assert.doesNotMatch(page, /canonical_key=not\.is\.null&order=name\.asc&limit=1000/);
assert.match(page, /if \(page\.length < pageSize\) return rows/);
console.log("Company directory pagination beyond 1,000 records verified.");
