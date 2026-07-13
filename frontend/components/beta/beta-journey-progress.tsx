import Link from "next/link";

type JourneyStatus="Complete"|"Current"|"Not Started"|"Locked";
const steps=[
  {label:"Workspace",key:"Onboarding",href:"/welcome?ready=1",why:"Your private Career Memory is ready.",needs:"Nothing else—your foundation is secure."},
  {label:"Professional History",key:"Professional History",href:"#professional-history",why:"Confirmed experience gives Atlas reliable career context.",needs:"Add one role manually or review a CV/resume draft."},
  {label:"Executive Blueprint",key:"Blueprint",href:"#blueprint",why:"Your Blueprint defines the direction and boundaries Atlas must respect.",needs:"Confirm your vision, preferences, and constraints."},
  {label:"Opportunity",key:"Opportunity",href:"#opportunity",why:"A specific opportunity turns career context into a decision.",needs:"Record the role, company, evidence, and unknowns."},
  {label:"Atlas Assessment",key:"Reasoning",href:"#assessment",why:"Atlas compares the opportunity with confirmed evidence.",needs:"Ask Atlas to assess the evidence and explain what remains uncertain."},
  {label:"Decision",key:"Decision Finalized",href:"#assessment",why:"Your chosen action becomes a durable, explainable decision.",needs:"Select and finalize the action you own."},
  {label:"Career Ledger",key:"Decision Finalized",href:"#assessment",why:"The decision and its evidence are preserved in career history.",needs:"Atlas records this automatically with the finalized decision."},
  {label:"Feedback",key:"Feedback",href:"#feedback",why:"Private feedback helps improve your executive experience.",needs:"Record what was useful, unclear, or missing."},
] as const;

export function BetaJourneyProgress({completedSteps}:{completedSteps:ReadonlySet<string>}){
  const complete=steps.map(step=>step.label==="Workspace"||completedSteps.has(step.key));
  const currentIndex=complete.findIndex(value=>!value);
  const status=(index:number):JourneyStatus=>complete[index]?"Complete":index===currentIndex?"Current":index===currentIndex+1?"Not Started":"Locked";
  const current=currentIndex<0?undefined:steps[currentIndex];
  return <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5 sm:p-6" aria-labelledby="beta-journey-title">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Your decision journey</p><h2 id="beta-journey-title" className="mt-2 text-xl font-semibold">Your first opportunity assessment</h2></div><p className="text-sm text-slate-400">{complete.filter(Boolean).length} of {steps.length} complete</p></div>
    <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{steps.map((step,index)=>{const state=status(index);const content=<><span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold ${state==="Complete"?"border-emerald-400/30 bg-emerald-400/10 text-emerald-300":state==="Current"?"border-blue-300 bg-blue-300 text-slate-950":"border-white/10 text-slate-500"}`}>{state==="Complete"?"✓":index+1}</span><span><span className="block text-sm font-medium text-white">{step.label}</span><span className={`mt-1 block text-xs ${state==="Current"?"text-blue-300":"text-slate-500"}`}>{state}</span></span></>;return <li key={step.label}>{state==="Current"?<Link href={step.href} aria-current="step" className="flex min-h-20 items-center gap-3 rounded-xl border border-blue-400/30 bg-blue-400/[.08] p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{content}</Link>:<div className="flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-3" aria-disabled={state==="Locked"}>{content}</div>}</li>})}</ol>
    {current?<div className="mt-5 flex flex-col gap-4 rounded-xl border border-blue-400/20 bg-blue-400/[.06] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-blue-200">Next: {current.label}</p><p className="mt-1 text-sm text-slate-300">{current.why}</p><p className="mt-1 text-xs text-slate-500">Atlas needs: {current.needs}</p></div><Link href={current.href} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Continue</Link></div>:<div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4"><p className="font-semibold text-emerald-200">Journey complete</p><p className="mt-1 text-sm text-slate-400">Your first decision is preserved and your feedback has been recorded.</p></div>}
  </section>;
}
