import Link from "next/link";
import { decideRoomPermanenceAction } from "@/app/rooms/actions";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import type { FounderBetaTriage } from "@/lib/beta/types";
import type { CompanySnapshot } from "@/lib/company-intelligence";
import type { ProductLearningDashboard } from "@/lib/product-learning";

type RoomPermanenceRequest={room_id:string;title:string;short_purpose:string;language_name:string;permanence_reason:string;creator_name:string;requested_at:string;closes_at:string};
type LiveOperations={coverage?:Record<string,unknown>;coverageError?:string;learning?:ProductLearningDashboard;learningError?:string;feedbackWaiting:number;roomDecisions:number};
type ProviderMetric={provider_id?:string;attempts?:number;successes?:number;failures?:number;last_success?:string};

const numeric=(source:Record<string,unknown>|undefined,key:string)=>typeof source?.[key]==="number"?source[key] as number:undefined;
const providers=(source:Record<string,unknown>|undefined)=>Array.isArray(source?.providers)?source.providers as ProviderMetric[]:[];
const totalProvider=(source:Record<string,unknown>|undefined,key:"successes"|"failures")=>providers(source).reduce((total,item)=>total+(item[key]??0),0);
const formatDuration=(seconds:number|undefined)=>seconds===undefined?"Awaiting activity":seconds<60?`${seconds}s`:`${Math.floor(seconds/60)}m ${seconds%60}s`;
const formatNumber=(value:number|undefined)=>value===undefined?"Awaiting measurement":value.toLocaleString("en-GB");
const titleCase=(value:string)=>value.replace(/_/g," ").replace(/\b\w/g,letter=>letter.toUpperCase());

function MetricCard({label,value,detail="Measured live"}:{label:string;value:string|number|undefined;detail?:string}){
  const display=typeof value==="number"?value.toLocaleString("en-GB"):value??"Awaiting measurement";
  return <article className="rounded-xl border border-[#dce3ec] bg-[#f8fafc] p-4"><p className="text-xs leading-5 text-[#657184]">{label}</p><p className="mt-2 break-words text-xl font-semibold text-[#182234]">{display}</p><p className="mt-2 text-[11px] text-[#7a8798]">{detail}</p></article>;
}

function Distribution({title,items}:{title:string;items:Array<{name:string;executives:number}>}){
  return <article className="rounded-xl border border-[#dce3ec] bg-white p-4"><h3 className="text-sm font-semibold text-[#182234]">{title}</h3><div className="mt-3 space-y-2">{items.slice(0,7).map(item=><div key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-[#657184]">{titleCase(item.name)}</span><span className="font-semibold text-[#182234]">{item.executives.toLocaleString("en-GB")}</span></div>)}{!items.length&&<p className="text-sm text-[#7a8798]">No confirmed activity yet.</p>}</div></article>;
}

export function CompanyControlCenter({snapshot,betaTriage,founderBootstrapComplete=false,roomPermanenceRequests=[],operations}:{snapshot:CompanySnapshot;betaTriage?:FounderBetaTriage;founderBootstrapComplete?:boolean;roomPermanenceRequests?:RoomPermanenceRequest[];operations?:LiveOperations}){
  const coverage=operations?.coverage;
  const learning=operations?.learning;
  const providerMetrics=providers(coverage);
  const queue=coverage?.queue&&typeof coverage.queue==="object"?coverage.queue as Record<string,number>:{};
  const persistence=coverage?.persistence&&typeof coverage.persistence==="object"?coverage.persistence as Record<string,number>:{};
  const liveMetrics=[
    ["Active opportunities",numeric(coverage,"canonicalOpportunities")],
    ["Fresh opportunities · 48h",numeric(coverage,"freshOpportunities")],
    ["Employers represented",numeric(coverage,"employers")],
    ["Countries represented",numeric(coverage,"countriesRepresented")],
    ["Provider successes · 24h",coverage?totalProvider(coverage,"successes"):undefined],
    ["Provider failures · 24h",coverage?totalProvider(coverage,"failures"):undefined],
    ["Registered executives",learning?.registeredExecutives],
    ["Active now · 15m",learning?.activeNow],
    ["Active executives · 30d",learning?.executives],
    ["Sessions · 30d",learning?.sessions],
    ["Returning executives",learning?.returningExecutives],
    ["Average session",formatDuration(learning?.averageSessionSeconds)],
    ["Feedback waiting",operations?.feedbackWaiting],
    ["Room decisions",operations?.roomDecisions],
  ] as const;
  const connected=Boolean(coverage&&learning&&!operations?.coverageError&&!operations?.learningError);

  return <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
    <PageHeader eyebrow="Founder access" title="ORENDALIS Company Control" description="Live company performance, executive activity, opportunity coverage and decisions requiring Founder attention."/>

    <section aria-label="Live company status" className="mt-6 grid gap-3 rounded-2xl border border-[#dce3ec] bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <div><p className="text-xs text-[#657184]">Company</p><p className="mt-1 font-semibold text-[#182234]">ORENDALIS</p></div>
      <div><p className="text-xs text-[#657184]">Operating status</p><p className="mt-1 font-semibold text-emerald-700">Live · Production</p></div>
      <div><p className="text-xs text-[#657184]">Founder access</p><p className="mt-1 font-semibold text-[#182234]">{founderBootstrapComplete?"Verified · Protected":"Access review required"}</p></div>
      <div><p className="text-xs text-[#657184]">Measured</p><p className="mt-1 font-semibold text-[#182234]">{new Date(snapshot.generatedAt).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Istanbul"})}</p></div>
    </section>

    <SectionCard className="mt-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Company snapshot</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Live operating position</h2><p className="mt-2 text-sm text-[#657184]">Current network scale, executive activity, feedback and governance from connected ORENDALIS systems.</p></div><StatusBadge tone={connected?"success":"warning"}>{connected?"Live · Connected":"Connection needs attention"}</StatusBadge></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{liveMetrics.map(([label,value])=><MetricCard key={label} label={label} value={value}/>)}</div>
      {(operations?.coverageError||operations?.learningError)&&<p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">A live source failed during this request. No value was guessed. Refresh once; if it persists, inspect provider operations.</p>}
      {learning&&<div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Distribution title="Countries" items={learning.profileDimensions.countries??[]}/>
        <Distribution title="Current professional titles" items={learning.profileDimensions.currentTitles??[]}/>
        <Distribution title="Preferred industries" items={learning.profileDimensions.preferredIndustries??[]}/>
        <Distribution title="Most-used areas" items={learning.features.map(item=>({name:item.name,executives:item.executives}))}/>
        <Distribution title="Devices" items={learning.devices.map(item=>({name:item.name,executives:item.sessions}))}/>
        <Distribution title="Browsers" items={learning.browsers.map(item=>({name:item.name,executives:item.sessions}))}/>
      </div>}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-[#dce3ec] pt-5"><Link href="/company-control/product-learning" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#182234] px-5 py-3 text-sm font-semibold text-white">Open executive analytics</Link><Link href="/opportunities" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#cbd5e1] px-5 py-3 text-sm font-semibold text-[#182234]">Review opportunity experience</Link></div>
    </SectionCard>

    <section className="mt-8 grid gap-6 xl:grid-cols-2">
      <SectionCard><div className="flex items-start justify-between gap-4"><div><p className="atlas-kicker">Opportunity Network</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Provider operations</h2></div><StatusBadge tone={providerMetrics.some(item=>(item.failures??0)>0)?"warning":"success"}>{providerMetrics.length} active provider{providerMetrics.length===1?"":"s"}</StatusBadge></div>
        <div className="mt-5 space-y-3">{providerMetrics.map(provider=><article key={provider.provider_id} className="rounded-xl border border-[#dce3ec] bg-[#f8fafc] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-[#182234]">{titleCase(provider.provider_id??"Provider")}</h3><span className="text-xs text-[#657184]">Last success {provider.last_success?new Date(provider.last_success).toLocaleString("en-GB"):"not recorded"}</span></div><div className="mt-3 grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-[#7a8798]">Attempts</p><p className="font-semibold text-[#182234]">{formatNumber(provider.attempts)}</p></div><div><p className="text-xs text-[#7a8798]">Succeeded</p><p className="font-semibold text-emerald-700">{formatNumber(provider.successes)}</p></div><div><p className="text-xs text-[#7a8798]">Failed</p><p className={`font-semibold ${(provider.failures??0)>0?"text-rose-700":"text-[#182234]"}`}>{formatNumber(provider.failures)}</p></div></div></article>)}{!providerMetrics.length&&<p className="text-sm text-[#657184]">No provider run was recorded in the last 24 hours.</p>}</div>
      </SectionCard>
      <SectionCard><p className="atlas-kicker">Factory throughput</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Queue and persistence · 24h</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{Object.entries(queue).map(([status,value])=><MetricCard key={status} label={`${titleCase(status)} jobs`} value={value}/>) }<MetricCard label="Persistence batches" value={persistence.batches}/><MetricCard label="Records processed" value={persistence.records}/><MetricCard label="New canonical records" value={persistence.inserted}/><MetricCard label="Updated records" value={persistence.updated}/></div></SectionCard>
    </section>

    <SectionCard className={`mt-8 ${roomPermanenceRequests.length?"border-violet-300 bg-violet-50":""}`}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Executive Rooms governance</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Room permanence decisions</h2><p className="mt-2 max-w-3xl text-sm text-[#657184]">Executive-created rooms remain temporary until their purpose and permanence reason are reviewed.</p></div><StatusBadge tone={roomPermanenceRequests.length?"warning":"success"}>{roomPermanenceRequests.length?`${roomPermanenceRequests.length} decision${roomPermanenceRequests.length===1?"":"s"} waiting`:"No decisions waiting"}</StatusBadge></div>{roomPermanenceRequests.length>0&&<div className="mt-6 space-y-4">{roomPermanenceRequests.map(request=><article key={request.room_id} className="rounded-xl border border-violet-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-[#182234]">{request.title}</h3><p className="mt-1 text-xs text-violet-700">{request.language_name} · Created by {request.creator_name}</p></div><Link href={`/rooms/${request.room_id}`} className="text-sm font-semibold text-blue-700">Review room</Link></div><p className="mt-4 text-sm text-[#354052]"><strong>Purpose:</strong> {request.short_purpose}</p><p className="mt-2 text-sm text-[#354052]"><strong>Reason:</strong> {request.permanence_reason}</p><form action={decideRoomPermanenceAction} className="mt-4 flex flex-col gap-3 sm:flex-row"><input type="hidden" name="roomId" value={request.room_id}/><label className="sr-only" htmlFor={`decision-${request.room_id}`}>Founder decision note</label><input id={`decision-${request.room_id}`} name="decisionNote" required minLength={3} maxLength={600} className="min-w-0 flex-1 rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm text-[#182234]" placeholder="Record the reason for your decision"/><button name="decision" value="approve" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">Make permanent</button><button name="decision" value="reject" className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700">Keep temporary</button></form></article>)}</div>}</SectionCard>

    <section className="mt-8 grid gap-6 xl:grid-cols-2">
      <SectionCard><p className="atlas-kicker">Executive access</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Invitation management</h2><p className="mt-2 text-sm text-[#657184]">Create, review and revoke secure executive invitations.</p><Link href="/company-control/invitations" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#182234] px-5 py-3 text-sm font-semibold text-white">Manage invitations</Link></SectionCard>
      <SectionCard><div className="flex items-start justify-between gap-4"><div><p className="atlas-kicker">Executive requests</p><h2 className="mt-2 text-xl font-semibold text-[#182234]">Feedback and data rights</h2></div><StatusBadge tone={(betaTriage?.feedback.length??0)+(betaTriage?.lifecycle.length??0)>0?"info":"success"}>{(betaTriage?.feedback.length??0)+(betaTriage?.lifecycle.length??0)} recorded</StatusBadge></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><MetricCard label="Feedback records" value={betaTriage?.feedback.length??0}/><MetricCard label="Lifecycle requests" value={betaTriage?.lifecycle.length??0}/></div></SectionCard>
    </section>

    <p className="mt-8 text-xs leading-5 text-[#7a8798]">Founder-only aggregates exclude age, gender, exact location, email addresses, CV content, passwords, IP addresses and private Atlas conversations. Missing facts are not inferred.</p>
  </div>;
}
