import { SectionCard } from "@/components/section-card";

export function OpportunityDetailSection({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <SectionCard className={className}><h2 className="text-lg font-semibold text-white">{title}</h2><div className="mt-4 text-sm leading-6 text-slate-400">{children}</div></SectionCard>;
}
