import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import type { ProductLearningDashboard } from "@/lib/product-learning";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Founder Product Learning", description: "Founder-only aggregate controlled-beta product learning." };

const labels: Record<string, string> = { profile: "Profile", cv_import: "CV import", opportunities: "Jobs", opportunity_review: "Opportunity review", atlas: "Atlas", applications: "Applications" };

function Distribution({ title, values }: { title: string; values: Array<{ name: string; executives?: number; sessions?: number; events?: number }> }) {
  return <SectionCard><h2 className="text-lg font-semibold text-[#182234]">{title}</h2><div className="mt-4 space-y-3">{values.length ? values.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 border-b border-[#e3e8ef] pb-3 text-sm"><span className="text-[#657184]">{labels[item.name] ?? item.name}</span><span className="font-semibold text-[#182234]">{item.executives ?? item.sessions ?? item.events ?? 0}</span></div>) : <p className="text-sm text-[#7a8798]">No confirmed aggregate yet.</p>}</div></SectionCard>;
}

export default async function ProductLearningPage() {
  const resolved = await resolveFounderAccess();
  if (!resolved) notFound();
  const response = await createServerSupabaseClient(resolved.accessToken).request<ProductLearningDashboard>("rpc/get_founder_product_learning_dashboard", { method: "POST", body: JSON.stringify({ window_days: 30 }) });
  const data = response.data;
  if (response.error || !data) throw new Error("Founder product-learning aggregates are unavailable.");

  const headline = [
    ["Verified accounts", data.verifiedAccounts], ["Active executive workspaces", data.registeredExecutives], ["Accounts awaiting setup", data.accountsAwaitingWorkspace], ["LinkedIn accounts", data.linkedInAccounts], ["Active now", data.activeNow], ["Active · 30 days", data.executives], ["Sessions", data.sessions], ["Returning executives", data.returningExecutives], ["Average session", `${Math.floor(data.averageSessionSeconds / 60)}m ${data.averageSessionSeconds % 60}s`],
  ] as const;
  return <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
    <PageHeader eyebrow="Internal — Founder Access" title="Real Executive Product Learning" description="Aggregate controlled-beta signals show where executives find value and where they stop. Raw activity, identities and sensitive profile content are not exposed." />
    <div className="mt-6 flex flex-wrap items-center gap-3"><StatusBadge tone="success">First-party · Founder only</StatusBadge><StatusBadge>Last 30 days</StatusBadge><span className="text-xs text-slate-500">Generated {new Date(data.generatedAt).toLocaleString("en-GB")}</span></div>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{headline.map(([label,value]) => <article key={label} className="rounded-2xl border border-[#dce3ec] bg-white p-5"><p className="text-xs uppercase tracking-[.16em] text-[#657184]">{label}</p><p className="mt-3 text-3xl font-semibold text-[#182234]">{value}</p></article>)}</section>
    <section className="mt-6 grid gap-6 lg:grid-cols-2"><Distribution title="Activation funnel" values={data.funnel.map(item => ({ name: item.stage, executives: item.executives }))}/><Distribution title="Feature usage" values={data.features}/><Distribution title="Device mix" values={data.devices}/><Distribution title="Browser mix" values={data.browsers}/></section>
    <section className="mt-6 grid gap-6 lg:grid-cols-3">{Object.entries(data.profileDimensions).map(([key,values]) => <Distribution key={key} title={key.replace(/([A-Z])/g, " $1").replace(/^./, value => value.toUpperCase())} values={values}/>)}</section>
    <SectionCard className="mt-6"><p className="atlas-kicker">Privacy boundary</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Only decision-useful, minimized signals</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-[#657184]">ORENDALIS does not collect age, gender, exact location, IP addresses, raw browser fingerprints, CV content, email addresses, passwords, or private Atlas conversations for product analytics. Country and career segments appear only when the executive has explicitly confirmed them. Missing information remains Unknown.</p></SectionCard>
  </div>;
}
