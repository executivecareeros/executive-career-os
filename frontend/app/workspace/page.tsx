import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import type { ExecutiveProfileState } from "@/lib/profile/executive-profile-state";
import { loadExecutiveProfileState } from "@/lib/profile/executive-profile-state.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadExecutiveGeographicProfile } from "@/lib/geographic-profile-repository";
import type { ExecutiveGeographicProfile } from "@/lib/opportunity-geography";
import { ExecutivePreferencesForm } from "@/components/executive-preferences-form";
import { saveManualPreferencesAction } from "./actions";

type Experience = { id:string; organization_name?:string; role_title?:string; start_date?:string; end_date?:string; is_current?:boolean; notes?:string; created_at?:string };

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/workspace");
  const client = createServerSupabaseClient(resolved.accessToken);
  const workspace = resolved.context.workspace!;
  const [response, profile, preferences] = await Promise.all([
    client.request<Experience[]>(`professional_experiences?select=id,organization_name,role_title,start_date,end_date,is_current,notes,created_at&workspace_id=eq.${workspace.workspaceId}&executive_identity_id=eq.${workspace.executiveId}&archived_at=is.null&order=start_date.desc`),
    loadExecutiveProfileState(client, workspace.workspaceId, workspace.executiveId),
    loadExecutiveGeographicProfile(client, resolved.context),
  ]);
  return <LiveWorkspace experiences={response.data ?? []} profile={profile} preferences={preferences} preferencesSaved={(await searchParams).preferences === "saved"} />;
}

function LiveWorkspace({ experiences, profile, preferences, preferencesSaved }: { experiences:Experience[]; profile:ExecutiveProfileState; preferences: ExecutiveGeographicProfile; preferencesSaved: boolean }) {
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Your private career memory" title="Your profile" description="See exactly what Orendalis has saved, edit any confirmed fact, or import an updated CV." actions={<div className="flex flex-wrap gap-3"><Link href="/beta-workflow" className="inline-flex items-center rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Edit profile fields</Link><Link href="/import" className="inline-flex items-center rounded-xl border border-[#d9dcde] bg-white px-5 py-3 text-sm font-semibold text-[#30343a]">Update or replace CV</Link></div>} />

    <section className="mt-8 rounded-2xl border border-[#d8ddd9] bg-[#f6f8f6] p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#55705d]">Active career profile</p><h2 className="mt-2 text-2xl font-semibold text-[#17191c]">Your confirmed career profile</h2></div>
        <span className="inline-flex rounded-full border border-[#acd5b8] bg-[#eaf7ed] px-3 py-1 text-xs font-semibold text-[#28613a]">Active</span>
      </div>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <ProfileFact label="Saved career history" value={`${profile.confirmedRoleCount} confirmed ${profile.confirmedRoleCount === 1 ? "role" : "roles"}`} />
        <ProfileFact label="Processing" value={profile.activeCv?.parseStatus ?? "Complete"} />
        <ProfileFact label="Atlas context" value={profile.atlasState} />
        <ProfileFact label="Last updated" value={formatDate(profile.lastSuccessfulUpdate)} />
      </dl>
      <p className="mt-5 text-sm leading-6 text-[#626970]">Your original CV file is not retained. Orendalis stores only the structured career facts you confirmed. You can review and edit those facts below, or import an updated CV at any time.</p>
    </section>
    <ExecutivePreferencesForm profile={preferences} action={saveManualPreferencesAction} saved={preferencesSaved}/>

    {profile.cvVersions.length > 1 && <section className="mt-6 rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">CV update history</h2><div className="mt-4 space-y-3">{profile.cvVersions.map(version => <div key={version.key} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceeef] pt-3 first:border-0 first:pt-0"><div><p className="font-medium">{version.filename}</p><p className="text-sm text-[#747b82]">Processed {formatDate(version.lastUpdatedAt)}</p></div><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#55705d]">{version.active ? "Active" : "Previous"}</span></div>)}</div></section>}

    <section className="mt-6 rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#936b3f]">Saved profile</p><h2 className="mt-2 text-2xl font-semibold text-[#17191c]">Professional history</h2><p className="mt-3 text-sm leading-6 text-[#626970]">This is the latest confirmed information available to Atlas. Missing details stay blank until you add or confirm them.</p></section>
    <div className="mt-6 space-y-4">{experiences.length ? experiences.map((experience,index) => <article key={experience.id} className="rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#936b3f]">Experience {index + 1}</p><h2 className="mt-2 text-xl font-semibold text-[#17191c]">{experience.role_title || "Role not confirmed"}</h2><p className="mt-1 text-sm text-[#626970]">{experience.organization_name || "Company not confirmed"}</p></div><span className="text-sm text-[#747b82]">{experience.start_date || "Start unknown"} – {experience.is_current ? "Present" : experience.end_date || "End unknown"}</span></div>{experience.notes && <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#626970]">{safeNotes(experience.notes)}</p>}<div className="mt-5"><Link href="/beta-workflow" className="text-sm font-semibold text-[#6f4e2d] underline-offset-4 hover:underline">Review or edit this role</Link></div></article>) : <section className="rounded-2xl border border-dashed border-[#cfc7bc] bg-[#faf8f4] p-8 text-center"><h2 className="text-xl font-semibold text-[#17191c]">No career history saved yet</h2><p className="mt-2 text-sm text-[#626970]">Import your CV or add your first role manually.</p><div className="mt-5"><Link href="/import" className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Import your CV</Link></div></section>}</div>
  </main>;
}

function ProfileFact({ label, value }: { label:string; value:string }) { return <div className="rounded-xl border border-[#dfe5e0] bg-white p-4"><dt className="text-xs font-semibold uppercase tracking-[.12em] text-[#747b82]">{label}</dt><dd className="mt-2 font-semibold text-[#17191c]">{value}</dd></div>; }
function formatDate(value?:string) { if (!value) return "Not recorded"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat("en", { dateStyle:"medium" }).format(date); }
function safeNotes(value:string) { try { const parsed = JSON.parse(value) as Record<string,unknown>; return typeof parsed.roleDescription === "string" ? parsed.roleDescription : typeof parsed.companyDescription === "string" ? parsed.companyDescription : value; } catch { return value; } }
