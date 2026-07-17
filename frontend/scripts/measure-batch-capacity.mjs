import { performance } from "node:perf_hooks";

const batchSize = 100;
const sizes = [10_000, 100_000, 1_000_000];
const results = [];
for (const records of sizes) {
  const started = performance.now();
  const cpuStarted = process.cpuUsage();
  let bytes = 0;
  let peakHeap = process.memoryUsage().heapUsed;
  for (let offset = 0; offset < records; offset += batchSize) {
    const count = Math.min(batchSize, records - offset);
    const batch = Array.from({ length: count }, (_, index) => ({ domainId: `opportunity-${offset + index}`, company: { canonicalKey: `employer-${Math.floor((offset + index) / 100)}`, name: `Employer ${Math.floor((offset + index) / 100)}` }, title: "Vice President Sales", country: "Germany", industry: "Enterprise Software", status: "Discovered", payload: { sources: [{ id: "greenhouse", originalId: `source-${offset + index}` }], fingerprint: `fingerprint-${offset + index}` } }));
    bytes += Buffer.byteLength(JSON.stringify(batch));
    peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);
  }
  const durationMs = performance.now() - started;
  const cpu = process.cpuUsage(cpuStarted);
  results.push({ records, batchSize, batches: Math.ceil(records / batchSize), durationMs: Math.round(durationMs), recordsPerSecond: Math.round(records / (durationMs / 1000)), payloadMiB: Number((bytes / 1024 / 1024).toFixed(1)), peakHeapMiB: Number((peakHeap / 1024 / 1024).toFixed(1)), cpuMs: Math.round((cpu.user + cpu.system) / 1000), aiTokens: 0 });
}
console.log(JSON.stringify({ kind: "bounded-application-payload-simulation", measuredAt: new Date().toISOString(), results }, null, 2));
