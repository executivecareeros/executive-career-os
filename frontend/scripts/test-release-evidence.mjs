import assert from "node:assert/strict";
import { currentReleaseEvidence, PRODUCT_RELEASE } from "../lib/release-evidence.ts";

assert.equal(PRODUCT_RELEASE, "0.9");
assert.equal(currentReleaseEvidence({}), "0.9");
assert.equal(currentReleaseEvidence({ VERCEL_GIT_COMMIT_SHA: "abcdef1234567890" }), "0.9+abcdef123456");
assert.equal(currentReleaseEvidence({ VERCEL_GIT_COMMIT_SHA: "  ", GITHUB_SHA: "1234567890abcdef" }), "0.9+1234567890ab");

console.log("Release evidence checks passed.");
