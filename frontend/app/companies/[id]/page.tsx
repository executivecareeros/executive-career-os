import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CompanyDetail } from "@/components/companies/company-detail";
import { CompanyHistoryIntegration } from "@/components/companies/company-history-integration";
import { CompanyBlueprintAlignment } from "@/components/blueprint/company-alignment";
import { KnowledgePanel } from "@/components/knowledge/knowledge-panel";
import { companies, getCompanyById } from "@/data/companies";
import { opportunities } from "@/data/opportunities";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/types/opportunity";

type OpportunityRow = { domain_id: string; payload: Record<string, unknown>; updated_at?: string };

export function generateStaticParams() { return companies.map((company) => ({ id: company.id })); }

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") {
    const company = getCompanyById(id);
    if (!company) notFound();
    const linked = opportunities.filter((opportunity) => company.opportunityIds.includes(opportunity.id));
    return <><CompanyDetail company={company} linked={linked}/><div className="mx-auto max-w-7xl space-y-6 px-5 pb-6 sm:px-6 lg:px-10"><CompanyBlueprintAlignment company={company}/><KnowledgePanel entityId={company.id} title="Company Knowledge Timeline"/></div><CompanyHistoryIntegration companyId={company.id}/></>;
  }

  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=${encodeURIComponent(`/companies/${id}`)}`);
  const response = await createServerSupabaseClient(resolved.accessToken).request<OpportunityRow[]>(`opportunities?select=domain_id,payload,updated_at&workspace_id=eq.${resolved.context.workspace!.workspaceId}&archived_at=is.null&order=updated_at.desc`);
  if (response.error) throw new Error("Company evidence could not be loaded safely.");
  const companyName = decodeURIComponent(id);
  const linked = (response.data ?? []).filter((row) => row.payload.companyName === companyName);
  if (!linked.length) notFound();
  const records = linked.map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
  const first = records[0];
  const websites = [...new Set(records.map((record) => record.companyProfile?.website).filter(Boolean))] as string[];
  const sources = [...new Set(records.flatMap((record) => record.sources?.map((source) => source.name) ?? [record.source]).filter(Boolean))];
  const countries = [...new Set(records.map((record) => record.country).filter((value) => value && value !== "Unknown"))];
  const industries = [...new Set(records.map((record) => record.industry).filter((value) => value && value !== "Unknown"))];

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-10">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#936b3f]">Company briefing</p>
    <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-start"><div><h1 className="text-4xl font-semibold tracking-[-.04em] text-[#17191c]">{companyName}</h1><p className="mt-3 max-w-2xl text-[#626970]">Built only from current opportunity evidence. Unconfirmed company facts remain unknown.</p></div><span className="w-fit rounded-full bg-[#f3eee7] px-4 py-2 text-sm font-medium text-[#695238]">{records.length} active {records.length === 1 ? "opportunity" : "opportunities"}</span></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Fact label="Headquarters or role markets" value={countries.join(", ") || "Not confirmed"}/><Fact label="Industry" value={industries.join(", ") || "Not confirmed"}/><Fact label="Company size" value={first.companySize && first.companySize !== "Unknown" ? first.companySize : "Not confirmed"}/><Fact label="Evidence sources" value={sources.join(", ") || "Not confirmed"}/></section>
    <section className="mt-8 rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold text-[#17191c]">Open executive opportunities</h2><div className="mt-5 divide-y divide-[#eceeef]">{records.map((record) => <div key={record.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-[#17191c]">{record.jobTitle}</h3><p className="mt-1 text-sm text-[#626970]">{record.location} · {record.workArrangement} · {record.source}</p></div><Link href={`/opportunities/${encodeURIComponent(record.id)}`} className="inline-flex w-fit rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white">Review opportunity</Link></div>)}</div></section>
    <section className="mt-8 rounded-2xl border border-dashed border-[#cfc7bc] bg-[#faf8f4] p-6"><h2 className="font-semibold text-[#17191c]">Evidence boundary</h2><p className="mt-2 text-sm leading-6 text-[#626970]">ORENDALIS does not infer revenue, culture, leadership quality, or employer intent. Review the original evidence before making a decision.</p>{websites.length > 0 && <div className="mt-4 flex flex-wrap gap-3">{websites.slice(0, 3).map((website) => <a key={website} href={website} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dcde] bg-white px-4 py-2.5 text-sm font-semibold">Open source ↗</a>)}</div>}</section>
  </main>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[#e3e5e6] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8a8f93]">{label}</p><p className="mt-2 text-sm font-medium text-[#30343a]">{value}</p></div>; }
