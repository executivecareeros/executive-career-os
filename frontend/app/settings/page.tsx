import { PlanOverview } from "@/components/entitlements/plan-overview";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

export default function SettingsPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader eyebrow="Your account" title="Settings" description="Manage the preferences and access choices that shape your private career space."/><div className="mt-8 grid gap-5 md:grid-cols-2"><SectionCard><h2 className="text-lg font-semibold">Career preferences</h2><p className="mt-2 text-sm leading-6 text-slate-400">Your confirmed Blueprint remains the source for career direction, location, travel, leadership, and compensation preferences.</p></SectionCard><SectionCard><h2 className="text-lg font-semibold">Privacy and access</h2><p className="mt-2 text-sm leading-6 text-slate-400">Your career records remain private to your account. Additional sharing controls will appear only when they are available and relevant.</p></SectionCard></div></div>;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader title="Settings" description="Review product-plan demonstrations and future workspace controls."/><div className="mt-6"><PlanOverview/></div></div>;
}
