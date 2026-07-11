import { StatusBadge } from "@/components/status-badge";
import type { CompanyPriority, CompanyRecommendation, MonitoringStatus, RelationshipStatus } from "@/types/company";
export const CompanyPriorityBadge=({value}:{value:CompanyPriority})=><StatusBadge tone={value==="Critical"||value==="High"?"warning":value==="Medium"?"info":"neutral"}>{value} priority</StatusBadge>;
export const CompanyMonitoringBadge=({value}:{value:MonitoringStatus})=><StatusBadge tone={value==="High Priority"?"warning":value==="Weekly"?"info":"neutral"}>{value}</StatusBadge>;
export const CompanyRelationshipBadge=({value}:{value:RelationshipStatus})=><StatusBadge tone={value==="Target"||value==="Engaged"||value==="Interviewing"?"success":value==="Watching"||value==="Contacted"?"info":"neutral"}>{value}</StatusBadge>;
export const CompanyAssessmentBadge=({value}:{value:CompanyRecommendation})=><StatusBadge tone={value==="Priority Target"?"success":value==="Strong Target"?"info":value==="Monitor"?"warning":"neutral"}>Company Assessment: {value}</StatusBadge>;
