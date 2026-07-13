import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SectionCard } from "@/components/section-card";

interface LiveWorkspaceEmptyStateProps {
  eyebrow?: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  actionHref?: string;
}

export function LiveWorkspaceEmptyState({
  eyebrow = "Your private Career Memory",
  title,
  description,
  emptyTitle,
  emptyDescription,
  actionLabel = "Continue your guided journey",
  actionHref = "/beta-workflow",
}: LiveWorkspaceEmptyStateProps) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <SectionCard className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Ready when you are</p>
        <h2 className="mt-3 text-xl font-semibold">{emptyTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{emptyDescription}</p>
        {actionHref && actionLabel ? <div className="mt-6"><PrimaryButton href={actionHref}>{actionLabel}</PrimaryButton></div> : null}
      </SectionCard>
    </div>
  );
}
