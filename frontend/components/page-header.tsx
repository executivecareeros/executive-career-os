type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="atlas-kicker">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : ""} text-3xl font-semibold tracking-[-.025em] text-white md:text-[2.5rem] md:leading-tight`}>
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-[.9375rem] leading-7 text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
