type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-[#e3e5e6] pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="atlas-kicker">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : ""} orendalis-display text-3xl font-normal leading-tight tracking-[-.035em] text-[#17191c] sm:text-4xl md:text-[2.85rem] md:leading-[1.08]`}>
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-[.9375rem] leading-7 text-[#6f757b]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
