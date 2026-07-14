import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { SectionCard } from "@/components/section-card";

export function OpportunityUniverseEmpty() {
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Executive Opportunity Universe" title="Your opportunity universe starts with one role" description="Bring every public, confidential, and relationship-led opportunity into one private view. Orendalis preserves the source; Atlas helps you decide what deserves attention." />
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <SectionCard>
        <p className="atlas-kicker">Begin with confirmed evidence</p>
        <h2 className="mt-3 text-2xl font-semibold">Add the first opportunity you want to evaluate</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Record a role from a company career page, recruiter conversation, job link, or document. Nothing is invented, and every unknown remains visible.</p>
        <div className="mt-6 flex flex-wrap gap-3"><PrimaryButton href="/beta-workflow#opportunity">Add an opportunity</PrimaryButton><SecondaryButton href="/blueprint">Review your Blueprint</SecondaryButton></div>
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
