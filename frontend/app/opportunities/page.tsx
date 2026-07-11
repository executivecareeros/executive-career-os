import { OpportunitiesWorkspace } from "@/components/opportunities/opportunities-workspace";
import { opportunities } from "@/data/opportunities";

export default function OpportunitiesPage() {
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
