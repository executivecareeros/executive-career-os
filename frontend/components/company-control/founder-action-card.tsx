import Link from "next/link";
import type { FounderAction } from "@/lib/company-intelligence";

export function FounderActionCard({ action, rank }: { action: FounderAction; rank: number }) {
  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/35 p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-sm font-semibold text-blue-300" aria-label={`Priority ${rank}`}>{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{action.department}</span><span aria-hidden="true">·</span><span>{action.urgency}</span><span aria-hidden="true">·</span><span>{action.status}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">{action.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{action.reason}</p>
          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <div><dt className="text-slate-600">Next step</dt><dd className="mt-1 leading-5 text-slate-300">{action.recommendedNextStep}</dd></div>
            <div><dt className="text-slate-600">Blocker</dt><dd className="mt-1 leading-5 text-slate-300">{action.blocker ?? "No recorded blocker"}</dd></div>
            <div><dt className="text-slate-600">Owner</dt><dd className="mt-1 text-slate-300">{action.owner}</dd></div>
            <div><dt className="text-slate-600">Founder approval</dt><dd className="mt-1 text-slate-300">{action.approvalRequired ? "Required" : "Not required for the next read-only step"}</dd></div>
          </dl>
          <Link href="/company-control#sources" className="mt-4 inline-flex max-w-full break-all text-xs font-medium text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Source: {action.sourceLink}</Link>
        </div>
      </div>
    </article>
  );
}
