import { calculateDepartmentHealth, rankFounderActions, suppressDuplicateAlerts, unavailableObservation } from "./engine.ts";
import { departments, metricRegistry, metricSources, sourceReferences } from "./registries.ts";
import type { CompanyDeadline, CompanyMetric, CompanyRisk, CompanySnapshot, DailyBrief, DepartmentHealth, FounderAction, MetricObservation, OperationalAlert, SupportCase, VendorHealth } from "./types.ts";

const baselineMeasuredAt = "2026-07-13T00:00:00.000Z";

const measured = (metricId: string, value: number, notes: string): MetricObservation => ({
  id: `${metricId}-baseline-95fccb4`, metricId, value, status: "Unknown", direction: "New", period: "Baseline at commit 95fccb4",
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
  "repository-commits": measured("repository-commits", 51, "Measured with git rev-list --count HEAD before this foundation commit."),
  "application-routes": measured("application-routes", 37, "Measured from frontend/app/**/page.tsx before adding /company-control."),
  "database-migrations": measured("database-migrations", 7, "Measured from tracked SQL migration files."),
  "validation-scripts": measured("validation-scripts", 2, "Measured from frontend/scripts/validate-*.mjs before this sprint."),
  "support-cases": supportMeasured,
};

export const companyMetrics: CompanyMetric[] = metricRegistry.map((definition) => ({
  definition,
  observation: observations[definition.id] ?? unavailableObservation(definition.id, Object.values(metricSources).find((source) => source.id === definition.sourceId) ?? metricSources.operations, definition.owner, definition.id === "runway" ? "Cannot Calculate — Founder Input Required. Verified cash and burn are unavailable." : "The authoritative source is unavailable or incomplete; no value is inferred."),
}));

export const supportCases: SupportCase[] = [{
  id: "2607130050001139", provider: "Microsoft", subject: "Exchange Online DKIM provisioning failure – Microsoft-generated DKIM selector targets return NXDOMAIN",
  openedAt: "2026-07-13T12:19:41", status: "Open", owner: "Founder / Infrastructure", nextAction: "Await assignment and technical response from Microsoft Support.",
  lastUpdatedAt: "2026-07-13T12:19:41", blocker: "Microsoft-managed DKIM selector targets remain unpublished according to the submitted evidence.",
  escalationState: "Submitted; support representative assignment pending", sourceReference: sourceReferences.supportCase,
}];

export const companyRisks: CompanyRisk[] = [
  { id: "R-001", title: "Product value is not sufficiently validated with executives", category: "Business", likelihood: "Medium", impact: "High", mitigation: "Founder-led research, private beta evidence, and explicit success criteria.", owner: "Founder", status: "Open", sourceReference: sourceReferences.risks },
  { id: "R-004", title: "Administrative access concentration", category: "Security", likelihood: "Medium", impact: "Critical", mitigation: "MFA, passkeys, recovery controls, backup authority, and access reviews.", owner: "Founder / Security", status: "Mitigating", sourceReference: sourceReferences.risks },
  { id: "R-006", title: "Unknown recurring costs and runway visibility", category: "Financial", likelihood: "Medium", impact: "High", mitigation: "Complete the investment ledger, subscription register, and cash forecast.", owner: "Founder / Finance", status: "Mitigating", sourceReference: sourceReferences.risks },
  { id: "R-010", title: "Microsoft DKIM synchronization delays email migration", category: "Operational", likelihood: "Medium", impact: "Medium", mitigation: "Maintain the change freeze and manage the open Microsoft support escalation.", owner: "Founder / Operations", status: "Monitoring", sourceReference: sourceReferences.risks },
];

export const founderActions: FounderAction[] = [
  { id: "action-microsoft-support", title: "Monitor Microsoft DKIM support case", department: "Infrastructure", urgency: "Today", importance: "High", dueDate: "2026-07-14T09:00:00+03:00", reason: "DKIM completion is a private-beta email readiness dependency.", evidence: ["Case 2607130050001139 is open.", "Microsoft reported that a representative is being assigned."], blocker: "Awaiting Microsoft-side investigation.", recommendedNextStep: "Review the first Microsoft response independently in the Admin Center and update the case log with safe metadata.", owner: "Founder / Infrastructure", sourceLink: sourceReferences.supportCase, status: "Awaiting Response", approvalRequired: false },
  { id: "action-finance-input", title: "Complete verified subscription and cash inputs", department: "Finance", urgency: "This Week", importance: "High", reason: "Monthly cost, annual commitments, burn, and runway cannot be calculated from the current records.", evidence: ["Project Cost Dashboard marks monetary totals as Founder to complete.", "Software subscription amounts remain unverified."], blocker: "Verified invoices, billing cycles, cash, and burn are not recorded.", recommendedNextStep: "Enter invoice-backed amounts by currency without converting or combining currencies.", owner: "Founder / Finance", sourceLink: sourceReferences.finance, status: "Blocked", approvalRequired: true },
  { id: "action-beta-gates", title: "Review isolated staging plan and provider costs", department: "Executive Office", urgency: "This Week", importance: "Critical", reason: "Founder Acceptance passed, but external staging projects cannot be created until plan, cost, region, ownership, hostname, and rollback are approved.", evidence: ["Staging architecture and release checklist are prepared.", "No Vercel or Supabase staging project exists."], blocker: "Founder approval and live provider checkout confirmation are required.", recommendedNextStep: "Review docs/STAGING_DEPLOYMENT_AUDIT.md and approve or defer each provider commitment without creating resources prematurely.", owner: "Founder", sourceLink: "docs/STAGING_DEPLOYMENT_AUDIT.md", status: "Open", approvalRequired: true },
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
  { id: "exchange", provider: "Microsoft 365 / Exchange Online", status: "Watch", lastVerified: "2026-07-13T12:19:41", sourceReference: sourceReferences.supportCase, owner: "Founder / Infrastructure", recoveryReadiness: "Unknown", openIssue: "DKIM signing is blocked by the open support issue; mailbox service was recorded as operational.", nextAction: "Await Microsoft support response." },
  { id: "github", provider: "GitHub", status: "Unknown", sourceReference: "company/assets/DIGITAL_ACCOUNTS.md", owner: "Founder / Engineering", recoveryReadiness: "Unknown", nextAction: "Connect no telemetry until separately approved." },
  { id: "vercel", provider: "Vercel", status: "Not Connected", sourceReference: sourceReferences.subscriptions, owner: "Founder / Infrastructure", recoveryReadiness: "Unknown", nextAction: "Production status requires provider verification." },
  { id: "supabase", provider: "Supabase", status: "Not Connected", sourceReference: "docs/SUPABASE_RUNTIME_VERIFICATION.md", owner: "Founder / Engineering", recoveryReadiness: "Unknown", nextAction: "Production status requires provider verification." },
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
      { id: "glance", title: "Company at a Glance", summary: "The control center has partial repository and operational-document coverage. Live customer, financial, deployment, and provider telemetry is not connected.", status: "Unknown", evidence: [{ id: "glance-evidence", statement: "Most provider sources are marked Not Connected.", sourceReference: "docs/COMPANY_DATA_SOURCES.md", confidence: "Very High" }] },
      { id: "attention", title: "What Needs Attention", summary: "Private-beta evidence gaps, Microsoft DKIM publication, and incomplete financial inputs require founder attention.", status: "At Risk", evidence: [{ id: "attention-evidence", statement: "The readiness checklist, Microsoft case log, and cost dashboard contain open items.", sourceReference: sourceReferences.readiness, confidence: "Very High" }] },
      { id: "support", title: "Microsoft Support", summary: "Case 2607130050001139 is open. The documented next step is to await assignment and a technical response.", status: "Watch", evidence: [{ id: "support-evidence", statement: "The support case was accepted by Microsoft.", sourceReference: sourceReferences.supportCase, confidence: "Very High" }] },
      { id: "financial", title: "Financial Snapshot", summary: "Verified monthly spending, annual commitments, cash, burn, revenue, and runway are unavailable.", status: "Unknown", evidence: [{ id: "finance-evidence", statement: "Founder input is required for monetary totals.", sourceReference: sourceReferences.finance, confidence: "Very High" }] },
    ],
    recommendations: top.map((action) => ({ action, expectedOutcome: action.recommendedNextStep, downsideOfDelay: action.id === "action-beta-gates" ? "Private-beta exposure could proceed without verified controls." : action.id === "action-microsoft-support" ? "Email authentication readiness remains incomplete." : "Financial decisions remain unsupported by verified totals." })),
    unknowns: ["Live user and activation metrics", "Production deployment health", "Verified cash, burn, revenue, and runway", "Current customer and beta signals", "Provider-level security telemetry"],
  };
}

export function createCompanySnapshot(now = new Date()): CompanySnapshot {
  const departmentHealth = buildDepartmentHealth();
  return {
    generatedAt: now.toISOString(), environment: process.env.NODE_ENV === "production" ? "Production build" : "Local development", betaStage: "Private beta preparation",
    health: { generatedAt: now.toISOString(), overallHealth: "Unknown", departments: departmentHealth, metrics: companyMetrics },
    beta: {
      stagingReadiness: "Watch", productionReadiness: "Critical", supportCases: 1, betaHealth: "At Risk", dataState: "Unavailable",
      summary: "Founder Acceptance passed and the isolated staging plan is documented. Provider projects, live costs, callbacks, secrets, restore rehearsal, security-header verification, and external email acceptance remain incomplete. No staging or participant activity source is connected.",
      sourceReference: "docs/STAGING_RELEASE_CHECKLIST.md",
      workflowGates: { "Invitation enforcement":"Complete", "Durable import":"Complete", "Durable Blueprint":"Complete", "Durable opportunity":"Complete", "Atlas persistence":"Complete", "Atomic finalization":"Complete", "Ledger append":"Complete", "Feedback persistence":"Complete", "Lifecycle requests":"In Progress", "Staging readiness":"In Progress", "CI status":"Complete", "Founder acceptance":"Complete" },
    },
    actions: rankFounderActions(founderActions, now), alerts: operationalAlerts, deadlines, risks: companyRisks, vendors: vendorHealth, supportCases, brief: buildDailyBrief(now, founderActions),
  };
}
