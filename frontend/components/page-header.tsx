type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-sm text-slate-400">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-2" : ""} text-3xl font-semibold tracking-tight md:text-4xl`}>
          {title}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
