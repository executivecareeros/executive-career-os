"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type LiveCompanyRecord = {
  name: string;
  website?: string;
  country?: string;
  opportunityCount: number;
  opportunityIds: string[];
  sourceNames: string[];
  confidenceScores: number[];
  relevanceScores: number[];
};

export function LiveCompanies({ companies }: { companies: LiveCompanyRecord[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const visible = useMemo(() => companies
    .filter((company) => `${company.name} ${company.country ?? ""} ${company.sourceNames.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((company) => !country || company.country === country)
    .filter((company) => !source || company.sourceNames.includes(source))
    .sort((a, b) => b.opportunityCount - a.opportunityCount || a.name.localeCompare(b.name)), [companies, country, query, source]);
  const countries = [...new Set(companies.map((company) => company.country).filter(Boolean))] as string[];
  const sources = [...new Set(companies.flatMap((company) => company.sourceNames))];
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  if (!companies.length) return <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#936b3f]">Companies</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] text-[#17191c]">Company intelligence will follow the market.</h1><p className="mt-4 max-w-2xl text-[#626970]">As verified opportunities arrive, ORENDALIS will group them into company profiles using only facts supplied by their sources.</p><div className="mt-8 rounded-2xl border border-[#e3e5e6] bg-white p-6 text-sm text-[#626970]">No company records are available yet. Search Jobs to add a verified opportunity source.</div></div>;
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#936b3f]">Companies</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] text-[#17191c]">Companies hiring in your opportunity universe.</h1><p className="mt-4 max-w-2xl text-[#626970]">These profiles are built from current opportunity evidence. Unknown company facts remain unknown until an authoritative source confirms them.</p><p className="mt-5 text-sm text-[#747b82]">{companies.length} companies · grouped from opportunity evidence</p><div className="mt-7 grid gap-4 md:grid-cols-3"><label className="text-sm font-medium text-[#565c62]">Search companies<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Company, country, or source" className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c]" /></label><Filter label="Country" value={country} values={countries} onChange={(value) => { setCountry(value); setPage(1); }}/><Filter label="Source" value={source} values={sources} onChange={(value) => { setSource(value); setPage(1); }}/></div><div className="mt-8 grid gap-5 md:grid-cols-2">{paged.map(company=>{const confidence=average(company.confidenceScores);const relevance=average(company.relevanceScores);return <article key={company.name} className="rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1eee8] text-sm font-semibold text-[#695238]">{company.name.slice(0,2).toUpperCase()}</div><h2 className="mt-4 text-xl font-semibold text-[#17191c]"><Link href={`/companies/${encodeURIComponent(company.name)}`} className="hover:underline">{company.name}</Link></h2><p className="mt-1 text-sm text-[#747b82]">{company.country || "Location not confirmed"}</p></div><span className="rounded-full bg-[#f3eee7] px-3 py-1 text-xs font-medium text-[#695238]">{company.opportunityCount} {company.opportunityCount === 1 ? "opportunity" : "opportunities"}</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#edf3f5] px-2.5 py-1 text-[#36576a]">Evidence confidence: {confidence === undefined ? "Unknown" : `${confidence}%`}</span><span className="rounded-full bg-[#f5f6f6] px-2.5 py-1 text-[#626970]">Executive relevance: {relevance === undefined ? "Not assessed" : `${relevance}%`}</span></div><p className="mt-5 text-sm leading-6 text-[#626970]">Company overview is not inferred. Review the linked roles and their source evidence before drawing conclusions.</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/companies/${encodeURIComponent(company.name)}`} className="inline-flex rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-medium text-white">Open company briefing</Link>{company.website&&<a href={company.website} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border border-[#d9dcde] px-4 py-2.5 text-sm font-medium text-[#30343a]">Source website ↗</a>}</div><p className="mt-4 text-xs text-[#8a8f93]">Sources: {company.sourceNames.join(", ") || "Not confirmed"}</p></article>})}</div>{!visible.length && <p className="mt-8 rounded-2xl border border-dashed border-[#cfc7bc] p-6 text-sm text-[#626970]">No companies match this search.</p>}{pages > 1 && <nav className="mt-8 flex items-center justify-between text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-[#d9dcde] px-4 py-2 disabled:opacity-40">Previous</button><span>Page {Math.min(page, pages)} of {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))} className="rounded-xl border border-[#d9dcde] px-4 py-2 disabled:opacity-40">Next</button></nav>}</main>;
}

function Filter({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) { return <label className="text-sm font-medium text-[#565c62]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c]"><option value="">All</option>{values.sort().map((item) => <option key={item} value={item}>{item}</option>)}</select></label>; }
function average(values: number[]) { return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : undefined; }
