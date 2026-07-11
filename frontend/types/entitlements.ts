export type ProductPlan="free"|"atlas-pro"|"atlas-executive"; export type FeatureStatus="Available"|"Preview"|"Planned"|"Internal"; export type UsagePeriod="day"|"month"|"year"|"lifetime";
export interface UsageAllowance{limit:number;period:UsagePeriod} export interface UsageCounter{featureKey:string;used:number;periodStartedAt:string}
export type PlanCapability="core-record"|"intelligence"|"guidance"|"automation"|"support";
export interface FeatureEntitlement{featureKey:string;title:string;description:string;category:PlanCapability;minimumPlan:ProductPlan;status:FeatureStatus;usageLimit?:UsageAllowance;upgradeMessage?:string;dependencies:readonly string[]}
export interface PlanLimit{featureKey:string;allowance:UsageAllowance} export interface EntitlementContext{plan:ProductPlan;usage:readonly UsageCounter[];isDemo:true}
export type UpgradeReason="plan-required"|"usage-exhausted"|"not-yet-available"|"internal-only";
export interface FeatureAccessResult{allowed:boolean;feature:FeatureEntitlement;reason?:UpgradeReason;remaining?:number;explanation:string}
