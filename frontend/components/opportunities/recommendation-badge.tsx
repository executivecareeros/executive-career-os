import { StatusBadge } from "@/components/status-badge";
import type { OpportunityRecommendation } from "@/types/opportunity";

export function RecommendationBadge({ recommendation }: { recommendation: OpportunityRecommendation }) {
  const tone = recommendation === "Strong Apply" ? "success" : recommendation === "Apply" ? "info" : recommendation === "Review Carefully" ? "warning" : "neutral";
  return <StatusBadge tone={tone}>Atlas recommends: {recommendation}</StatusBadge>;
}
