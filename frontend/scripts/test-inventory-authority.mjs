import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../company/product/orion/${path}`, import.meta.url), "utf8");
const [snapshot, execution, factory] = await Promise.all([
  read("AUTHORITATIVE_INVENTORY_SNAPSHOT.md"),
  read("ORION_EXECUTION_STATUS.md"),
  read("OPPORTUNITY_FACTORY_STATUS.md"),
]);

assert.match(snapshot, /Snapshot version: `orion-inventory-\d{4}-\d{2}-\d{2}-\d{2}`/);
assert.match(snapshot, /Active canonical opportunities \| 16,102/);
assert.match(snapshot, /current live count is \*\*Unknown\*\*/i);
assert.match(execution, /AUTHORITATIVE_INVENTORY_SNAPSHOT\.md/);
assert.match(execution, /16,102 active at the latest authoritative measured checkpoint/);
assert.match(factory, /earlier audited baseline/);
assert.match(factory, /supersedes the inventory row above/);

console.log("PASS authoritative inventory contract");
