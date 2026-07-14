import { OpportunitiesWorkspace } from "@/components/opportunities/opportunities-workspace";
import { OpportunityUniverseEmpty } from "@/components/opportunities/opportunity-universe-empty";
import { opportunities } from "@/data/opportunities";

export default function OpportunitiesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <OpportunityUniverseEmpty />;
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
