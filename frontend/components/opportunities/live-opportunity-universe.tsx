"use client";

import { FormEvent, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SecondaryButton } from "@/components/secondary-button";
import { SearchInput } from "@/components/search-input";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import type { Opportunity } from "@/types/opportunity";
import { toPlainText } from "@/lib/plain-text";
import { assessOpportunityFreshness, opportunitySourceLabel } from "@/lib/opportunity-universe";
import { assessOpportunityConfidence, diversifyExecutiveRecommendations, sortOpportunitiesForExecutive, type ExecutiveCareerContext, type ExecutiveGeographicProfile } from "@/lib/opportunity-geography";
import { EXECUTIVE_SEARCH_INDUSTRIES, EXECUTIVE_SEARCH_REGIONS, executiveSearchRelevance, matchesExecutiveSearch, searchCity, searchCountry, searchSuggestions, type ExecutiveSearchFilters } from "@/lib/executive-search";
import { LiveOpportunityCard } from "./live-opportunity-card";
import { OpportunityApplicationLink } from "./opportunity-application-link";
import { resolvePublishedCompensation } from "@/lib/discovery/published-compensation";
import { canonicalCountryOptions } from "@/lib/discovery/country-normalization";

type JobsView = "Search" | "Recommended";
type Props = { opportunity?: LiveOpportunityViewModel; collected: Opportunity[]; geographicProfile: ExecutiveGeographicProfile; careerContext: ExecutiveCareerContext; canConfirmFounderFixture: boolean; profileConfirmationAction: () => void | Promise<void>; collectionNotice?: string; collectionMessage?: string; imported?: string; found?: string; collectionAction: (formData: FormData) => void | Promise<void>; initialQuery?: string; cvComplete?: boolean; savedRoles?: string; newRoles?: string };

const emptyFilters = (query = ""): ExecutiveSearchFilters => ({ query, countries: [], cities: [], regions: [], industries: [], titles: [], departments: [], seniorities: [], employmentTypes: [], remoteOptions: [], companySizes: [], salaryMinimum: "", salaryMaximum: "", salaryCurrency: "" });
const pageSize = 12;

export function LiveOpportunityUniverse({ opportunity, collected, geographicProfile, careerContext, canConfirmFounderFixture, profileConfirmationAction, collectionNotice, collectionMessage, imported, found, collectionAction, initialQuery = "", cvComplete, savedRoles, newRoles }: Props) {
  const [view, setView] = useState<JobsView>(opportunity?.atlasAction || collected.length ? "Recommended" : "Search");
  const [draft, setDraft] = useState(() => emptyFilters(initialQuery));
  const [applied, setApplied] = useState(() => emptyFilters(initialQuery));
  const [sort, setSort] = useState<"best" | "newest">("best");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [validation, setValidation] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [searchApplied, setSearchApplied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => ({
    countries: values([...canonicalCountryOptions, ...collected.map(searchCountry).filter((value): value is string => Boolean(value))]), cities: values(collected.map(searchCity).filter((value): value is string => Boolean(value))),
    regions: [...EXECUTIVE_SEARCH_REGIONS], industries: [...EXECUTIVE_SEARCH_INDUSTRIES],
    titles: values(collected.map((item) => item.jobTitle)), departments: ["Sales", "Commercial", "Revenue", "Business Development", "Operations", "Finance", "Technology", "Product", "Marketing"],
    seniorities: ["C-suite", "Chief", "Executive", "Vice President", "VP", "Director", "Head"], employmentTypes: values(collected.map((item) => item.employmentType)),
    remoteOptions: values(collected.map((item) => item.workArrangement)), companySizes: values(collected.map((item) => item.companySize)),
  }), [collected]);
  const suggestions = useMemo(() => searchSuggestions(draft.query, collected, recent), [collected, draft.query, recent]);

  const rankedOpportunities = useMemo(() => diversifyExecutiveRecommendations(sortOpportunitiesForExecutive(collected, geographicProfile, careerContext).filter((item) => assessOpportunityConfidence(item, geographicProfile, careerContext).eligibility !== "Not Currently Eligible")), [careerContext, collected, geographicProfile]);
  const searchedOpportunities = useMemo(() => {
    const filtered = collected.filter((item) => matchesExecutiveSearch(item, applied)).filter((item) => {
      if (!eligibleOnly) return true;
      const state = assessOpportunityConfidence(item, geographicProfile, careerContext).eligibility;
      return state === "Eligible" || state === "Probably Eligible";
    });
    if (sort === "newest") return [...filtered].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    return sortOpportunitiesForExecutive(filtered, geographicProfile, careerContext).sort((a, b) => executiveSearchRelevance(b, applied) - executiveSearchRelevance(a, applied));
  }, [applied, careerContext, collected, eligibleOnly, geographicProfile, sort]);
  const activeOpportunities = view === "Recommended" ? rankedOpportunities : searchedOpportunities;
  const pageCount = Math.max(1, Math.ceil(activeOpportunities.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const collectedVisible = activeOpportunities.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (draft.salaryMinimum && draft.salaryMaximum && Number(draft.salaryMinimum) > Number(draft.salaryMaximum)) { setValidation("Minimum salary cannot be greater than maximum salary."); return; }
    setValidation(""); setApplied(draft); setView("Search"); setPage(0); setSearchApplied(true);
    if (draft.query.trim()) setRecent((current) => [draft.query.trim(), ...current.filter((item) => item !== draft.query.trim())].slice(0, 5));
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  const clearFilters = () => { const empty = emptyFilters(); setDraft(empty); setApplied(empty); setValidation(""); setPage(0); setSearchApplied(false); };

  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Jobs" title="Find your next executive role" description="Search the global opportunity network, or let Atlas rank the roles that best fit your confirmed experience and preferences." actions={<SecondaryButton href="/applications">View applications</SecondaryButton>} />
    {cvComplete && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">Your experience is saved. {savedRoles ?? "0"} {savedRoles === "1" ? "role is" : "roles are"} confirmed{newRoles !== undefined ? ` (${newRoles} newly added)` : ""}. Search jobs now, or review the opportunities Atlas recommends.</p>}
    {canConfirmFounderFixture && geographicProfile.profileConfidence === 0 && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-semibold">Automatic detection — confirmation required</p><p className="mt-2">Atlas detected Türkiye residence and EU work authorization from your CV. This remains unconfirmed until you choose it.</p><div className="mt-4 flex gap-3"><form action={profileConfirmationAction}><button className="rounded-xl bg-[#17191c] px-4 py-2 font-semibold text-white">Confirm as my preference</button></form><Link href="/import" className="rounded-xl border border-amber-300 bg-white px-4 py-2 font-semibold">Review profile</Link></div></section>}
    <nav className="mt-8 inline-flex rounded-full border border-[#dfe2e3] bg-white p-1" aria-label="Jobs views">{(["Search", "Recommended"] as JobsView[]).map((item) => <button key={item} type="button" onClick={() => {setView(item);setPage(0);}} aria-current={view === item ? "page" : undefined} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${view === item ? "bg-[#17191c] text-white" : "text-[#626970] hover:bg-[#f3f4f4]"}`}>{item === "Search" ? "Search jobs" : "Atlas recommendations"}</button>)}</nav>

    {view === "Search" && <form onSubmit={submitSearch} className="mt-6 rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-[#17191c]">Search executive jobs</h2><p className="mt-1 text-sm text-[#6f757b]">Your selections are <Link href="/workspace#preferences" className="font-semibold text-[#3457d5] underline-offset-2 hover:underline">User Preferences</Link>. Open them at any time to change what influences Atlas ranking. Automatic detections remain separate and never overwrite your choices.</p></div><button type="button" onClick={clearFilters} className="text-sm font-semibold text-[#536f80]">Clear all</button></div>
      <div className="relative mt-5"><SearchInput label="Role, skill, company, or keyword" value={draft.query} onChange={(event) => setDraft({ ...draft, query: event.target.value })} placeholder="Chief Revenue Officer, SaaS, enterprise sales…" />{draft.query && suggestions.length > 0 && <div className="mt-2 flex flex-wrap gap-2" aria-label="Search suggestions">{suggestions.map((item) => <button key={item} type="button" onClick={() => setDraft({ ...draft, query: item })} className="rounded-full border border-[#d9dcde] bg-[#fafafa] px-3 py-1.5 text-xs text-[#3f464c] hover:bg-[#f0f2f2]">{item}</button>)}</div>}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MultiSelect strict label="Countries" values={draft.countries} options={options.countries} onChange={(value) => setDraft({ ...draft, countries: value })} />
        <MultiSelect label="Cities" values={draft.cities} options={options.cities} onChange={(value) => setDraft({ ...draft, cities: value })} />
        <MultiSelect strict label="Regions" values={draft.regions} options={options.regions} onChange={(value) => setDraft({ ...draft, regions: value })} />
        <MultiSelect strict label="Industries" values={draft.industries} options={options.industries} onChange={(value) => setDraft({ ...draft, industries: value })} />
        <MultiSelect label="Titles" values={draft.titles} options={options.titles} onChange={(value) => setDraft({ ...draft, titles: value })} />
        <MultiSelect label="Departments" values={draft.departments} options={options.departments} onChange={(value) => setDraft({ ...draft, departments: value })} />
        <MultiSelect label="Seniority" values={draft.seniorities} options={options.seniorities} onChange={(value) => setDraft({ ...draft, seniorities: value })} />
        <MultiSelect label="Employment types" values={draft.employmentTypes} options={options.employmentTypes} onChange={(value) => setDraft({ ...draft, employmentTypes: value })} />
        <MultiSelect label="Remote and work model" values={draft.remoteOptions} options={options.remoteOptions} onChange={(value) => setDraft({ ...draft, remoteOptions: value })} />
        <MultiSelect label="Company sizes" values={draft.companySizes} options={options.companySizes} onChange={(value) => setDraft({ ...draft, companySizes: value })} />
        <label className="text-sm text-[#565c62]">Salary currency<select value={draft.salaryCurrency} onChange={(event) => setDraft({ ...draft, salaryCurrency: event.target.value })} className={controlClass}><option value="">Any currency</option>{["EUR", "USD", "GBP", "TRY", "CHF", "CAD", "AUD"].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><label className="text-sm text-[#565c62]">Minimum<input type="number" min="0" value={draft.salaryMinimum} onChange={(event) => setDraft({ ...draft, salaryMinimum: event.target.value })} className={controlClass}/></label><label className="text-sm text-[#565c62]">Maximum<input type="number" min="0" value={draft.salaryMaximum} onChange={(event) => setDraft({ ...draft, salaryMaximum: event.target.value })} className={controlClass}/></label></div>
        <label className="text-sm text-[#565c62]">Sort<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className={controlClass}><option value="best">Best Match</option><option value="newest">Newest</option></select></label>
        <label className="flex items-center gap-3 rounded-xl border border-[#d9dcde] px-4 py-3 text-sm text-[#565c62]"><input type="checkbox" checked={eligibleOnly} onChange={(event) => setEligibleOnly(event.target.checked)}/>Show only eligible roles</label>
      </div>
      {validation && <p role="alert" className="mt-4 text-sm font-medium text-rose-700">{validation}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" className="rounded-xl bg-[#17191c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3457d5]">Search opportunities</button><span className="text-xs text-[#747b82]">Choose any single filter or combine several. Press Enter to search.</span></div>
      {searchApplied && <p className="mt-3 text-sm font-medium text-[#36576a]" role="status">Search applied. {searchedOpportunities.length.toLocaleString("en-GB")} matching {searchedOpportunities.length === 1 ? "opportunity" : "opportunities"}.</p>}
      {collectionNotice && <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${collectionNotice === "complete" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} role="status">{collectionNotice === "complete" ? `${found ?? "0"} roles found; ${imported ?? "0"} added or updated.` : collectionMessage ?? "That employer career page could not be refreshed."}</p>}
    </form>}
    {view === "Search" && <details className="mt-4 rounded-2xl border border-[#e3e5e6] bg-white p-5 text-sm"><summary className="cursor-pointer font-medium text-[#536f80]">Add jobs from an employer career page</summary><form action={collectionAction} className="mt-4 flex max-w-2xl flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="careers-page">Employer career page</label><input id="careers-page" name="board" required placeholder="Paste an employer career page URL" className="min-w-0 flex-1 rounded-xl border border-[#d9dcde] bg-white px-4 py-2.5 text-sm text-[#17191c]"/><button className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-medium text-white">Add jobs</button></form></details>}

    <div ref={resultsRef} tabIndex={-1} className="mt-6 scroll-mt-6 outline-none">{view === "Recommended" && opportunity && <LiveOpportunityCard opportunity={opportunity} />}{(view === "Search" || (view === "Recommended" && !opportunity)) && collectedVisible.length > 0 && <><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#626970]">Showing {safePage*pageSize+1}–{Math.min((safePage+1)*pageSize,activeOpportunities.length)} of {activeOpportunities.length.toLocaleString("en-GB")} {view === "Recommended" ? "ranked opportunities" : "results"}</p>{view === "Recommended"&&<p className="text-xs text-[#7a8086]">Highest confidence first; later pages continue toward lower-confidence matches.</p>}</div><div className="grid gap-5 xl:grid-cols-2">{collectedVisible.map((item) => <CollectedOpportunityCard key={item.id} opportunity={item} geographicProfile={geographicProfile} careerContext={careerContext} />)}</div><nav className="mt-8 flex items-center justify-between gap-4" aria-label={`${view} opportunity pages`}><button type="button" disabled={safePage===0} onClick={()=>{setPage(current=>Math.max(0,current-1));resultsRef.current?.scrollIntoView({behavior:"smooth"});}} className="rounded-xl border border-[#d9dcde] px-5 py-3 text-sm font-semibold text-[#30343a] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40">Previous page</button><span className="text-sm text-[#626970]">Page {safePage+1} of {pageCount}</span><button type="button" disabled={safePage>=pageCount-1} onClick={()=>{setPage(current=>Math.min(pageCount-1,current+1));resultsRef.current?.scrollIntoView({behavior:"smooth"});}} className="rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40">Next {view === "Recommended" ? "recommendations" : "page"}</button></nav></>}{view === "Recommended" && !opportunity && !collectedVisible.length && <EmptyState eyebrow="Atlas recommendations" title="No recommendations yet" description="Atlas will rank opportunities when confirmed experience and preferences provide enough evidence." action={<SecondaryButton href="/workspace">Review profile</SecondaryButton>} />}{view === "Search" && !collectedVisible.length && <EmptyState eyebrow="Search jobs" title={collected.length ? "No jobs match these filters" : "Your job search starts here"} description={collected.length ? "Try widening one or more filters." : "Opportunities will appear as verified employer sources are connected."} action={collected.length ? <SecondaryButton onClick={clearFilters}>Clear filters</SecondaryButton> : <SecondaryButton href="/import">Upload your CV</SecondaryButton>} />}</div>
  </div>;
}

const controlClass = "mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c]";
function values(items: string[]) { return [...new Set(items.filter((item) => item && item !== "Not specified" && item !== "Unknown"))].sort(); }
function MultiSelect({ label, values, options, onChange, strict=false }: { label: string; values: string[]; options: string[]; onChange: (values: string[]) => void; strict?: boolean }) {
  const [entry, setEntry] = useState(""), id = useId();
  const add = () => { const exact = options.find((option) => option.toLowerCase() === entry.trim().toLowerCase()) ?? entry.trim(); if (exact && !values.includes(exact)) onChange([...values, exact]); setEntry(""); };
  return <fieldset className="rounded-xl border border-[#d9dcde] p-3"><legend className="px-1 text-sm text-[#565c62]">{label}</legend><div className="flex gap-2">{strict?<select value={entry} onChange={(event)=>setEntry(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#d9dcde] bg-white px-3 py-2 text-sm"><option value="">Choose {label.toLowerCase()}</option>{options.filter(option=>!values.includes(option)).map(option=><option key={option} value={option}>{option}</option>)}</select>:<><input list={id} value={entry} onChange={(event) => setEntry(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder={`Add ${label.toLowerCase()}`} className="min-w-0 flex-1 rounded-lg border border-[#d9dcde] px-3 py-2 text-sm"/><datalist id={id}>{options.map((option) => <option key={option} value={option}/>)}</datalist></>}<button type="button" disabled={!entry.trim()} onClick={add} className="rounded-lg border border-[#bfc8d0] bg-[#f8fafb] px-3 text-sm font-semibold transition hover:bg-[#edf2f5] active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-45">Add</button></div>{values.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{values.map((value) => <button key={value} type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="rounded-full bg-[#edf3f5] px-2.5 py-1 text-xs text-[#36576a]" aria-label={`Remove ${value}`}>{value} ×</button>)}</div>}</fieldset>;
}

function CollectedOpportunityCard({ opportunity, geographicProfile, careerContext }: { opportunity: Opportunity; geographicProfile: ExecutiveGeographicProfile; careerContext: ExecutiveCareerContext }) {
  const freshness = assessOpportunityFreshness(opportunity), confidence = assessOpportunityConfidence(opportunity, geographicProfile, careerContext);
  const compensation = resolvePublishedCompensation(opportunity);
  const hasCompensation = compensation?.minimum !== undefined || compensation?.maximum !== undefined;
  const hasIndustryEvidence = opportunity.industry && !["Not specified", "Unknown"].includes(opportunity.industry);
  const salary = hasCompensation ? `${compensation?.currency ?? "Currency unconfirmed"} ${compensation?.minimum?.toLocaleString("en-GB") ?? "?"}${compensation?.maximum !== undefined ? `–${compensation.maximum.toLocaleString("en-GB")}` : ""}` : "Compensation not disclosed";
  return <article className="group rounded-2xl border border-[#dde2e8] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#b9c8dc] hover:shadow-md sm:p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2f8] text-xs font-bold tracking-wide text-[#31577d]">{opportunity.companyInitials}</div><div className="min-w-0"><h2 className="text-xl font-semibold leading-7 tracking-[-0.01em] text-[#174f8f] transition group-hover:text-[#0f3f78]">{opportunity.jobTitle}</h2><p className="mt-1 text-[15px] font-semibold text-[#252a30]">{opportunity.companyName}</p><p className="mt-2 text-sm font-medium text-[#737b84]">{opportunity.location} <span aria-hidden="true" className="px-1 text-[#b1b7bd]">·</span> {opportunity.workArrangement}</p><p className="mt-1 text-sm font-medium text-[#424950]">{salary}{hasCompensation && <span className="font-normal text-[#7a8086]"> · {opportunity.salaryDisclosure ?? "Published compensation"}</span>}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#e9f1f8] px-2.5 py-1 font-semibold text-[#28587e]">{confidence.label} · {confidence.opportunityConfidence}%</span><span className="rounded-full bg-[#f3f5f6] px-2.5 py-1 font-medium text-[#5f6871]">{confidence.eligibility}</span></div><p className="mt-2 text-xs leading-5 text-[#626970]">{confidence.professionalExplanation} {confidence.explanation}</p></div></div><p className="mt-4 line-clamp-3 border-t border-[#eef0f2] pt-4 text-sm leading-6 text-[#626970]">{opportunity.summary ? toPlainText(opportunity.summary) : "Open the role to review the employer's published description."}</p><div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7a8086]"><span>{opportunitySourceLabel(opportunity)}</span><span>Updated {freshness.ageHours}h ago</span>{hasIndustryEvidence && <span>Industry: {opportunity.industry} ({opportunity.industryClassification?.source ?? "Source record"})</span>}</div><div className="mt-5 flex flex-wrap gap-3"><Link href={`/opportunities/${encodeURIComponent(opportunity.id)}`} className="inline-flex rounded-xl border border-[#cfd6dd] px-4 py-2.5 text-sm font-semibold text-[#29435d] transition hover:-translate-y-0.5 hover:border-[#9fb2c5] hover:bg-[#f3f7fa] active:translate-y-0">Review opportunity</Link><OpportunityApplicationLink opportunity={opportunity} className="inline-flex rounded-xl bg-[#174f8f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0f3f78] hover:shadow-md active:translate-y-0"/></div></article>;
}
