import type { EmployerSourceInput } from "./employer-source-factory";
import { xmlElements, xmlValue } from "./providers/provider-utils.ts";

type Definition = {
  provider: "greenhouse" | "ashby" | "smartrecruiters" | "lever" | "workable" | "recruitee" | "personio";
  indexedPattern: string;
  careers: (candidate: string) => string;
  candidate: (url: URL) => string | undefined;
  rotatingPages?: boolean;
};
type VerifiedEmployer = EmployerSourceInput & { provider: Definition["provider"]; activeJobs: number };

const pathCandidate = (url: URL) => decodeURIComponent(url.pathname.split("/").filter(Boolean)[0] ?? "");
const subdomainCandidate = (suffix: string) => (url: URL) => {
  const host = url.hostname.toLowerCase();
  if (!host.endsWith(suffix)) return undefined;
  const account = host.slice(0, -suffix.length);
  return /^[a-z0-9-]+$/i.test(account) ? account : undefined;
};
const personioCandidate = (url: URL) => {
  const match = url.hostname.toLowerCase().match(/^([a-z0-9-]+)\.jobs\.personio\.(com|de)$/);
  return match ? `${match[1]}:${match[2]}` : undefined;
};

const definitions: readonly Definition[] = [
  { provider: "greenhouse", indexedPattern: "job-boards.greenhouse.io/", careers: slug => `https://job-boards.greenhouse.io/${slug}`, candidate: pathCandidate },
  { provider: "ashby", indexedPattern: "jobs.ashbyhq.com/", careers: slug => `https://jobs.ashbyhq.com/${slug}`, candidate: pathCandidate },
  { provider: "smartrecruiters", indexedPattern: "careers.smartrecruiters.com/", careers: slug => `https://careers.smartrecruiters.com/${slug}`, candidate: pathCandidate },
  { provider: "lever", indexedPattern: "jobs.lever.co/", careers: slug => `https://jobs.lever.co/${slug}`, candidate: pathCandidate },
  { provider: "lever", indexedPattern: "jobs.eu.lever.co/", careers: slug => `https://jobs.eu.lever.co/${slug}`, candidate: pathCandidate },
  { provider: "workable", indexedPattern: "apply.workable.com/", careers: slug => `https://apply.workable.com/${slug}`, candidate: pathCandidate },
  { provider: "recruitee", indexedPattern: "*.recruitee.com/*", careers: account => `https://${account}.recruitee.com`, candidate: subdomainCandidate(".recruitee.com"), rotatingPages: true },
  { provider: "personio", indexedPattern: "*.jobs.personio.com/*", careers: candidate => { const [account, region] = candidate.split(":"); return `https://${account}.jobs.personio.${region}`; }, candidate: personioCandidate, rotatingPages: true },
  { provider: "personio", indexedPattern: "*.jobs.personio.de/*", careers: candidate => { const [account, region] = candidate.split(":"); return `https://${account}.jobs.personio.${region}`; }, candidate: personioCandidate, rotatingPages: true },
];
export const PUBLIC_DISCOVERY_PROVIDER_IDS = [...new Set(definitions.map(definition => definition.provider))];
const reserved = new Set(["apply", "jobs", "job", "privacy", "robots.txt", "sitemap.xml"]);
const atsHosts = new Set(["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io", "jobs.ashbyhq.com", "careers.smartrecruiters.com", "jobs.smartrecruiters.com", "jobs.lever.co", "jobs.eu.lever.co", "recruitee.com", "jobs.personio.com", "jobs.personio.de"]);
const plainName = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, value => value.toUpperCase());
const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

function interleaveCandidates(groups: Array<Array<{ definition: Definition; slug: string }>>) {
  const result: Array<{ definition: Definition; slug: string }> = [];
  const maximum = Math.max(0, ...groups.map(group => group.length));
  for (let index = 0; index < maximum; index += 1) {
    for (const group of groups) if (group[index]) result.push(group[index]);
  }
  return result;
}

function selectDiverseSources(accepted: VerifiedEmployer[], maximumSources: number) {
  const ranked = [...accepted].sort((a, b) => b.activeJobs - a.activeJobs || a.employerName.localeCompare(b.employerName));
  const selected: VerifiedEmployer[] = [];
  const selectedCareersUrls = new Set<string>();
  for (const provider of PUBLIC_DISCOVERY_PROVIDER_IDS) {
    const source = ranked.find(candidate => candidate.provider === provider && !selectedCareersUrls.has(candidate.careersUrl));
    if (!source || selected.length >= maximumSources) continue;
    selected.push(source);
    selectedCareersUrls.add(source.careersUrl);
  }
  for (const source of ranked) {
    if (selected.length >= maximumSources) break;
    if (!selectedCareersUrls.has(source.careersUrl)) {
      selected.push(source);
      selectedCareersUrls.add(source.careersUrl);
    }
  }
  return selected;
}

const remainingTimeout = (deadlineAt: number | undefined, maximum: number) => deadlineAt
  ? Math.max(250, Math.min(maximum, deadlineAt - Date.now()))
  : maximum;

async function json(url: string, deadlineAt?: number) {
  const response = await fetch(url, { headers: { "user-agent": "Orendalis-Opportunity-Factory/1.0" }, signal: AbortSignal.timeout(remainingTimeout(deadlineAt, 12_000)) });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function textResponse(url: string, accept: string, deadlineAt?: number) {
  const response = await fetch(url, { headers: { accept, "user-agent": "Orendalis-Opportunity-Factory/1.0 (+https://www.orendalis.com)" }, signal: AbortSignal.timeout(remainingTimeout(deadlineAt, 12_000)) });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  return response.text();
}

async function indexedSlugs(definition: Definition, cdxApi: string, discoveryCursor: number, deadlineAt?: number) {
  const url = new URL(cdxApi);
  url.searchParams.set("url", definition.indexedPattern);
  if (!definition.rotatingPages) url.searchParams.set("matchType", "prefix");
  url.searchParams.set("output", "json");
  url.searchParams.append("filter", "status:200");
  url.searchParams.set("collapse", "urlkey");
  if (definition.rotatingPages) {
    const pagesUrl = new URL(url);
    pagesUrl.searchParams.delete("output");
    pagesUrl.searchParams.set("showNumPages", "true");
    pagesUrl.searchParams.set("pageSize", "1");
    const pagesResponse = await fetch(pagesUrl, { headers: { "user-agent": "Orendalis-Opportunity-Factory/1.0 (+https://www.orendalis.com)" }, signal: AbortSignal.timeout(remainingTimeout(deadlineAt, 30_000)) });
    if (!pagesResponse.ok) throw new Error(`INDEX_HTTP_${pagesResponse.status}`);
    const pages = Number((await pagesResponse.json() as { pages?: number }).pages ?? 1);
    url.searchParams.set("pageSize", "1");
    url.searchParams.set("page", String(Math.max(0, discoveryCursor) % Math.max(1, pages)));
  }
  const response = await fetch(url, { headers: { "user-agent": "Orendalis-Opportunity-Factory/1.0 (+https://www.orendalis.com)" }, signal: AbortSignal.timeout(remainingTimeout(deadlineAt, 30_000)) });
  if (!response.ok) throw new Error(`INDEX_HTTP_${response.status}`);
  const body = await response.text();
  const slugs = new Set<string>();
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line) as { url?: string };
      const parsed = new URL(record.url ?? "");
      const slug = definition.candidate(parsed) ?? "";
      if (/^[a-z0-9_-]+(?::(?:com|de))?$/i.test(slug) && !reserved.has(slug.toLowerCase())) slugs.add(slug);
    } catch { /* A malformed public index row is isolated. */ }
  }
  return [...slugs].sort((a, b) => a.localeCompare(b));
}

async function verify(definition: Definition, slug: string, deadlineAt?: number): Promise<VerifiedEmployer> {
  if (definition.provider === "greenhouse") {
    const token = encodeURIComponent(slug);
    const [board, listing] = await Promise.all([
      json(`https://boards-api.greenhouse.io/v1/boards/${token}`, deadlineAt),
      json(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=false`, deadlineAt),
    ]);
    const jobs = Array.isArray(listing.jobs) ? listing.jobs as Array<{ absolute_url?: string }> : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    const domains = jobs.flatMap(job => { try { const host = new URL(job.absolute_url ?? "").hostname.toLowerCase().replace(/^www\./, ""); return host && !atsHosts.has(host) ? [host] : []; } catch { return []; } });
    const officialDomain = domains.length ? domains.sort((a, b) => domains.filter(item => item === b).length - domains.filter(item => item === a).length)[0] : undefined;
    return { provider: definition.provider, employerName: String(board.name || plainName(slug)).trim(), employerDomain: officialDomain, careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "ashby") {
    const listing = await json(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`, deadlineAt);
    const jobs = Array.isArray(listing.jobs) ? (listing.jobs as Array<{ isListed?: boolean }>).filter(job => job.isListed !== false) : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: plainName(slug), careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "lever") {
    const origin = definition.indexedPattern.startsWith("jobs.eu.") ? "https://api.eu.lever.co" : "https://api.lever.co";
    const listing = await json(`${origin}/v0/postings/${encodeURIComponent(slug)}?mode=json&skip=0&limit=1000`, deadlineAt) as unknown as Array<{ hostedUrl?: string }>;
    const jobs = Array.isArray(listing) ? listing : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: plainName(slug), careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "workable") {
    const listing = await json(`https://www.workable.com/api/accounts/${encodeURIComponent(slug)}?details=true`, deadlineAt);
    const jobs = Array.isArray(listing.jobs) ? listing.jobs as Array<{ url?: string; shortlink?: string }> : [];
    if (!jobs.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: String(listing.name || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: jobs.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "recruitee") {
    const listing = await json(`https://${encodeURIComponent(slug)}.recruitee.com/api/offers/`, deadlineAt);
    const offers = Array.isArray(listing.offers) ? listing.offers as Array<{ company_name?: string }> : [];
    if (!offers.length) throw new Error("NO_ACTIVE_JOBS");
    return { provider: definition.provider, employerName: String(offers[0]?.company_name || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: offers.length, maximumResults: 1_000, refreshMinutes: 720 };
  }
  if (definition.provider === "personio") {
    const [account] = slug.split(":");
    const xml = await textResponse(`${definition.careers(slug)}/xml?language=en`, "application/xml,text/xml", deadlineAt);
    const positions = xmlElements(xml, "position");
    const activeJobs = positions.length;
    if (!activeJobs) throw new Error("NO_ACTIVE_JOBS");
    const subcompany = xmlValue(positions[0] ?? "", "subcompany");
    return { provider: definition.provider, employerName: subcompany || plainName(account), careersUrl: definition.careers(slug), activeJobs, maximumResults: 1_000, refreshMinutes: 720 };
  }
  const listing = await json(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(slug)}/postings?destination=PUBLIC&limit=1&offset=0`, deadlineAt);
  const total = Number(listing.totalFound);
  if (!total) throw new Error("NO_ACTIVE_JOBS");
  const content = Array.isArray(listing.content) ? listing.content as Array<{ company?: { name?: string } }> : [];
  return { provider: definition.provider, employerName: String(content[0]?.company?.name || plainName(slug)).trim(), careersUrl: definition.careers(slug), activeJobs: total, maximumResults: 1_000, refreshMinutes: 720 };
}

export async function discoverPublicEmployerSources(input: { existingUrls: readonly string[]; maximumSources?: number; concurrency?: number; discoveryCursor?: number; timeBudgetMs?: number }) {
  const deadlineAt = input.timeBudgetMs ? Date.now() + Math.max(1_000, input.timeBudgetMs) : undefined;
  const maximumSources = Math.max(0, Math.min(50, Math.trunc(input.maximumSources ?? 18)));
  if (!maximumSources) return { sources: [] as VerifiedEmployer[], candidates: 0, attempted: 0, failures: 0, advertisedActiveJobs: 0, aiTokens: 0 };
  const known = new Set(input.existingUrls.map(value => value.replace(/\/+$/, "")));
  const indexes = await json("https://index.commoncrawl.org/collinfo.json", deadlineAt) as unknown as Array<{ "cdx-api": string }>;
  const recentIndexes = indexes.slice(0, 3).flatMap(index => index["cdx-api"] ? [index["cdx-api"]] : []);
  if (!recentIndexes.length) throw new Error("PUBLIC_INDEX_UNAVAILABLE");
  let indexFailures = 0;
  let candidates: Array<{ definition: Definition; slug: string }> = [];
  for (const cdxApi of recentIndexes) {
    const indexed: Array<Array<{ definition: Definition; slug: string }>> = [];
    for (const [index, definition] of definitions.entries()) {
      if (deadlineAt && deadlineAt - Date.now() < 1_000) { indexFailures += definitions.length - index; break; }
      try { indexed.push((await indexedSlugs(definition, cdxApi, Math.max(0, Math.trunc(input.discoveryCursor ?? 0)), deadlineAt)).map(slug => ({ definition, slug }))); }
      catch { indexFailures += 1; indexed.push([]); }
      if (index < definitions.length - 1) await pause(150);
    }
    candidates = interleaveCandidates(indexed).filter(({ definition, slug }) => !known.has(definition.careers(slug)));
    if (candidates.length) break;
  }
  if (!candidates.length) throw new Error("PUBLIC_EMPLOYER_INDEX_UNAVAILABLE");
  const sampleTarget = Math.min(candidates.length, Math.max(maximumSources * 4, maximumSources));
  const cursorWindow = Math.max(0, Math.trunc(input.discoveryCursor ?? 0));
  const start = candidates.length ? (cursorWindow * sampleTarget) % candidates.length : 0;
  if (start) candidates = [...candidates.slice(start), ...candidates.slice(0, start)];
  const accepted: VerifiedEmployer[] = [];
  let cursor = 0, attempted = 0, failures = 0;
  async function worker() {
    while (cursor < candidates.length && attempted < sampleTarget && (!deadlineAt || Date.now() < deadlineAt)) {
      const candidate = candidates[cursor++];
      attempted += 1;
      try { accepted.push(await verify(candidate.definition, candidate.slug, deadlineAt)); }
      catch { failures += 1; }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(24, input.concurrency ?? 12)) }, () => worker()));
  const sources = selectDiverseSources(accepted, maximumSources);
  return { sources, candidates: candidates.length, attempted, failures, indexFailures, advertisedActiveJobs: sources.reduce((sum, source) => sum + source.activeJobs, 0), aiTokens: 0 };
}
