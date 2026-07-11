import { EmptyState } from "./empty-state";
import { SectionCard } from "./section-card";

type DashboardSectionProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  action?: React.ReactNode;
  className?: string;
};

export function DashboardSection({ title, description, emptyTitle, emptyDescription, action, className = "" }: DashboardSectionProps) {
  return (
    <SectionCard className={className}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="mt-6">
        <EmptyState compact title={emptyTitle} description={emptyDescription} action={action} />
      </div>
    </SectionCard>
  );
}
