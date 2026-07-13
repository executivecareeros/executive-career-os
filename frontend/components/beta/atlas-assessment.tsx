import type { ReasoningOutput } from "@/lib/reasoning";
import { StatusBadge } from "@/components/status-badge";

function EmptyFinding({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-slate-400">{children}</p>;
}

export function AtlasAssessment({ output }: { output: ReasoningOutput }) {
  const unresolved = output.questions.length;
  const summary = output.recommendation.action === "Wait"
    ? `Pause the decision while ${unresolved} material question${unresolved === 1 ? "" : "s"} remain unresolved.`
    : `${output.recommendation.action} is Atlas’s current recommendation based on the confirmed evidence below.`;

  return (
    <section className="mt-5 space-y-5" aria-label="Atlas executive assessment">
      <header className="rounded-2xl border border-blue-400/20 bg-blue-400/[.06] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Atlas recommendation</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{output.recommendation.action}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={output.confidence === "Low" ? "warning" : "info"}>{output.confidence} confidence</StatusBadge>
            <StatusBadge tone="neutral">{output.recommendation.priority}</StatusBadge>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Confidence describes evidence completeness, not certainty. The executive makes the final decision.</p>
      </header>

      <section>
        <h3 className="text-base font-semibold text-white">Confirmed evidence used</h3>
        <div className="mt-3 space-y-2">
          {output.evidence.length ? output.evidence.map(item => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/[.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-200">{item.summary}</p>
                <StatusBadge tone={item.confirmed ? "success" : "warning"}>{item.confirmed ? "Confirmed" : "Unverified"}</StatusBadge>
              </div>
              <p className="mt-2 text-xs text-slate-500">Source: {item.domain}</p>
            </article>
          )) : <EmptyFinding>No confirmed evidence was available for this assessment.</EmptyFinding>}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">Questions Atlas recommends asking next</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Resolve the questions that could change the decision—not every detail that could be known.</p>
        {output.questions.length ? <ol className="mt-3 space-y-2">
          {output.questions.map((question, index) => <li key={question.id} className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4 text-sm leading-6 text-slate-200"><span className="font-medium text-amber-200">{index + 1}. {question.priority}</span> · {question.question}<p className="mt-1 text-xs text-slate-500">Why it matters: {question.improves}</p></li>)}
        </ol> : <div className="mt-3"><EmptyFinding>No material information question was identified by the current rules.</EmptyFinding></div>}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="text-base font-semibold text-white">Conflicts</h3>
          <div className="mt-3 space-y-2">
            {output.conflicts.length ? output.conflicts.map(conflict => <article key={conflict.id} className="rounded-xl border border-rose-300/20 bg-rose-300/[.05] p-4"><p className="font-medium text-rose-100">{conflict.title}</p><p className="mt-2 text-sm leading-6 text-slate-300">{conflict.reason}</p>{conflict.resolutionQuestion&&<p className="mt-2 text-sm text-rose-200">Resolve: {conflict.resolutionQuestion}</p>}</article>) : <EmptyFinding>Atlas found no conflict in the evidence currently available. This does not mean no conflict exists.</EmptyFinding>}
          </div>
        </section>
        <section>
          <h3 className="text-base font-semibold text-white">Trade-offs</h3>
          <div className="mt-3 space-y-2">
            {output.tradeoffs.length ? output.tradeoffs.map(tradeoff => <article key={tradeoff.id} className="rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-sm text-emerald-200">Gain: {tradeoff.gain}</p><p className="mt-2 text-sm text-amber-200">Loss: {tradeoff.loss}</p><p className="mt-2 text-xs leading-5 text-slate-500">{tradeoff.reason} · {tradeoff.confidence} confidence</p></article>) : <EmptyFinding>No evidence-supported trade-off can be calculated until more of the open questions are answered.</EmptyFinding>}
          </div>
        </section>
      </div>

      <section>
        <h3 className="text-base font-semibold text-white">Alternative paths</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {output.alternatives.map(alternative => <article key={alternative.kind} className={`rounded-xl border p-4 ${alternative.kind === output.recommendation.action ? "border-blue-400/30 bg-blue-400/[.06]" : "border-white/10 bg-white/[.03]"}`}><div className="flex items-center justify-between gap-3"><h4 className="font-medium text-white">{alternative.kind}</h4>{alternative.kind === output.recommendation.action&&<StatusBadge tone="info">Current</StatusBadge>}</div><p className="mt-3 text-sm leading-6 text-slate-300">{alternative.advantages[0]}</p><p className="mt-2 text-xs leading-5 text-slate-500">Risk: {alternative.risks[0]}</p></article>)}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">Challenge the recommendation</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Atlas should earn agreement. Test its view against the evidence below before you decide.</p>
        {output.whatWouldChange.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">{output.whatWouldChange.map(item => <li key={item}>{item}</li>)}</ul> : <div className="mt-3"><EmptyFinding>No change condition was produced by the current rules.</EmptyFinding></div>}
      </section>
    </section>
  );
}
