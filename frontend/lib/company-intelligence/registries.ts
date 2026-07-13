import type { CompanyDataSource, CompanyDepartment, CompanyPermission, MetricDefinition, MetricSource } from "./types.ts";

export const sourceReferences = {
  repository: "repository://95fccb44b472ab7e8019efb3ec1bad062cc0b94f",
  supportCase: "company/operations/email/MICROSOFT_SUPPORT_CASE_LOG.md",
  risks: "company/operations/RISK_REGISTER.md",
  readiness: "company/operations/VERSION_READINESS_CHECKLIST.md",
  finance: "company/founder-investment/PROJECT_COST_DASHBOARD.md",
  subscriptions: "company/assets/SOFTWARE_SUBSCRIPTIONS.md",
  domain: "company/assets/DOMAIN_REGISTER.md",
} as const;

export const metricSources: Record<string, MetricSource> = {
  repository: { id: "source-repository", name: "Local Git repository snapshot", type: "Repository", reference: sourceReferences.repository, connectionState: "Connected" },
  operations: { id: "source-operations", name: "Company operational records", type: "Operational Document", reference: "company/operations/", connectionState: "Partially Connected" },
  finance: { id: "source-finance", name: "Founder Investment Ledger", type: "Operational Document", reference: sourceReferences.finance, connectionState: "Partially Connected" },
  microsoftSupport: { id: "source-microsoft-support", name: "Microsoft support case log", type: "Operational Document", reference: sourceReferences.supportCase, connectionState: "Partially Connected" },
  productAnalytics: { id: "source-product-analytics", name: "Product analytics", type: "Provider", reference: "future://analytics", connectionState: "Not Connected" },
  billing: { id: "source-billing", name: "Billing provider", type: "Provider", reference: "future://billing", connectionState: "Not Connected" },
};

const unknownFreshness = { state: "Unknown" as const, expectedFrequency: "Unknown" as const };
const notConnectedFreshness = { state: "Not Connected" as const, expectedFrequency: "Unknown" as const };

export const companyDataSources: CompanyDataSource[] = [
  { id: "internal-repositories", name: "Internal repositories", provider: "Orendalis", connectionState: "Partially Connected", authorizationState: "Not Required", lastSynchronization: "2026-07-13T00:00:00.000Z", freshness: { state: "Current", measuredAt: "2026-07-13T00:00:00.000Z", expectedFrequency: "Manual", maximumAgeInHours: 168 }, scopes: ["Aggregate repository metadata"], owner: "Founder / Engineering", health: "Watch", recordsImported: 8, sourceReference: sourceReferences.repository },
  { id: "supabase", name: "Production data", provider: "Supabase", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Engineering", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: "docs/SUPABASE_PERSISTENCE.md" },
  { id: "github", name: "Repository telemetry", provider: "GitHub", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Engineering", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: "company/assets/DIGITAL_ACCOUNTS.md" },
  { id: "vercel", name: "Deployment telemetry", provider: "Vercel", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Infrastructure", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: sourceReferences.subscriptions },
  { id: "microsoft-support", name: "Microsoft support", provider: "Microsoft 365", connectionState: "Partially Connected", authorizationState: "Not Required", lastSynchronization: "2026-07-13T12:19:41.000Z", freshness: { state: "Current", measuredAt: "2026-07-13T12:19:41.000Z", expectedFrequency: "Manual", maximumAgeInHours: 48 }, scopes: ["Case metadata only"], owner: "Founder / Operations", health: "Watch", recordsImported: 1, nextScheduledUpdate: "On provider response", sourceReference: sourceReferences.supportCase },
  { id: "microsoft-365", name: "Mailbox and tenant telemetry", provider: "Microsoft 365", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Infrastructure", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: "company/operations/email/EMAIL_MONITORING_ARCHITECTURE.md" },
  { id: "porkbun", name: "Domain and DNS telemetry", provider: "Porkbun", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Infrastructure", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: sourceReferences.domain },
  { id: "product-analytics", name: "Product analytics", provider: "Unselected", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Product", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: "future://analytics" },
  { id: "billing", name: "Revenue and billing", provider: "Unselected", connectionState: "Not Connected", authorizationState: "Approval Required", freshness: notConnectedFreshness, scopes: [], owner: "Founder / Finance", health: "Not Connected", nextScheduledUpdate: "Not scheduled", sourceReference: "future://billing" },
  { id: "manual-company-records", name: "Company operational documents", provider: "Git repository", connectionState: "Partially Connected", authorizationState: "Not Required", freshness: unknownFreshness, scopes: ["Non-secret operational records"], owner: "Founder / Operations", health: "Watch", sourceReference: "company/" },
];

type MetricSeed = Omit<MetricDefinition, "calculation" | "frequency" | "owner" | "dataClassification" | "displayRules"> & Partial<Pick<MetricDefinition, "calculation" | "frequency" | "owner" | "dataClassification" | "displayRules">>;
const define = (seed: MetricSeed): MetricDefinition => ({ calculation: "Direct count from the named authoritative source; unavailable when the source is not connected.", frequency: "Daily", owner: "Founder", dataClassification: "Internal", displayRules: "Never display missing data as zero. Show source, freshness, confidence, and value kind.", ...seed });

export const metricRegistry: MetricDefinition[] = [
  define({ id: "registered-accounts", canonicalKey: "users.registered.total", name: "Registered accounts", department: "Product", description: "Distinct registered workspace accounts.", unit: "Count", sourceId: "source-product-analytics" }),
  define({ id: "activated-users", canonicalKey: "users.activated.total", name: "Activated users", department: "Product", description: "Accounts meeting the approved activation definition.", unit: "Count", sourceId: "source-product-analytics" }),
  define({ id: "weekly-active-users", canonicalKey: "users.active.weekly", name: "Weekly active users", department: "Customer Success", description: "Distinct users completing an approved meaningful action in seven days.", unit: "Count", sourceId: "source-product-analytics" }),
  define({ id: "activation-rate", canonicalKey: "users.activation.rate", name: "Activation rate", department: "Product", description: "Activated accounts divided by eligible registered accounts.", unit: "Percent", sourceId: "source-product-analytics", calculation: "Activated eligible accounts / eligible registered accounts × 100.", numerator: "Activated eligible accounts", denominator: "Eligible registered accounts" }),
  define({ id: "beta-participants", canonicalKey: "beta.participants.total", name: "Beta participants", department: "Customer Success", description: "Accepted and active private-beta participants.", unit: "Count", sourceId: "source-product-analytics" }),
  define({ id: "support-cases", canonicalKey: "support.cases.open", name: "Open support cases", department: "Customer Support", description: "Open provider or customer support cases recorded in approved case sources.", unit: "Count", sourceId: "source-microsoft-support", frequency: "Manual" }),
  define({ id: "repository-commits", canonicalKey: "engineering.repository.commits", name: "Repository commits", department: "Engineering", description: "Commits reachable from the measured baseline revision.", unit: "Count", sourceId: "source-repository", frequency: "Manual" }),
  define({ id: "application-routes", canonicalKey: "engineering.routes.pages", name: "Page routes", department: "Engineering", description: "Next.js page route files in the application.", unit: "Count", sourceId: "source-repository", frequency: "Manual" }),
  define({ id: "database-migrations", canonicalKey: "engineering.database.migrations", name: "Database migrations", department: "Engineering", description: "Tracked Supabase migration files.", unit: "Count", sourceId: "source-repository", frequency: "Manual" }),
  define({ id: "validation-scripts", canonicalKey: "engineering.validation.scripts", name: "Validation scripts", department: "Engineering", description: "Repository validation scripts matching the approved naming convention.", unit: "Count", sourceId: "source-repository", frequency: "Manual" }),
  define({ id: "monthly-spending", canonicalKey: "finance.spending.monthly", name: "Monthly spending", department: "Finance", description: "Verified monthly company expenditure by explicit currency.", unit: "Currency", sourceId: "source-finance", frequency: "Monthly", dataClassification: "Confidential" }),
  define({ id: "annual-commitments", canonicalKey: "finance.commitments.annual", name: "Recurring annual commitments", department: "Finance", description: "Verified recurring annual commitments without cross-currency aggregation.", unit: "Currency", sourceId: "source-finance", frequency: "Monthly", dataClassification: "Confidential" }),
  define({ id: "revenue", canonicalKey: "finance.revenue.current", name: "Current revenue", department: "Finance", description: "Verified recognized revenue for the current reporting period.", unit: "Currency", sourceId: "source-billing", frequency: "Monthly", dataClassification: "Restricted" }),
  define({ id: "runway", canonicalKey: "finance.runway.months", name: "Current runway", department: "Finance", description: "Verified cash divided by approved net burn; not calculated without both inputs.", unit: "Duration", sourceId: "source-finance", calculation: "Verified available cash / verified monthly net burn.", numerator: "Verified available cash", denominator: "Verified monthly net burn", frequency: "Monthly", dataClassification: "Restricted" }),
  ...([
    ["verified-accounts", "users.verified.total", "Verified accounts", "Accounts with completed provider verification."],
    ["new-accounts-today", "users.registered.today", "New accounts today", "Eligible accounts registered during the current company reporting day."],
    ["new-accounts-week", "users.registered.week", "New accounts this week", "Eligible accounts registered during the current company reporting week."],
    ["active-users", "users.active.current", "Active users", "Users meeting the approved current activity definition."],
    ["onboarding-completion", "users.onboarding.completion_rate", "Onboarding completion", "Eligible accounts completing the approved onboarding milestone."],
    ["imported-career-histories", "users.career_history.imported", "Imported career histories", "Workspaces with at least one confirmed career-history import."],
    ["completed-blueprints", "users.blueprint.completed", "Completed Blueprints", "Workspaces with a Blueprint meeting the approved completeness threshold."],
    ["atlas-decisions-created", "users.atlas_decisions.created", "Atlas decisions created", "Confirmed Atlas decision artifacts created during the period."],
    ["returning-users", "users.returning.period", "Returning users", "Active users with a meaningful action in an earlier approved period."],
    ["inactive-users", "users.inactive.current", "Inactive users", "Eligible accounts outside the approved activity window."],
    ["deleted-accounts", "users.deleted.period", "Deleted accounts", "Account deletions completed during the period."],
    ["support-requesting-users", "users.support_requesting.period", "Support-requesting users", "Distinct users opening an approved support case during the period."],
    ["invited-beta-users", "beta.invitations.sent", "Invited beta users", "Distinct approved private-beta invitations sent."],
    ["accepted-beta-invitations", "beta.invitations.accepted", "Accepted invitations", "Distinct private-beta invitations accepted."],
  ] as const).map(([id, canonicalKey, name, description]) => define({ id, canonicalKey, name, department: name.includes("support") ? "Customer Support" : "Product", description, unit: name.includes("completion") ? "Percent" : "Count", sourceId: "source-product-analytics" })),
  ...([
    ["qualified-leads", "sales.leads.qualified", "Qualified leads"],
    ["design-partners", "sales.design_partners.total", "Design partners"],
    ["active-evaluations", "sales.evaluations.active", "Active evaluations"],
    ["prospective-paid-users", "sales.prospects.paid", "Prospective paid users"],
    ["sales-conversations", "sales.conversations.active", "Sales conversations"],
    ["proposals", "sales.proposals.open", "Open proposals"],
    ["trials", "sales.trials.active", "Active trials"],
    ["won-customers", "sales.customers.won", "Won customers"],
    ["lost-opportunities", "sales.opportunities.lost", "Lost sales opportunities"],
    ["projected-recurring-revenue", "sales.revenue.projected_recurring", "Projected recurring revenue"],
    ["actual-recurring-revenue", "sales.revenue.actual_recurring", "Actual recurring revenue"],
    ["sales-pipeline-value", "sales.pipeline.value", "Pipeline value"],
    ["next-sales-actions", "sales.actions.next", "Next sales actions"],
  ] as const).map(([id, canonicalKey, name]) => define({ id, canonicalKey, name, department: "Sales", description: `${name} according to the future approved sales workflow definition.`, unit: name.includes("revenue") || name.includes("value") ? "Currency" : "Count", sourceId: name.includes("revenue") ? "source-billing" : "source-product-analytics", dataClassification: "Confidential" })),
  ...([
    ["website-visitors", "marketing.website.visitors", "Website visitors"],
    ["signup-sources", "marketing.signups.by_source", "Signup sources"],
    ["campaign-performance", "marketing.campaign.performance", "Campaign performance"],
    ["linkedin-activity", "marketing.linkedin.activity", "LinkedIn activity"],
    ["email-campaigns", "marketing.email.campaigns", "Email campaigns"],
    ["referral-sources", "marketing.referrals.by_source", "Referral sources"],
    ["content-performance", "marketing.content.performance", "Content performance"],
    ["waitlist-growth", "marketing.waitlist.growth", "Waitlist growth"],
    ["beta-invitation-performance", "marketing.beta_invitation.performance", "Beta invitation performance"],
    ["cost-per-lead", "marketing.cost_per_lead", "Cost per lead"],
    ["marketing-conversion-rate", "marketing.conversion.rate", "Marketing conversion rate"],
    ["brand-mentions", "marketing.brand.mentions", "Brand mentions"],
    ["press-partnerships", "marketing.press_partnerships", "Press and partnerships"],
  ] as const).map(([id, canonicalKey, name]) => define({ id, canonicalKey, name, department: name.includes("Brand") || name.includes("Press") ? "Brand and Communications" : "Marketing", description: `${name} from a future approved analytics or marketing source.`, unit: name.includes("rate") ? "Percent" : name.includes("cost") ? "Currency" : "Count", sourceId: "source-product-analytics" })),
  ...([
    ["new-support-cases", "support.cases.new", "New support cases"],
    ["unresolved-support-cases", "support.cases.unresolved", "Unresolved support cases"],
    ["support-response-time", "support.response.duration", "Support response time"],
    ["support-resolution-time", "support.resolution.duration", "Support resolution time"],
    ["support-issue-category", "support.issues.by_category", "Support issue category"],
    ["support-severity", "support.cases.by_severity", "Support severity"],
    ["customer-sentiment", "support.customer.sentiment", "Customer sentiment"],
    ["recurring-support-issues", "support.issues.recurring", "Recurring issues"],
    ["product-feedback", "support.feedback.product", "Product feedback"],
    ["feature-requests", "support.requests.features", "Feature requests"],
    ["deletion-requests", "support.requests.deletion", "Deletion requests"],
    ["privacy-requests", "support.requests.privacy", "Privacy requests"],
    ["security-reports", "support.reports.security", "Security reports"],
  ] as const).map(([id, canonicalKey, name]) => define({ id, canonicalKey, name, department: name.includes("sentiment") ? "Customer Success" : "Customer Support", description: `${name} according to the future approved support taxonomy.`, unit: name.includes("time") ? "Duration" : "Count", sourceId: "source-product-analytics", dataClassification: "Confidential" })),
];

export const departments: CompanyDepartment[] = ["Executive Office", "Product", "Engineering", "Infrastructure", "Security", "Sales", "Marketing", "Customer Success", "Customer Support", "Finance", "Legal and Compliance", "People and Organization", "Operations", "Partnerships", "Brand and Communications"];

export const permissionRegistry: CompanyPermission[] = [
  ...(["Company Overview", "Finance", "User Identities", "Support Messages", "Legal Records", "Security Incidents", "Compensation", "Private Customer Information"] as const).map((area) => ({ role: "Founder" as const, area, access: "Manage" as const, approvalRequired: area !== "Company Overview" })),
  ...(["Company Executive", "Department Leader", "Board Member", "Adviser", "Auditor", "Read-Only Viewer"] as const).map((role) => ({ role, area: "Company Overview" as const, access: "None" as const, approvalRequired: true })),
];
