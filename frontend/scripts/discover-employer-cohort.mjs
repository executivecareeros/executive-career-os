import { writeFile } from "node:fs/promises";

const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith("--") ? [value.slice(2), all[index + 1]?.startsWith("--") ? "true" : all[index + 1]] : ["", ""]));
const target = Math.max(1, Math.min(2_000, Number(args.get("target") ?? 1_000)));
const output = args.get("output") ?? "/tmp/orendalis-employer-cohort.json";
const concurrency = Math.max(1, Math.min(24, Number(args.get("concurrency") ?? 12)));
const currentIndex = await fetch("https://index.commoncrawl.org/collinfo.json").then((response) => response.json()).then((items) => items[0]);

const definitions = [
  { provider: "greenhouse", indexedHost: "job-boards.greenhouse.io/", careers: (slug) => `https://job-boards.greenhouse.io/${slug}` },
  { provider: "ashby", indexedHost: "jobs.ashbyhq.com/", careers: (slug) => `https://jobs.ashbyhq.com/${slug}` },
  { provider: "smartrecruiters", indexedHost: "careers.smartrecruiters.com/", careers: (slug) => `https://careers.smartrecruiters.com/${slug}` },
];

const reserved = new Set(["apply", "jobs", "job", "privacy", "robots.txt", "sitemap.xml"]);
async function indexedSlugs(definition) {
  const url = new URL(currentIndex["cdx-api"]);
  url.searchParams.set("url", definition.indexedHost);
  url.searchParams.set("matchType", "prefix");
  url.searchParams.set("output", "json");
  url.searchParams.append("filter", "status:200");
  url.searchParams.set("collapse", "urlkey");
  const body = await fetch(url, { signal: AbortSignal.timeout(60_000) }).then((response) => response.text());
  const slugs = new Set();
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line), parsed = new URL(record.url);
      const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean)[0] ?? "");
      if (/^[a-z0-9_-]+$/i.test(slug) && !reserved.has(slug.toLowerCase())) slugs.add(slug);
    } catch { /* malformed public index records are isolated */ }
  }
  return [...slugs].sort((a, b) => a.localeCompare(b));
}

const plainName = (slug) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
const atsHosts = new Set(["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io", "jobs.ashbyhq.com", "careers.smartrecruiters.com", "jobs.smartrecruiters.com"]);
async function json(url) {
  const response = await fetch(url, { headers: { "user-agent": "Orendalis-Opportunity-Factory/1.0" }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  return response.json();
}

async function verify(definition, slug) {
  if (definition.provider === "greenhouse") {
    const token = encodeURIComponent(slug);
    const [board, listing] = await Promise.all([
      json(`https://boards-api.greenhouse.io/v1/boards/${token}`),
      json(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=false`),
    ]);
    const jobs = Array.isArray(listing.jobs) ? listing.jobs : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    const domains = jobs.map((job) => { try { return new URL(job.absolute_url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return undefined; } }).filter((host) => host && !atsHosts.has(host));
    const officialDomain = domains.length ? domains.sort((a, b) => domains.filter((item) => item === b).length - domains.filter((item) => item === a).length)[0] : undefined;
    return { provider: definition.provider, slug, employerName: String(board.name || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: jobs.length, officialDomain };
  }
  if (definition.provider === "ashby") {
    const listing = await json(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`);
    const jobs = Array.isArray(listing.jobs) ? listing.jobs.filter((job) => job.isListed !== false) : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, slug, employerName: plainName(slug), careersUrl: definition.careers(slug), activeJobs: jobs.length };
  }
  const listing = await json(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings?destination=PUBLIC&limit=1&offset=0`);
  if (!Number(listing.totalFound)) throw new Error("NO_ACTIVE_JOBS");
  const companyName = listing.content?.[0]?.company?.name;
  return { provider: definition.provider, slug, employerName: String(companyName || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: Number(listing.totalFound) };
}

const candidates = [];
for (const definition of definitions) for (const slug of await indexedSlugs(definition)) candidates.push({ definition, slug });

const verified = [], failures = {};
let cursor = 0;
async function worker() {
  while (cursor < candidates.length && verified.length < target) {
    const candidate = candidates[cursor++];
    try { verified.push(await verify(candidate.definition, candidate.slug)); }
    catch (error) { const code = error instanceof Error ? error.message : "UNKNOWN"; failures[code] = (failures[code] ?? 0) + 1; }
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));

const cohort = verified.slice(0, target).sort((a, b) => b.activeJobs - a.activeJobs || a.provider.localeCompare(b.provider) || a.slug.localeCompare(b.slug));
const artifact = {
  version: "opportunity-factory-cohort-v1",
  generatedAt: new Date().toISOString(),
  discoverySource: currentIndex.id,
  target,
  candidateEmployers: candidates.length,
  verifiedEmployers: cohort.length,
  advertisedActiveJobs: cohort.reduce((sum, employer) => sum + employer.activeJobs, 0),
  providers: Object.fromEntries(definitions.map(({ provider }) => [provider, cohort.filter((item) => item.provider === provider).length])),
  officialDomainCandidates: cohort.filter((item) => item.officialDomain).length,
  failures,
  employers: cohort,
};
await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ ...artifact, employers: undefined, output }, null, 2));
