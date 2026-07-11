type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ eyebrow = "Workspace ready", title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/30 px-5 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300" aria-hidden="true">
          ✦
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
        {action && <div className="mt-7">{action}</div>}
      </div>
    </section>
  );
}
