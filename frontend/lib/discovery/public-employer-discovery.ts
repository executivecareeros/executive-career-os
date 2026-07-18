import type { EmployerSourceInput } from "./employer-source-factory";

type Definition = { provider: "greenhouse" | "ashby" | "smartrecruiters" | "lever"; indexedHost: string; careers: (slug: string) => string };
type VerifiedEmployer = EmployerSourceInput & { provider: Definition["provider"]; activeJobs: number };

const definitions: readonly Definition[] = [
  { provider: "greenhouse", indexedHost: "job-boards.greenhouse.io/", careers: slug => `https://job-boards.greenhouse.io/${slug}` },
  { provider: "ashby", indexedHost: "jobs.ashbyhq.com/", careers: slug => `https://jobs.ashbyhq.com/${slug}` },
  { provider: "smartrecruiters", indexedHost: "careers.smartrecruiters.com/", careers: slug => `https://careers.smartrecruiters.com/${slug}` },
  { provider: "lever", indexedHost: "jobs.lever.co/", careers: slug => `https://jobs.lever.co/${slug}` },
  { provider: "lever", indexedHost: "jobs.eu.lever.co/", careers: slug => `https://jobs.eu.lever.co/${slug}` },
];
const reserved = new Set(["apply", "jobs", "job", "privacy", "robots.txt", "sitemap.xml"]);
const atsHosts = new Set(["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io", "jobs.ashbyhq.com", "careers.smartrecruiters.com", "jobs.smartrecruiters.com", "jobs.lever.co", "jobs.eu.lever.co"]);
const plainName = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, value => value.toUpperCase());

async function json(url: string) {
  const response = await fetch(url, { headers: { "user-agent": "Orendalis-Opportunity-Factory/1.0" }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function indexedSlugs(definition: Definition, cdxApi: string) {
  const url = new URL(cdxApi);
  url.searchParams.set("url", definition.indexedHost);
  url.searchParams.set("matchType", "prefix");
  url.searchParams.set("output", "json");
  url.searchParams.append("filter", "status:200");
  url.searchParams.set("collapse", "urlkey");
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`INDEX_HTTP_${response.status}`);
  const body = await response.text();
  const slugs = new Set<string>();
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line) as { url?: string };
      const parsed = new URL(record.url ?? "");
      const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean)[0] ?? "");
      if (/^[a-z0-9_-]+$/i.test(slug) && !reserved.has(slug.toLowerCase())) slugs.add(slug);
    } catch { /* A malformed public index row is isolated. */ }
  }
  return [...slugs].sort((a, b) => a.localeCompare(b));
}

async function verify(definition: Definition, slug: string): Promise<VerifiedEmployer> {
  if (definition.provider === "greenhouse") {
    const token = encodeURIComponent(slug);
    const [board, listing] = await Promise.all([
      json(`https://boards-api.greenhouse.io/v1/boards/${token}`),
      json(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=false`),
    ]);
    const jobs = Array.isArray(listing.jobs) ? listing.jobs as Array<{ absolute_url?: string }> : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    const domains = jobs.flatMap(job => { try { const host = new URL(job.absolute_url ?? "").hostname.toLowerCase().replace(/^www\./, ""); return host && !atsHosts.has(host) ? [host] : []; } catch { return []; } });
    const officialDomain = domains.length ? domains.sort((a, b) => domains.filter(item => item === b).length - domains.filter(item => item === a).length)[0] : undefined;
    return { provider: definition.provider, employerName: String(board.name || plainName(slug)).trim(), employerDomain: officialDomain, careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "ashby") {
    const listing = await json(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`);
    const jobs = Array.isArray(listing.jobs) ? (listing.jobs as Array<{ isListed?: boolean }>).filter(job => job.isListed !== false) : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: plainName(slug), careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "lever") {
    const origin = definition.indexedHost.startsWith("jobs.eu.") ? "https://api.eu.lever.co" : "https://api.lever.co";
    const listing = await json(`${origin}/v0/postings/${encodeURIComponent(slug)}?mode=json&skip=0&limit=1000`) as unknown as Array<{ hostedUrl?: string }>;
    const jobs = Array.isArray(listing) ? listing : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: plainName(slug), careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  const listing = await json(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings?destination=PUBLIC&limit=1&offset=0`);
  const total = Number(listing.totalFound);
  if (!total) throw new Error("NO_ACTIVE_JOBS");
  const content = Array.isArray(listing.content) ? listing.content as Array<{ company?: { name?: string } }> : [];
  return { provider: definition.provider, employerName: String(content[0]?.company?.name || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: total, maximumResults: 1_000, refreshMinutes: 720 };
}

export async function discoverPublicEmployerSources(input: { existingUrls: readonly string[]; maximumSources?: number; concurrency?: number }) {
  const maximumSources = Math.max(0, Math.min(50, Math.trunc(input.maximumSources ?? 18)));
  if (!maximumSources) return { sources: [] as VerifiedEmployer[], candidates: 0, attempted: 0, failures: 0, advertisedActiveJobs: 0, aiTokens: 0 };
  const known = new Set(input.existingUrls.map(value => value.replace(/\/+$/, "")));
  const indexes = await json("https://index.commoncrawl.org/collinfo.json") as unknown as Array<{ "cdx-api": string }>;
  const recentIndexes = indexes.slice(0, 3).flatMap(index => index["cdx-api"] ? [index["cdx-api"]] : []);
  if (!recentIndexes.length) throw new Error("PUBLIC_INDEX_UNAVAILABLE");
  let indexFailures = 0;
  let candidates: Array<{ definition: Definition; slug: string }> = [];
  for (const cdxApi of recentIndexes) {
    const indexed = await Promise.allSettled(definitions.map(async definition => (await indexedSlugs(definition, cdxApi)).map(slug => ({ definition, slug }))));
    indexFailures += indexed.filter(result => result.status === "rejected").length;
    candidates = indexed
      .flatMap(result => result.status === "fulfilled" ? result.value : [])
      .filter(({ definition, slug }) => !known.has(definition.careers(slug)));
    if (candidates.length) break;
  }
  if (!candidates.length) throw new Error("PUBLIC_EMPLOYER_INDEX_UNAVAILABLE");
  const sampleTarget = Math.min(candidates.length, Math.max(maximumSources * 4, maximumSources));
  const accepted: VerifiedEmployer[] = [];
  let cursor = 0, attempted = 0, failures = 0;
  async function worker() {
    while (cursor < candidates.length && attempted < sampleTarget) {
      const candidate = candidates[cursor++];
      attempted += 1;
      try { accepted.push(await verify(candidate.definition, candidate.slug)); }
      catch { failures += 1; }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(24, input.concurrency ?? 12)) }, () => worker()));
  const sources = accepted.sort((a, b) => b.activeJobs - a.activeJobs || a.employerName.localeCompare(b.employerName)).slice(0, maximumSources);
  return { sources, candidates: candidates.length, attempted, failures, indexFailures, advertisedActiveJobs: sources.reduce((sum, source) => sum + source.activeJobs, 0), aiTokens: 0 };
}
