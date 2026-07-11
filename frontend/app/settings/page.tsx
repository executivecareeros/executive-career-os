import { PlanOverview } from "@/components/entitlements/plan-overview";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader title="Settings" description="Review product-plan demonstrations and future workspace controls."/><div className="mt-6"><PlanOverview/></div></div>;
}
