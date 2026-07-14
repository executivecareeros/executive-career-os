import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { SectionCard } from "@/components/section-card";

export function OpportunityUniverseEmpty({ collectionAction }: { collectionAction?: (formData: FormData) => void | Promise<void> }) {
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Executive Opportunity Universe" title="Your opportunity universe starts with one role" description="This area will automatically populate as Orendalis expands the Executive Opportunity Universe. You can begin now with a public, confidential, or relationship-led opportunity." />
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <SectionCard>
        <p className="atlas-kicker">Begin with confirmed evidence</p>
        <h2 className="mt-3 text-2xl font-semibold">Add the first opportunity you want to evaluate</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Record a role from a company career page, recruiter conversation, job link, or document. Nothing is invented, and every unknown remains visible.</p>
        <div className="mt-6 flex flex-wrap gap-3"><PrimaryButton href="/beta-workflow#opportunity">Add an opportunity</PrimaryButton><SecondaryButton href="/blueprint">Review your Blueprint</SecondaryButton></div>
        {collectionAction && <form action={collectionAction} className="mt-6 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="greenhouse-board-empty">Company Greenhouse careers URL</label><input id="greenhouse-board-empty" name="board" required placeholder="Greenhouse careers URL" className="min-w-64 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-400"/><button className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5">Collect published roles</button></form>}
      </SectionCard>
      <SectionCard>
        <p className="atlas-kicker">What happens next</p>
        <ol className="mt-4 space-y-4 text-sm text-slate-300">
          <li><strong className="text-white">1. Universe</strong><span className="mt-1 block text-slate-400">The opportunity enters your attributable private universe.</span></li>
          <li><strong className="text-white">2. Qualified</strong><span className="mt-1 block text-slate-400">Your Blueprint and confirmed evidence test essential fit.</span></li>
          <li><strong className="text-white">3. Recommended</strong><span className="mt-1 block text-slate-400">Atlas explains priority, trade-offs, and unanswered questions.</span></li>
        </ol>
      </SectionCard>
    </div>
  </div>;
}
