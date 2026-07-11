import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import { PrimaryButton } from "./primary-button";

type ProductPageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  actionHref?: string;
};

export function ProductPage({ title, description, emptyTitle, emptyDescription, actionLabel, actionHref }: ProductPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader title={title} description={description} />
      <div className="py-8">
        <EmptyState title={emptyTitle} description={emptyDescription} action={<PrimaryButton href={actionHref}>{actionLabel}</PrimaryButton>} />
      </div>
    </div>
  );
}
