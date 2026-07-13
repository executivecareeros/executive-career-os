import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { companyDataSources, type CompanyMetric, type CompanySnapshot } from "@/lib/company-intelligence";
import { DailyBriefing } from "./daily-briefing";
import { DepartmentCard } from "./department-card";
import { FounderActionCard } from "./founder-action-card";
import { HealthCard } from "./health-card";
import type { FounderBetaTriage } from "@/lib/beta/types";
import Link from "next/link";

function metricDisplay(metric: CompanyMetric) {
  const { observation } = metric;
  if (observation.valueKind === "Unavailable") return observation.notes?.startsWith("Cannot Calculate") ? "Founder Input Required" : observation.status;
  return String(observation.value);
}

export function CompanyControlCenter({ snapshot, betaTriage }: { snapshot: CompanySnapshot; betaTriage?: FounderBetaTriage }) {
  const metric = (id: string) => snapshot.health.metrics.find((item) => item.definition.id === id)!;
  const healthCards = [
    ["Overall Company Health", snapshot.health.overallHealth, "Insufficient connected operational data for a reliable aggregate."],
    ["Product Health", snapshot.health.departments.find((item) => item.department === "Product")!.health, "Live activation and retention data are not connected."],
    ["Infrastructure Health", "Watch", "Exchange is operational; DKIM publication remains under Microsoft investigation."],
    ["Security Health", "Unknown", "No live security telemetry is connected."],
    ["Financial Health", "Unknown", "Verified cash, burn, revenue, and recurring totals are incomplete."],
    ["Customer Health", "Not Connected", "No customer-success or support platform is connected."],
    ["Beta Readiness", "At Risk", "Authoritative readiness gates remain unchecked."],
    ["Founder Capacity", "Unknown", "Verified founder-time and capacity data are unavailable."],
  ] as const;

  const snapshotMetrics = [metric("registered-accounts"), metric("activated-users"), metric("weekly-active-users"), metric("beta-participants"), metric("support-cases"), metric("repository-commits"), metric("application-routes"), metric("monthly-spending"), metric("annual-commitments"), metric("revenue"), metric("runway")];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <PageHeader eyebrow="Internal — Founder Access" title="Orendalis Company Control Center" description="Decision and exception management across company operations. Live integrations are not connected; every value identifies its source and freshness." />

      <section aria-label="Control center context" className="mt-6 grid gap-3 rounded-2xl border border-blue-400/15 bg-blue-400/[.06] p-4 text-sm sm:grid-cols-2 xl:grid-cols-6">
        <div><p className="text-xs text-slate-500">Date</p><p className="mt-1 text-slate-200">{new Date(snapshot.generatedAt).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "Europe/Istanbul" })}</p></div>
        <div><p className="text-xs text-slate-500">Company</p><p className="mt-1 text-slate-200">Orendalis</p></div>
        <div><p className="text-xs text-slate-500">Environment</p><p className="mt-1 text-slate-200">{snapshot.environment}</p></div>
        <div><p className="text-xs text-slate-500">Stage</p><p className="mt-1 text-slate-200">{snapshot.betaStage}</p></div>
        <div><p className="text-xs text-slate-500">Data freshness</p><p className="mt-1 text-slate-200">Partial · Manual</p></div>
        <div><p className="text-xs text-slate-500">Atlas briefing</p><p className="mt-1 text-amber-200">Demonstration</p></div>
      </section>

      <section aria-labelledby="health-title" className="mt-8"><div className="mb-4"><p className="atlas-kicker">Company health</p><h2 id="health-title" className="mt-2 text-xl font-semibold">Evidence before status</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{healthCards.map(([label, status, detail]) => <HealthCard key={label} label={label} status={status} detail={detail}/>)}</div></section>

      <div className="mt-8"><DailyBriefing brief={snapshot.brief}/></div>

      <SectionCard className="mt-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="atlas-kicker">Private beta access</p><h2 className="mt-2 text-xl font-semibold">Founder Invitation Management</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">Create, review, and revoke secure executive invitations without database access.</p></div><Link href="/company-control/invitations" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Manage Invitations</Link></div></SectionCard>

      <SectionCard className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Release 0.6</p><h2 className="mt-2 text-xl font-semibold">Private Beta Readiness</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{snapshot.beta.summary}</p></div><StatusBadge tone="warning">No-Go · {snapshot.beta.betaHealth}</StatusBadge></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {[
            ["Staging readiness", snapshot.beta.stagingReadiness], ["Production readiness", snapshot.beta.productionReadiness],
            ["Active design partners", snapshot.beta.activeDesignPartners], ["Invitations sent", snapshot.beta.invitationsSent],
            ["Invitations accepted", snapshot.beta.invitationsAccepted], ["Onboarding completed", snapshot.beta.onboardingCompleted],
            ["Assessments completed", snapshot.beta.assessmentsCompleted], ["Feedback waiting", snapshot.beta.feedbackWaiting],
            ["Critical bugs", snapshot.beta.criticalBugs], ["Privacy requests", snapshot.beta.privacyRequests], ["Support cases", snapshot.beta.supportCases],
          ].map(([label, value]) => <article key={String(label)} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs leading-5 text-slate-500">{label}</p><p className="mt-2 text-base font-semibold text-white">{value === undefined ? "Not Connected" : String(value)}</p><p className="mt-2 text-[11px] text-slate-600">{value === undefined ? "No operational source" : "Factual record"}</p></article>)}
        </div>
        <p className="mt-5 text-xs text-slate-600">Source: {snapshot.beta.sourceReference}. Missing participant activity is not represented as zero.</p>
        <div className="mt-6 border-t border-white/10 pt-5"><h3 className="font-medium text-white">Workflow gates</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(snapshot.beta.workflowGates).map(([gate,status])=><article key={gate} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="text-sm text-slate-300">{gate}</p><StatusBadge tone={status==="Complete"?"success":status==="Blocked"?"warning":"neutral"}>{status}</StatusBadge></article>)}</div></div>
      </SectionCard>

      <SectionCard className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Founder-only triage</p><h2 className="mt-2 text-xl font-semibold">Beta Feedback and Lifecycle Requests</h2><p className="mt-2 text-sm text-slate-400">Workspace isolation is enforced by RLS. Descriptions are visible only to the submitting executive and the Workspace founder.</p></div><StatusBadge tone={betaTriage?"info":"neutral"}>{betaTriage?"Connected":"Not Connected"}</StatusBadge></div>
        {betaTriage?<div className="mt-6 grid gap-6 xl:grid-cols-2"><div><h3 className="font-medium text-white">Feedback · {betaTriage.feedback.length}</h3><div className="mt-3 space-y-3">{betaTriage.feedback.length?betaTriage.feedback.map(item=><article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex flex-wrap gap-2"><StatusBadge tone={item.severity==="Critical"?"warning":"neutral"}>{item.severity}</StatusBadge><StatusBadge>{item.status}</StatusBadge><span className="text-xs text-slate-500">{item.category} · {item.workflowStep}</span></div><p className="mt-3 text-sm text-slate-300">{item.description}</p><p className="mt-3 text-xs text-slate-600">Follow-up consent: {item.consentToFollowUp?"Yes":"No"} · {item.createdAt}</p></article>):<p className="text-sm text-slate-500">No feedback submitted.</p>}</div></div><div><h3 className="font-medium text-white">Lifecycle requests · {betaTriage.lifecycle.length}</h3><div className="mt-3 space-y-3">{betaTriage.lifecycle.length?betaTriage.lifecycle.map(item=><article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-white">{item.requestType}</p><StatusBadge>{item.status}</StatusBadge></div><p className="mt-2 text-sm text-slate-400">{item.retentionStatus}</p><p className="mt-3 text-xs text-slate-600">{item.submittedAt}</p></article>):<p className="text-sm text-slate-500">No lifecycle requests submitted.</p>}</div></div></div>:<p className="mt-6 rounded-xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-500">Operational beta data is unavailable outside authenticated Supabase mode.</p>}
      </SectionCard>

      <SectionCard className="mt-8"><div><p className="atlas-kicker">Founder action center</p><h2 className="mt-2 text-xl font-semibold">Today&apos;s Founder Priorities</h2><p className="mt-2 text-sm text-slate-400">Deterministically ordered by urgency, importance, deadline, and blocker state.</p></div><div className="mt-6 grid gap-4 xl:grid-cols-3">{snapshot.actions.slice(0, 7).map((action, index) => <FounderActionCard key={action.id} action={action} rank={index + 1}/>)}</div></SectionCard>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <SectionCard><p className="atlas-kicker">Exceptions only</p><h2 className="mt-2 text-xl font-semibold">Alerts and Exceptions</h2><div className="mt-5 space-y-3">{snapshot.alerts.map((alert) => <article key={alert.id} className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium text-white">{alert.title}</h3><StatusBadge tone="warning">{alert.severity}</StatusBadge></div><p className="mt-2 text-sm text-slate-400">{alert.evidence.join(" ")}</p><p className="mt-3 text-xs text-slate-600">{alert.sourceReference}</p></article>)}</div></SectionCard>
        <SectionCard><p className="atlas-kicker">Deadlines</p><h2 className="mt-2 text-xl font-semibold">Next Seven Days</h2><div className="mt-5 space-y-4">{snapshot.deadlines.map((deadline) => <article key={deadline.id} className="border-l border-blue-400/40 pl-4"><p className="text-xs text-blue-300">{new Date(deadline.dueAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}</p><h3 className="mt-1 text-sm font-medium text-white">{deadline.title}</h3><p className="mt-1 text-xs text-slate-500">{deadline.department} · {deadline.type}</p></article>)}</div></SectionCard>
      </div>

      <SectionCard className="mt-8"><p className="atlas-kicker">Company snapshot</p><h2 className="mt-2 text-xl font-semibold">Measured, unavailable, or not connected</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{snapshotMetrics.map((item) => <article key={item.definition.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs leading-5 text-slate-500">{item.definition.name}</p><p className="mt-2 break-words text-lg font-semibold text-white">{metricDisplay(item)}</p><p className="mt-2 text-[11px] text-slate-600">{item.observation.valueKind} · {item.observation.freshness.state}</p></article>)}</div><p className="mt-5 text-xs text-slate-600">Revenue and runway are not treated as zero. Runway cannot be calculated until verified cash and burn inputs exist.</p></SectionCard>

      <SectionCard className="mt-8"><p className="atlas-kicker">Department overview</p><h2 className="mt-2 text-xl font-semibold">Accountability and connection health</h2><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{snapshot.health.departments.map((department) => <DepartmentCard key={department.department} department={department}/>)}</div></SectionCard>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <SectionCard><p className="atlas-kicker">Support</p><h2 className="mt-2 text-xl font-semibold">Microsoft Support</h2>{snapshot.supportCases.map((item) => <article key={item.id} className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-sm text-blue-300">{item.id}</p><StatusBadge tone="warning">{item.status}</StatusBadge></div><h3 className="mt-3 font-medium text-white">{item.subject}</h3><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-600">Next action</dt><dd className="mt-1 text-slate-300">{item.nextAction}</dd></div><div><dt className="text-xs text-slate-600">Blocker</dt><dd className="mt-1 text-slate-300">{item.blocker}</dd></div><div><dt className="text-xs text-slate-600">Owner</dt><dd className="mt-1 text-slate-300">{item.owner}</dd></div><div><dt className="text-xs text-slate-600">Escalation</dt><dd className="mt-1 text-slate-300">{item.escalationState}</dd></div></dl><p className="mt-4 text-xs text-slate-600">{item.sourceReference}</p></article>)}</SectionCard>
        <SectionCard><p className="atlas-kicker">Infrastructure and vendors</p><h2 className="mt-2 text-xl font-semibold">Provider Health</h2><div className="mt-5 space-y-3">{snapshot.vendors.map((vendor) => <article key={vendor.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium text-white">{vendor.provider}</h3><StatusBadge tone={vendor.status === "Watch" ? "warning" : "neutral"}>{vendor.status}</StatusBadge></div><p className="mt-2 text-sm text-slate-400">{vendor.openIssue ?? vendor.nextAction}</p><p className="mt-3 text-xs text-slate-600">Recovery: {vendor.recoveryReadiness} · Last verified: {vendor.lastVerified ?? "Unknown"}</p></article>)}</div></SectionCard>
      </div>

      <SectionCard id="sources" className="mt-8"><p className="atlas-kicker">Data source registry</p><h2 className="mt-2 text-xl font-semibold">Connection and authorization boundaries</h2><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><caption className="sr-only">Company data source registry</caption><thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500"><tr>{["Source", "Provider", "Connection", "Authorization", "Freshness", "Scope", "Next update"].map((heading) => <th key={heading} scope="col" className="px-3 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{companyDataSources.map((source) => <tr key={source.id}><th scope="row" className="px-3 py-4 font-medium text-white">{source.name}</th><td className="px-3 py-4 text-slate-400">{source.provider}</td><td className="px-3 py-4 text-slate-400">{source.connectionState}</td><td className="px-3 py-4 text-slate-400">{source.authorizationState}</td><td className="px-3 py-4 text-slate-400">{source.freshness.state}</td><td className="px-3 py-4 text-slate-400">{source.scopes.join(", ") || "None"}</td><td className="px-3 py-4 text-slate-400">{source.nextScheduledUpdate ?? "Manual"}</td></tr>)}</tbody></table></div></SectionCard>
    </div>
  );
}
