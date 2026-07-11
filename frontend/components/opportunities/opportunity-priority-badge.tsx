import { StatusBadge } from "@/components/status-badge";
import type { OpportunityPriority } from "@/types/opportunity";

export function OpportunityPriorityBadge({ priority }: { priority: OpportunityPriority }) {
  return <StatusBadge tone={priority === "High" ? "warning" : priority === "Medium" ? "info" : "neutral"}>{priority} priority</StatusBadge>;
}
