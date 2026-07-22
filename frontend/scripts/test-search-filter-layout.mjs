import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("components/opportunities/live-opportunity-universe.tsx", "utf8");

assert.match(source, /fieldset className="min-w-0/, "Filter fieldsets must be allowed to shrink inside the responsive grid.");
assert.match(source, /className="w-0 min-w-0 flex-1 rounded-lg/, "Filter controls must not impose an intrinsic width on neighboring fields.");
assert.match(source, /className="shrink-0 rounded-lg border/, "Add buttons must remain inside their own filter field.");

console.log("Search filter responsive layout checks passed.");
