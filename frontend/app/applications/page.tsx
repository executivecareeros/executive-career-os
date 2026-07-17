import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationsWorkspace } from "@/components/applications/applications-workspace";
import { PageHeader } from "@/components/page-header";
import { applications } from "@/data/applications";
import { companies } from "@/data/companies";
import { opportunities } from "@/data/opportunities";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { loadLatestCollectedDecision } from "@/lib/live-collected-decision";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ApplicationsPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return <ApplicationsWorkspace applications={applications} opportunities={opportunities} companies={companies} />;
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/applications");
  const decision = await loadLatestCollectedDecision(createServerSupabaseClient(resolved.accessToken), resolved.context.workspace!.workspaceId).catch(() => undefined);
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-10"><PageHeader eyebrow="Your search" title="Applications" description="Only opportunities you choose to pursue appear here. Orendalis never creates an application or claims employer activity without your action." actions={<Link href="/opportunities" className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Find opportunities</Link>} />{decision?.action === "Pursue" ? <section className="mt-8 rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#55705d]">Pursue decision recorded</p><h2 className="mt-3 text-2xl font-semibold">{decision.title}</h2><p className="mt-1 text-sm text-[#626970]">{decision.companyName}</p><p className="mt-4 text-sm leading-6 text-[#626970]">This opportunity is ready for your next step. No external application has been submitted by Orendalis.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={`/opportunities/${encodeURIComponent(decision.opportunityId)}`} className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Review opportunity</Link><Link href="/tasks" className="inline-flex rounded-xl border border-[#d9dcde] bg-white px-5 py-3 text-sm font-semibold text-[#30343a]">Prepare next step</Link></div></section> : <section className="mt-8 rounded-2xl border border-dashed border-[#cfc7bc] bg-[#faf8f4] p-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#936b3f]">No active applications</p><h2 className="mt-3 text-2xl font-semibold">Choose an opportunity when it earns your attention</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#626970]">Select Pursue on an opportunity to bring it here. Until then, this page stays empty—no sample applications and no invented employer activity.</p><div className="mt-6"><Link href="/opportunities" className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Review ranked opportunities</Link></div></section>}</main>;
}
