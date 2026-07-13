import Link from "next/link";
import type { DepartmentHealth } from "@/lib/company-intelligence";
import { CompanyStatus } from "./company-status";

export function DepartmentCard({ department }: { department: DepartmentHealth }) {
  const id = `department-${department.department.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <article id={id} className="scroll-mt-24 rounded-2xl border border-white/10 bg-slate-950/35 p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-semibold text-white">{department.department}</h3><p className="mt-1 text-xs text-slate-500">{department.accountableOwner}</p></div>
        <CompanyStatus status={department.health} />
      </div>
      <p className="mt-4 min-h-10 text-sm leading-5 text-slate-400">{department.latestMeaningfulChange}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-white/5 py-3 text-center">
        <div><dt className="text-[10px] uppercase tracking-wider text-slate-600">Actions</dt><dd className="mt-1 text-sm font-semibold text-white">{department.openActions}</dd></div>
        <div><dt className="text-[10px] uppercase tracking-wider text-slate-600">Risks</dt><dd className="mt-1 text-sm font-semibold text-white">{department.currentRisks}</dd></div>
        <div><dt className="text-[10px] uppercase tracking-wider text-slate-600">Overdue</dt><dd className="mt-1 text-sm font-semibold text-white">{department.overdueItems}</dd></div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">{department.connectionState} · {department.freshness.state}</span>
        <Link href={department.href} className="font-medium text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Details</Link>
      </div>
    </article>
  );
}
