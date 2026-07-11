import { StatusBadge } from "@/components/status-badge";
import type { OpportunityStatus } from "@/types/opportunity";

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
  const tone = status === "Qualified" || status === "Ready to Apply" || status === "Interview" ? "success" : status === "Evaluating" || status === "Applied" ? "info" : status === "Rejected" ? "warning" : "neutral";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}
