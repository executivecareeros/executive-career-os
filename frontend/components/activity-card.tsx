type ActivityCardProps = {
  title: string;
  description: string;
};

export function ActivityCard({ title, description }: ActivityCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
