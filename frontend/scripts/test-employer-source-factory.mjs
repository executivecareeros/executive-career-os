import assert from "node:assert/strict";
import { prepareEmployerSourceBatch, registerEmployerSourceBatch, scheduleRowsForEmployerSources, validateEmployerSourceBatch } from "../lib/discovery/employer-source-factory.ts";

const batch = prepareEmployerSourceBatch([
  { employerName: "Acme Global", employerDomain: "https://www.acme.example/about", careersUrl: "https://careers.smartrecruiters.com/Acme/?tracking=ignored#jobs", country: "Netherlands", operatingRegions: ["European Union", "European Union"], industry: "Enterprise SaaS", refreshMinutes: 360 },
  { employerName: "Acme duplicate", careersUrl: "https://careers.smartrecruiters.com/Acme/" },
  { employerName: "Greenhouse Employer", careersUrl: "https://job-boards.greenhouse.io/greenhouse-employer" },
  { employerName: "Unsupported", careersUrl: "https://127.0.0.1/jobs" },
  { employerName: "Insecure", careersUrl: "http://jobs.lever.co/insecure" },
]);
assert.equal(batch.prepared.length, 2); assert.equal(batch.duplicateInputs, 1); assert.equal(batch.failures.length, 2);
assert.equal(batch.prepared[0].providerId, "smartrecruiters"); assert.equal(batch.prepared[0].employerDomain, "acme.example");
assert.equal(batch.prepared[0].careersUrl, "https://careers.smartrecruiters.com/Acme"); assert.deepEqual(batch.prepared[0].operatingRegions, ["European Union"]);
for (const source of batch.prepared) source.provider.health = async () => ({ source: source.providerId, status: "connected", checkedAt: "2026-07-17T12:00:00Z", message: "Connected" });
const validated = await validateEmployerSourceBatch(batch, 2);
assert.equal(validated.validated.length, 2); assert.equal(validated.failures.length, 2, "One invalid source must not block valid employers");
const rows = scheduleRowsForEmployerSources({ workspaceId: "workspace", actorId: "actor", now: "2026-07-17T12:00:00Z", sources: validated.validated });
assert.equal(rows.length, 2); assert.equal(rows[0].enabled, true); assert.equal(rows[0].locator.companyName, "Acme Global");
assert.deepEqual(rows[0].filters.countries, [], "Collection inventory must remain global rather than Founder-filtered");
const requests = [];
const client = { request: async (path, init) => { requests.push({ path, init }); return { data: [rows[0]] }; } };
const first = await registerEmployerSourceBatch(client, { workspaceId: "workspace", actorId: "actor", now: "2026-07-17T12:00:00Z", sources: validated.validated });
assert.deepEqual(first, { requested: 2, inserted: 1, unchanged: 1 });
assert.equal(JSON.parse(requests[0].init.body).length, 2);
assert.match(requests[0].path, /on_conflict=workspace_id,provider_id,source_key/);
assert.match(requests[0].init.headers.Prefer, /resolution=ignore-duplicates/);
const secondClient = { request: async () => ({ data: [] }) };
const replay = await registerEmployerSourceBatch(secondClient, { workspaceId: "workspace", actorId: "actor", now: "2026-07-17T12:00:00Z", sources: validated.validated });
assert.deepEqual(replay, { requested: 2, inserted: 0, unchanged: 2 }, "Repeated bulk onboarding must be idempotent");
console.log(JSON.stringify({ message: "Employer source factory checks passed.", prepared: batch.prepared.length, isolatedFailures: batch.failures.length, duplicateInputs: batch.duplicateInputs, idempotentReplay: replay.inserted === 0, conflictSafeAtScale: true }, null, 2));
