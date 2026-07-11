export type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
};

export function EmptyState({ eyebrow = "Workspace ready", title, description, action, compact = false }: EmptyStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/30 px-5 text-center ${compact ? "min-h-52 py-8" : "min-h-72 py-12"}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300" aria-hidden="true">✦</div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      {content}
    </section>
  );
}
