import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

type ProductPageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function ProductPage({ title, description, emptyTitle, emptyDescription }: ProductPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader title={title} description={description} />
      <div className="py-8">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    </div>
  );
}
