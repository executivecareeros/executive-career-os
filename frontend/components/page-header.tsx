type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-[#dfe5ee] pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="atlas-kicker">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : ""} orendalis-display text-3xl leading-tight tracking-[-.045em] text-[#0b1220] sm:text-4xl md:text-[2.85rem] md:leading-[1.08]`}>
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-[.9375rem] leading-7 text-[#5f6b7a]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
