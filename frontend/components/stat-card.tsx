type StatCardProps = {
  label: string;
  value: string | number;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/45 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition duration-200 hover:border-white/15 hover:bg-slate-900/65">
      <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
      {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
    </article>
  );
}
