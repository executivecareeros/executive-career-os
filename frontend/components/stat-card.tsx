type StatCardProps = {
  label: string;
  value: string | number;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-white">{value}</p>
      {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
    </article>
  );
}
