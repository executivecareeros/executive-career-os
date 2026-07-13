import { CompanyStatus } from "./company-status";
import type { CompanyHealth } from "@/lib/company-intelligence";

export function HealthCard({ label, status, detail }: { label: string; status: CompanyHealth; detail: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-200">{label}</h3>
        <CompanyStatus status={status} />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}
