import type { Opportunity, OpportunityFiltersState, OpportunitySort } from "@/types/opportunity";

export const defaultOpportunityFilters: OpportunityFiltersState = {
  keyword: "", status: "", industry: "", country: "", workArrangement: "",
  minimumExecutiveFitScore: 0, minimumStrategicScore: 0, priority: "",
};

export function filterOpportunities(items: Opportunity[], filters: OpportunityFiltersState) {
  const keyword = filters.keyword.trim().toLowerCase();
  return items.filter((item) => {
    const searchable = `${item.companyName} ${item.jobTitle} ${item.location} ${item.industry}`.toLowerCase();
    return (!keyword || searchable.includes(keyword)) &&
      (!filters.status || item.status === filters.status) &&
      (!filters.industry || item.industry === filters.industry) &&
      (!filters.country || item.country === filters.country) &&
      (!filters.workArrangement || item.workArrangement === filters.workArrangement) &&
      item.executiveFitScore >= filters.minimumExecutiveFitScore &&
      item.strategicOpportunityScore >= filters.minimumStrategicScore &&
      (!filters.priority || item.priority === filters.priority);
  });
}

export function sortOpportunities(items: Opportunity[], sort: OpportunitySort) {
  return [...items].sort((a, b) => {
    if (sort === "company") return a.companyName.localeCompare(b.companyName);
    if (sort === "overall") return b.overallScore - a.overallScore;
    if (sort === "executiveFit") return b.executiveFitScore - a.executiveFitScore;
    if (sort === "strategic") return b.strategicOpportunityScore - a.strategicOpportunityScore;
    if (sort === "deadline") return (a.applicationDeadline ?? "9999").localeCompare(b.applicationDeadline ?? "9999");
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

export function countActiveFilters(filters: OpportunityFiltersState) {
  return Object.entries(filters).filter(([key, value]) => key === "minimumExecutiveFitScore" || key === "minimumStrategicScore" ? Number(value) > 0 : value !== "").length;
}
