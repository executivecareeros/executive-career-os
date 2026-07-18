import { calculateDepartmentHealth, rankFounderActions, suppressDuplicateAlerts, unavailableObservation } from "./engine.ts";
import { departments, metricRegistry, metricSources, sourceReferences } from "./registries.ts";
import type { CompanyDeadline, CompanyMetric, CompanyRisk, CompanySnapshot, DailyBrief, DepartmentHealth, FounderAction, MetricObservation, OperationalAlert, SupportCase, VendorHealth } from "./types.ts";

const baselineMeasuredAt = "2026-07-14T00:00:00.000Z";

const measured = (metricId: string, value: number, notes: string): MetricObservation => ({
  id: `${metricId}-baseline-f225442`, metricId, value, status: "Healthy", direction: "New", period: "Measured baseline at commit f225442",
  measuredAt: baselineMeasuredAt, source: metricSources.repository, sourceReference: sourceReferences.repository,
  freshness: { state: "Current", measuredAt: baselineMeasuredAt, expectedFrequency: "Manual", maximumAgeInHours: 168 },
  confidence: "Very High", valueKind: "Measured", owner: "Founder / Engineering", notes, demoStatus: "Factual",
});

const supportMeasured: MetricObservation = {
  id: "support-cases-case-log", metricId: "support-cases", value: 1, status: "Watch", direction: "New", period: "Current documented cases",
  measuredAt: "2026-07-13T12:19:41.000Z", source: metricSources.microsoftSupport, sourceReference: sourceReferences.supportCase,
  freshness: { state: "Current", measuredAt: "2026-07-13T12:19:41.000Z", expectedFrequency: "Manual", maximumAgeInHours: 48 },
  confidence: "Very High", valueKind: "Measured", owner: "Founder / Operations", notes: "One open Microsoft DKIM support case is documented. This is not a customer-support count.", demoStatus: "Factual",
};

const observations: Record<string, MetricObservation> = {
  "repository-commits": measured("repository-commits", 100, "Measured with git rev-list --count HEAD at commit f225442."),
  "application-routes": measured("application-routes", 43, "Measured from frontend/app/**/page.tsx at commit f225442."),
  "database-migrations": measured("database-migrations", 12, "Measured from committed supabase/migrations SQL files at commit f225442."),
  "validation-scripts": measured("validation-scripts", 16, "Measured from frontend validation and test scripts at commit f225442."),
  "support-cases": supportMeasured,
};

export const companyMetrics: CompanyMetric[] = metricRegistry.map((definition) => ({
  definition,
  observation: observations[definition.id] ?? unavailableObservation(definition.id, Object.values(metricSources).find((source) => source.id === definition.sourceId) ?? metricSources.operations, definition.owner, definition.id === "runway" ? "Cannot Calculate — Founder Input Required. Verified cash and burn are unavailable." : "The authoritative source is unavailable or incomplete; no value is inferred."),
}));

export const supportCases: SupportCase[] = [{
  id: "2607130050001139", provider: "Microsoft", subject: "Exchange Online DKIM provisioning failure – Microsoft-generated DKIM selector targets return NXDOMAIN",
  openedAt: "2026-07-13T12:19:41", status: "Open", owner: "Founder / Infrastructure", nextAction: "Ask Microsoft to complete selector publication, then verify a DKIM-signed outbound message before closure.",
  lastUpdatedAt: "2026-07-18T18:23:00+03:00", blocker: "Both Microsoft-managed DKIM selector destinations still return NXDOMAIN despite correct customer-side CNAME records.",
  escalationState: "Microsoft remediation received; public verification still failing", sourceReference: sourceReferences.supportCase,
}];

export const companyRisks: CompanyRisk[] = [
  { id: "R-001", title: "Product value is not sufficiently validated with executives", category: "Business", likelihood: "Medium", impact: "High", mitigation: "Founder-led research, private beta evidence, and explicit success criteria.", owner: "Founder", status: "Open", sourceReference: sourceReferences.risks },
  { id: "R-004", title: "Administrative access concentration", category: "Security", likelihood: "Medium", impact: "Critical", mitigation: "MFA, passkeys, recovery controls, backup authority, and access reviews.", owner: "Founder / Security", status: "Mitigating", sourceReference: sourceReferences.risks },
  { id: "R-006", title: "Unknown recurring costs and runway visibility", category: "Financial", likelihood: "Medium", impact: "High", mitigation: "Complete the investment ledger, subscription register, and cash forecast.", owner: "Founder / Finance", status: "Mitigating", sourceReference: sourceReferences.risks },
  { id: "R-010", title: "Microsoft DKIM synchronization delays email migration", category: "Operational", likelihood: "Medium", impact: "Medium", mitigation: "Maintain the change freeze and manage the open Microsoft support escalation.", owner: "Founder / Operations", status: "Monitoring", sourceReference: sourceReferences.risks },
];

export const founderActions: FounderAction[] = [
  { id: "action-microsoft-support", title: "Complete Microsoft DKIM publication", department: "Infrastructure", urgency: "Today", importance: "High", dueDate: "2026-07-20T09:00:00+03:00", reason: "DKIM completion is a private-beta email readiness dependency.", evidence: ["Case 2607130050001139 is open.", "Both Microsoft-managed selector destinations returned NXDOMAIN on 18 July 2026."], blocker: "Microsoft-managed selector publication remains unavailable.", recommendedNextStep: "Ask Microsoft to complete selector publication, then verify a DKIM-signed outbound message before closing the issue.", owner: "Founder / Infrastructure", sourceLink: sourceReferences.supportCase, status: "Awaiting Response", approvalRequired: false },
  { id: "action-finance-input", title: "Complete verified subscription and cash inputs", department: "Finance", urgency: "This Week", importance: "High", reason: "Monthly cost, annual commitments, burn, and runway cannot be calculated from the current records.", evidence: ["Project Cost Dashboard marks monetary totals as Founder to complete.", "Software subscription amounts remain unverified."], blocker: "Verified invoices, billing cycles, cash, and burn are not recorded.", recommendedNextStep: "Enter invoice-backed amounts by currency without converting or combining currencies.", owner: "Founder / Finance", sourceLink: sourceReferences.finance, status: "Blocked", approvalRequired: true },
  { id: "action-beta-gates", title: "Close design-partner activation gates", department: "Executive Office", urgency: "This Week", importance: "Critical", reason: "Staging and founder acceptance passed, but design-partner activation still requires reliable email delivery, recovery evidence, monitoring, and legal/privacy approval.", evidence: ["Founder acceptance passed in staging.", "The operational register preserves the remaining activation blockers."], blocker: "Unassisted email delivery, restore rehearsal, monitoring, provider recovery evidence, and legal/privacy gates remain open.", recommendedNextStep: "Close each Definition of Ready gate with factual evidence before creating the first design-partner invitation.", owner: "Founder", sourceLink: "company/releases/release-0.9/DEFINITION_OF_READY.md", status: "Blocked", approvalRequired: true },
];

export const operationalAlerts: OperationalAlert[] = suppressDuplicateAlerts([
  { id: "alert-dkim", title: "DKIM backend publication remains blocked", department: "Infrastructure", severity: "High", evidence: ["Microsoft support case 2607130050001139 is open."], sourceReference: sourceReferences.supportCase, status: "Open", correlationId: "microsoft-dkim-2607130050001139" },
  { id: "alert-finance", title: "Runway cannot be calculated", department: "Finance", severity: "Warning", evidence: ["Verified cash and burn are unavailable."], sourceReference: sourceReferences.finance, status: "Open", correlationId: "finance-runway-input-missing" },
]);

export const deadlines: CompanyDeadline[] = [
  { id: "deadline-dkim-review", title: "Review Microsoft DKIM support status", department: "Infrastructure", dueAt: "2026-07-14T09:00:00+03:00", type: "Support", status: "Upcoming", sourceReference: sourceReferences.risks },
];

export const vendorHealth: VendorHealth[] = [
  { id: "domain", provider: "orendalis.com / Porkbun", status: "Watch", lastVerified: "2026-07-12", sourceReference: sourceReferences.domain, owner: "Founder / Infrastructure", recoveryReadiness: "Unknown", openIssue: "DNSSEC, transfer lock, and renewal controls require factual verification in the asset register.", nextAction: "Verify registrar controls without changing DNS." },
  { id: "exchange", provider: "Microsoft 365 / Exchange Online", status: "Watch", lastVerified: "2026-07-18T18:23:00+03:00", sourceReference: sourceReferences.supportCase, owner: "Founder / Infrastructure", recoveryReadiness: "Unknown", openIssue: "Mailbox service is operational, but Microsoft-managed DKIM selector destinations still return NXDOMAIN.", nextAction: "Ask Microsoft to complete selector publication and verify a signed outbound message." },
  { id: "github", provider: "GitHub", status: "Unknown", sourceReference: "company/assets/DIGITAL_ACCOUNTS.md", owner: "Founder / Engineering", recoveryReadiness: "Unknown", nextAction: "Connect no telemetry until separately approved." },
  { id: "vercel", provider: "Vercel", status: "Healthy", lastVerified: "2026-07-14", sourceReference: "company/operations/access-and-environments/ENVIRONMENT_REGISTER.md", owner: "Founder / Infrastructure", recoveryReadiness: "Unknown", nextAction: "Rehearse rollback and verify account recovery before partner activation." },
  { id: "supabase", provider: "Supabase", status: "Watch", lastVerified: "2026-07-14", sourceReference: "company/operations/access-and-environments/ENVIRONMENT_REGISTER.md", owner: "Founder / Engineering", recoveryReadiness: "Unknown", openIssue: "Restore rehearsal and migration-history baseline remain open.", nextAction: "Complete the approved recovery rehearsal before partner activation." },
];

const departmentOwner: Record<(typeof departments)[number], string> = Object.fromEntries(departments.map((department) => [department, department === "Engineering" ? "Founder / Engineering" : department === "Infrastructure" ? "Founder / Infrastructure" : department === "Finance" ? "Founder / Finance" : "Founder"])) as Record<(typeof departments)[number], string>;

export function buildDepartmentHealth(): DepartmentHealth[] {
  return departments.map((department) => {
    const metrics = companyMetrics.filter((metric) => metric.definition.department === department);
    const connected = metrics.some((metric) => metric.observation.source.connectionState !== "Not Connected");
    const risks = companyRisks.filter((risk) => risk.owner.includes(department) || (department === "Executive Office" && risk.owner === "Founder"));
    const actions = founderActions.filter((action) => action.department === department && action.status !== "Completed");
    return {
      department, health: calculateDepartmentHealth(metrics, connected ? "Partially Connected" : "Not Connected"), accountableOwner: departmentOwner[department],
      mostImportantMetric: metrics[0], openActions: actions.length, currentRisks: risks.length, overdueItems: 0,
      latestMeaningfulChange: department === "Infrastructure" ? "Microsoft support case opened for DKIM publication." : connected ? "Repository or operational snapshot available." : "No operational data yet.",
      freshness: connected ? { state: "Current", measuredAt: baselineMeasuredAt, expectedFrequency: "Manual", maximumAgeInHours: 168 } : { state: "Not Connected", expectedFrequency: "Unknown" },
      connectionState: connected ? "Partially Connected" : "Not Connected", href: `/company-control#department-${department.toLowerCase().replaceAll(" ", "-").replaceAll("and", "and")}`,
    };
  });
}

function buildDailyBrief(now: Date, actions: FounderAction[]): DailyBrief {
  const top = rankFounderActions(actions, now).slice(0, 3);
  return {
    id: `brief-${now.toISOString().slice(0, 10)}`, title: "Good Morning, Cüneyt", generatedAt: now.toISOString(), status: "Demonstration Briefing",
    sections: [
      { id: "glance", title: "Company at a Glance", summary: "Staging is active and founder acceptance passed. Provider telemetry remains manual, and no design partner has been invited.", status: "Watch", evidence: [{ id: "glance-evidence", statement: "The environment register records active isolated staging and explicit remaining gates.", sourceReference: "company/operations/access-and-environments/ENVIRONMENT_REGISTER.md", confidence: "Very High" }] },
      { id: "attention", title: "What Needs Attention", summary: "Private-beta evidence gaps, Microsoft DKIM publication, and incomplete financial inputs require founder attention.", status: "At Risk", evidence: [{ id: "attention-evidence", statement: "The readiness checklist, Microsoft case log, and cost dashboard contain open items.", sourceReference: sourceReferences.readiness, confidence: "Very High" }] },
      { id: "support", title: "Microsoft Support", summary: "Case 2607130050001139 remains open. Microsoft supplied a remediation step, but both managed selector destinations still returned NXDOMAIN on 18 July 2026.", status: "Watch", evidence: [{ id: "support-evidence", statement: "Customer-side selector CNAME records resolve, while both Microsoft-managed destinations remain unavailable in public DNS.", sourceReference: sourceReferences.supportCase, confidence: "Very High" }] },
      { id: "financial", title: "Financial Snapshot", summary: "Verified monthly spending, annual commitments, cash, burn, revenue, and runway are unavailable.", status: "Unknown", evidence: [{ id: "finance-evidence", statement: "Founder input is required for monetary totals.", sourceReference: sourceReferences.finance, confidence: "Very High" }] },
    ],
    recommendations: top.map((action) => ({ action, expectedOutcome: action.recommendedNextStep, downsideOfDelay: action.id === "action-beta-gates" ? "Private-beta exposure could proceed without verified controls." : action.id === "action-microsoft-support" ? "Email authentication readiness remains incomplete." : "Financial decisions remain unsupported by verified totals." })),
    unknowns: ["Live user and activation metrics", "Production deployment health", "Verified cash, burn, revenue, and runway", "Current customer and beta signals", "Provider-level security telemetry"],
  };
}

export function createCompanySnapshot(now = new Date()): CompanySnapshot {
  const departmentHealth = buildDepartmentHealth();
  return {
    generatedAt: now.toISOString(), environment: process.env.NODE_ENV === "production" ? "Staging deployment" : "Local development", betaStage: "Design Partner readiness",
    health: { generatedAt: now.toISOString(), overallHealth: "Unknown", departments: departmentHealth, metrics: companyMetrics },
    beta: {
      stagingReadiness: "Healthy", productionReadiness: "Critical", supportCases: 1, betaHealth: "Watch", dataState: "Unavailable",
      summary: "Operational reporting is reconciled and founder acceptance passed in isolated staging. Design-partner activation remains blocked by unassisted email delivery, recovery rehearsal, monitoring, provider recovery evidence, and legal/privacy approval.",
      sourceReference: "company/releases/release-0.9/OPERATIONAL_READINESS_REPORT.md",
      workflowGates: { "Invitation enforcement":"Complete", "Durable import":"Complete", "Durable Blueprint":"Complete", "Durable opportunity":"Complete", "Atlas persistence":"Complete", "Atomic finalization":"Complete", "Ledger append":"Complete", "Feedback persistence":"Complete", "Lifecycle requests":"Complete", "Staging readiness":"Complete", "CI status":"Complete", "Founder acceptance":"Complete" },
    },
    actions: rankFounderActions(founderActions, now), alerts: operationalAlerts, deadlines, risks: companyRisks, vendors: vendorHealth, supportCases, brief: buildDailyBrief(now, founderActions),
  };
}
