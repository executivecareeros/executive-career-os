import { StatusBadge } from "@/components/status-badge";
import type { CompanyHealth } from "@/lib/company-intelligence";
import type { StatusTone } from "@/types/design-system";

const tone: Record<CompanyHealth, StatusTone> = {
  Healthy: "success",
  Watch: "warning",
  "At Risk": "warning",
  Critical: "warning",
  Unknown: "neutral",
  "Not Connected": "neutral",
  "Not Applicable": "neutral",
};

export function CompanyStatus({ status }: { status: CompanyHealth }) {
  return <StatusBadge tone={tone[status]}>{status}</StatusBadge>;
}
