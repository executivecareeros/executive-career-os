"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SecondaryButton } from "@/components/secondary-button";
import { SearchInput } from "@/components/search-input";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import type { Opportunity } from "@/types/opportunity";
import { toPlainText } from "@/lib/plain-text";
import { assessOpportunityFreshness } from "@/lib/opportunity-universe";
import type { Locale } from "@/lib/locale";
import { LiveOpportunityCard } from "./live-opportunity-card";
import { LinkedInImportPanel } from "./linkedin-import-panel";
import { assessOpportunityConfidence, sortOpportunitiesForExecutive, type ExecutiveCareerContext, type ExecutiveGeographicProfile } from "@/lib/opportunity-geography";

type JobsView = "Search" | "Recommended";
type Props = { opportunity?: LiveOpportunityViewModel; collected: Opportunity[]; geographicProfile: ExecutiveGeographicProfile; careerContext: ExecutiveCareerContext; canConfirmFounderFixture: boolean; profileConfirmationAction: () => void | Promise<void>; collectionNotice?: string; collectionMessage?: string; imported?: string; found?: string; collectionAction: (formData: FormData) => void | Promise<void>; linkedInAction: (formData: FormData) => void | Promise<void>; alertAction: (formData: FormData) => void | Promise<void>; linkedInNotice?: string; verification?: string; linkedInResetKey?: string; initialQuery?: string; locale?: Locale; cvComplete?: boolean; savedRoles?: string; newRoles?: string };

export function LiveOpportunityUniverse({ opportunity, collected, geographicProfile, careerContext, canConfirmFounderFixture, profileConfirmationAction, collectionNotice, collectionMessage, imported, found, collectionAction, linkedInAction, alertAction, linkedInNotice, verification, linkedInResetKey, initialQuery = "", locale = "en", cvComplete, savedRoles, newRoles }: Props) {
  const [view, setView] = useState<JobsView>(opportunity?.atlasAction || collected.length ? "Recommended" : "Search");
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [industry, setIndustry] = useState("");
  const [minimumSalary, setMinimumSalary] = useState("");
  const [sort, setSort] = useState<"best" | "newest" | "company">("best");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const tr = locale === "tr";
  const collectedVisible = useMemo(() => {
    if (view === "Recommended") return sortOpportunitiesForExecutive(collected, geographicProfile, careerContext).filter((item) => {
      const assessment = assessOpportunityConfidence(item, geographicProfile, careerContext);
      return assessment.eligibility !== "Not Currently Eligible";
    }).slice(0, 12);
    const filtered = collected.filter((item) => {
    const text = `${item.companyName} ${item.jobTitle} ${item.location} ${item.source} ${item.industry}`.toLowerCase();
    const salary = item.salaryMax ?? item.salaryMin ?? 0;
    const eligibility = assessOpportunityConfidence(item, geographicProfile, careerContext).eligibility;
    return (!eligibleOnly || eligibility === "Eligible" || eligibility === "Probably Eligible") && (!query || text.includes(query.toLowerCase())) && (!location || item.location.toLowerCase().includes(location.toLowerCase())) && (!company || item.companyName.toLowerCase().includes(company.toLowerCase())) && (!workModel || item.workArrangement === workModel) && (!industry || (item.industry ?? "").toLowerCase().includes(industry.toLowerCase())) && (!minimumSalary || salary >= Number(minimumSalary));
    });
    if (sort === "newest") return [...filtered].sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    if (sort === "company") return [...filtered].sort((a,b) => a.companyName.localeCompare(b.companyName));
    return sortOpportunitiesForExecutive(filtered, geographicProfile, careerContext);
  }, [careerContext, collected, company, eligibleOnly, geographicProfile, industry, location, minimumSalary, query, sort, view, workModel]);
  const clearFilters = () => { setQuery(""); setLocation(""); setCompany(""); setIndustry(""); setWorkModel(""); setMinimumSalary(""); };

  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow={tr ? "İşler" : "Jobs"} title={tr ? "Bir sonraki yönetici rolünü bul" : "Find your next executive role"} description={tr ? "Fırsatları tek yerde ara veya paylaşmayı seçtiğin tercihlere göre Atlas'ın alanı daraltmasına izin ver." : "Search opportunities in one place, or let Atlas narrow the field using the preferences you choose to share."} actions={<SecondaryButton href="/applications">{tr ? "Başvuruları gör" : "View applications"}</SecondaryButton>} />
    {cvComplete && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">{tr ? `Deneyimin kaydedildi. ${savedRoles ?? "0"} rol onaylandı${newRoles !== undefined ? ` (${newRoles} yeni)` : ""}. Şimdi sana uygun işleri ara veya Atlas önerilerini incele.` : `Your experience is saved. ${savedRoles ?? "0"} ${savedRoles === "1" ? "role is" : "roles are"} confirmed${newRoles !== undefined ? ` (${newRoles} newly added)` : ""}. Search jobs now, or review the opportunities Atlas recommends.`}</p>}
    {canConfirmFounderFixture && geographicProfile.profileConfidence === 0 && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-semibold">Confirm one detail to improve ranking</p><p className="mt-2">Your CV suggests you are based in Türkiye and authorized to work in the EU. Is that correct?</p><div className="mt-4 flex gap-3"><form action={profileConfirmationAction}><button className="rounded-xl bg-[#17191c] px-4 py-2 font-semibold text-white">Yes</button></form><Link href="/import" className="rounded-xl border border-amber-300 bg-white px-4 py-2 font-semibold">Edit</Link></div></section>}
    <nav className="mt-8 inline-flex rounded-full border border-[#dfe2e3] bg-white p-1" aria-label={tr ? "İş görünümleri" : "Jobs views"}>{(["Search", "Recommended"] as JobsView[]).map((item) => <button key={item} type="button" onClick={() => setView(item)} aria-current={view === item ? "page" : undefined} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${view === item ? "bg-[#17191c] text-white" : "text-[#626970] hover:bg-[#f3f4f4]"}`}>{item === "Search" ? (tr ? "İş ara" : "Search jobs") : (tr ? "Atlas önerileri" : "Atlas recommendations")}</button>)}</nav>

    {view === "Search" && <section className="mt-6 rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-[#17191c]">{tr ? "Yönetici rollerinde ara" : "Search executive jobs"}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SearchInput label={tr ? "Rol veya anahtar kelime" : "Role or keyword"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tr ? "Gelir Direktörü" : "Chief Revenue Officer"} />
        <SearchInput label={tr ? "Konum" : "Location"} value={location} onChange={(event) => setLocation(event.target.value)} placeholder={tr ? "İstanbul veya Uzaktan" : "London or Remote"} />
        <SearchInput label={tr ? "Şirket" : "Company"} value={company} onChange={(event) => setCompany(event.target.value)} placeholder={tr ? "Şirket adı" : "Company name"} />
        <SearchInput label={tr ? "Sektör" : "Industry"} value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder={tr ? "Teknoloji" : "Technology"} />
        <label className="text-sm text-[#565c62]">{tr ? "Çalışma modeli" : "Work model"}<select value={workModel} onChange={(event) => setWorkModel(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c]"><option value="">{tr ? "Tümü" : "Any"}</option><option value="Remote">{tr ? "Uzaktan" : "Remote"}</option><option value="Hybrid">{tr ? "Hibrit" : "Hybrid"}</option><option value="On-site">{tr ? "Ofiste" : "On-site"}</option></select></label>
        <label className="text-sm text-[#565c62]">{tr ? "Asgari ücret" : "Minimum salary"}<input type="number" min="0" value={minimumSalary} onChange={(event) => setMinimumSalary(event.target.value)} placeholder="150000" className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c] placeholder:text-[#9aa0a5]" /></label>
        <label className="text-sm text-[#565c62]">Sort<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm"><option value="best">Best Match</option><option value="newest">Newest</option><option value="company">Company A–Z</option></select></label>
        <label className="flex items-center gap-3 rounded-xl border border-[#d9dcde] px-4 py-3 text-sm text-[#565c62]"><input type="checkbox" checked={eligibleOnly} onChange={event => setEligibleOnly(event.target.checked)}/>Show only eligible roles</label>
      </div>
      <LinkedInImportPanel locale={locale} linkedInAction={linkedInAction} alertAction={alertAction} notice={linkedInNotice} message={collectionMessage} verification={verification} resetKey={linkedInResetKey} />
      <details className="mt-5 border-t border-[#eceeef] pt-4 text-sm"><summary className="cursor-pointer font-medium text-[#536f80]">{tr ? "Şirket kariyer sayfasından iş ekle" : "Add jobs from a company career page"}</summary><form action={collectionAction} className="mt-4 flex max-w-2xl flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="careers-page">{tr ? "Şirket kariyer sayfası" : "Company career page"}</label><input id="careers-page" name="board" required placeholder={tr ? "Şirket kariyer sayfası bağlantısını yapıştır" : "Paste a company career page URL"} className="min-w-0 flex-1 rounded-xl border border-[#d9dcde] bg-white px-4 py-2.5 text-sm text-[#17191c]"/><button className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-medium text-white">{tr ? "İşleri ekle" : "Add jobs"}</button></form></details>
      {collectionNotice && <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${collectionNotice === "complete" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} role="status">{collectionNotice === "complete" ? (tr ? `${found ?? "0"} rol bulundu; ${imported ?? "0"} kayıt eklendi veya güncellendi.` : `${found ?? "0"} roles found; ${imported ?? "0"} added or updated.`) : collectionMessage ?? (tr ? "Bu kariyer sayfası yenilenemedi." : "That career page could not be refreshed.")}</p>}
    </section>}

    <div className="mt-6">
      {view === "Recommended" && opportunity && <LiveOpportunityCard opportunity={opportunity} />}
      {(view === "Search" || (view === "Recommended" && !opportunity)) && collectedVisible.length > 0 && <div className="grid gap-5 xl:grid-cols-2">{collectedVisible.map((item) => <CollectedOpportunityCard key={item.id} opportunity={item} locale={locale} geographicProfile={geographicProfile} careerContext={careerContext} />)}</div>}
      {view === "Recommended" && !opportunity && !collectedVisible.length && <EmptyState eyebrow={tr ? "Atlas önerileri" : "Atlas recommendations"} title={tr ? "Henüz öneri yok" : "No recommendations yet"} description={tr ? "Kaydedilmiş kariyer profilini incele. Atlas, doğrulanmış deneyimin ve tercihlerin yeterli olduğunda hangi fırsatların ilgini hak ettiğini açıklar." : "Review your saved career profile. Atlas will explain which opportunities deserve attention when your confirmed experience and preferences provide enough evidence."} action={<SecondaryButton href="/workspace">{tr ? "Profili incele" : "Review profile"}</SecondaryButton>} />}
      {view === "Search" && !collectedVisible.length && <EmptyState eyebrow={tr ? "İş ara" : "Search jobs"} title={collected.length ? (tr ? "Bu filtrelerle eşleşen iş yok" : "No jobs match these filters") : (tr ? "İş araman burada başlıyor" : "Your job search starts here")} description={collected.length ? (tr ? "Bir veya daha fazla filtreyi genişletmeyi dene." : "Try widening one or more filters.") : (tr ? "Kaynaklar bağlandıkça işler burada görünür. Yukarıdan bir şirket kariyer sayfası da ekleyebilirsin." : "Jobs will appear here as sources are connected. You can also add a company career page above.")} action={collected.length ? <SecondaryButton onClick={clearFilters}>{tr ? "Filtreleri temizle" : "Clear filters"}</SecondaryButton> : <SecondaryButton href="/import">{tr ? "CV'ni yükle" : "Upload your CV"}</SecondaryButton>} />}
    </div>
  </div>;
}

function CollectedOpportunityCard({ opportunity, locale, geographicProfile, careerContext }: { opportunity: Opportunity; locale: Locale; geographicProfile: ExecutiveGeographicProfile; careerContext: ExecutiveCareerContext }) {
  const freshness = assessOpportunityFreshness(opportunity);
  const tr = locale === "tr";
  const confidence = assessOpportunityConfidence(opportunity, geographicProfile, careerContext);
  const salary = opportunity.salaryMin !== undefined || opportunity.salaryMax !== undefined
    ? `${opportunity.salaryCurrency ?? "Currency not confirmed"} ${opportunity.salaryMin?.toLocaleString("en-GB") ?? "?"}${opportunity.salaryMax !== undefined ? `–${opportunity.salaryMax.toLocaleString("en-GB")}` : ""}`
    : (tr ? "Ücret açıklanmadı" : "Compensation not disclosed");
  const lastVerifiedAt = opportunity.sources?.map((source) => source.lastVerifiedAt).filter(Boolean).sort().at(-1) ?? opportunity.lastObservedAt;
  const verificationLabel = opportunity.verificationStatus === "Employer source matched" ? (tr ? "İşveren kaynağıyla eşleşti" : opportunity.verificationStatus) : opportunity.verificationStatus === "Unverified LinkedIn observation" ? (tr ? "Doğrulanmamış LinkedIn gözlemi" : opportunity.verificationStatus) : opportunity.verificationStatus;
  return <article className="rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f3] text-xs font-semibold text-[#626970]">{opportunity.companyInitials}</div><div><p className="text-sm font-medium text-[#536f80]">{opportunity.companyName}</p><h2 className="mt-1 text-lg font-semibold text-[#17191c]">{opportunity.jobTitle}</h2><p className="mt-2 text-sm text-[#747b82]">{opportunity.location} · {translateOpportunityValue(opportunity.workArrangement, tr)}</p><p className="mt-1 text-sm font-medium text-[#30343a]">{salary}</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#edf3f5] px-2 py-1 font-medium text-[#36576a]">{confidence.label} · {confidence.opportunityConfidence}%</span><span className="rounded-full bg-[#f5f6f6] px-2 py-1 text-[#626970]">{confidence.eligibility}</span></div><p className="mt-2 text-xs text-[#626970]">{confidence.explanation}</p></div></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-[#626970]">{opportunity.summary ? toPlainText(opportunity.summary) : (tr ? "İşverenin yayımladığı açıklamayı incelemek için rolü aç." : "Open the role to review the employer's published description.")}</p><div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7a8086]"><span>{tr && opportunity.source === "LinkedIn discovery" ? "LinkedIn keşfi" : opportunity.source}</span><span>{tr ? `${freshness.ageHours} saat önce güncellendi` : `Updated ${freshness.ageHours}h ago`}</span>{lastVerifiedAt && <span>{tr ? "Kaynak doğrulandı" : `Source verified ${new Date(lastVerifiedAt).toLocaleDateString("en-GB")}`}</span>}{opportunity.verificationStatus && <span className={`rounded-full px-2 py-1 font-medium ${opportunity.verificationStatus === "Employer source matched" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{verificationLabel}</span>}</div><div className="mt-5 flex flex-wrap gap-3"><Link aria-label={`Review ${opportunity.jobTitle} at ${opportunity.companyName}`} href={`/opportunities/${encodeURIComponent(opportunity.id)}`} className="inline-flex rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-medium text-white hover:bg-black">{tr ? "İşi gör" : "Review opportunity"}</Link>{opportunity.sourceUrl && <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border border-[#d9dcde] px-4 py-2.5 text-sm font-medium text-[#30343a] hover:bg-[#f5f6f6]">{tr ? "Orijinal ilan ↗" : "Original listing ↗"}</a>}</div></article>;
}

function translateOpportunityValue(value: string, tr: boolean) { if (!tr) return value; return ({ Unknown: "Bilinmiyor", Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste", "Full-time": "Tam zamanlı", "Part-time": "Yarı zamanlı", Contract: "Sözleşmeli" } as Record<string, string>)[value] ?? value; }
