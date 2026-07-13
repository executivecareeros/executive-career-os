import { redirect } from "next/navigation";
import { PageContent } from "@/components/page-content";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { AtlasAssessment } from "@/components/beta/atlas-assessment";
import { HistoryFileImport } from "@/components/beta/history-file-import";
import {BetaJourneyProgress} from "@/components/beta/beta-journey-progress";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  finalizeDecisionAction,
  runReasoningAction,
  saveBlueprintAction,
  saveHistoryAction,
  saveHistoryImportAction,
  saveOpportunityAction,
  submitFeedbackAction,
  submitLifecycleAction,
} from "./actions";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400";
const button =
  "rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
function Input({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm text-slate-300">
      {label}
      <input
        className={field}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
function TextArea({
  label,
  name,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm text-slate-300">
      {label}
      <textarea
        className={`${field} min-h-24`}
        name={name}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
function Submit({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={`${button} disabled:cursor-not-allowed disabled:opacity-40`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function LockedStage({number,title,after}:{number:number;title:string;after:string}){return <SectionCard><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Locked</p><h2 className="mt-2 text-xl font-semibold text-slate-300">{number}. {title}</h2><p className="mt-2 text-sm text-slate-500">Complete {after} first. This stage will open automatically when its required context is ready.</p></div><StatusBadge tone="neutral">Locked</StatusBadge></div></SectionCard>}
export default async function BetaWorkflowPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [resolved, q] = await Promise.all([
    resolveAuthenticatedRepositoryContext(),
    searchParams,
  ]);
  if (!resolved) redirect("/login?next=/beta-workflow");
  const repo = new SupabaseBetaWorkflowRepository(
    createServerSupabaseClient(resolved.accessToken),
    resolved.context,
  );
  let view;
  try {
    view = await repo.load();
  } catch (error) {
    return (
      <PageContent>
        <PageHeader
          eyebrow="Your private decision workspace"
          title="Workflow unavailable"
          description={
            error instanceof Error
              ? error.message
              : "The workflow could not be loaded."
          }
        />
      </PageContent>
    );
  }
  const complete = new Set(view.state.completedSteps);
  return (
    <PageContent>
      <PageHeader
        eyebrow="Your private decision workspace"
        title="Executive Opportunity Review"
        description="Move from confirmed career context to a clear decision. Your progress is preserved when you leave and return."
      />
      <BetaJourneyProgress completedSteps={complete}/>
      {q.error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200"
        >
          {q.error}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        {complete.has("Professional History") ? (
          <SectionCard id="professional-history">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">
                  Stage complete
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  1. Essential Professional History
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {view.historyCount} confirmed record preserved in your
                  Workspace.
                </p>
              </div>
              <StatusBadge tone="success">Complete</StatusBadge>
            </div>
          </SectionCard>
        ) : (
          <SectionCard id="professional-history">
            <h2 className="text-xl font-semibold">
              1. Essential Professional History
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Import a reviewed CV/resume draft or confirm one role manually.
              Raw source documents are not retained.
            </p>
            <HistoryFileImport saveAction={saveHistoryImportAction} />
            <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              OR ENTER ONE ROLE MANUALLY
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form
              action={saveHistoryAction}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <Input
                label="Organization"
                name="organizationName"
                placeholder="Example: Aurora Meridian Group"
              />
              <Input
                label="Executive role"
                name="roleTitle"
                placeholder="Example: Chief Strategy Officer"
              />
              <Input
                label="Start date"
                name="startDate"
                type="date"
                required={false}
              />
              <Input
                label="End date"
                name="endDate"
                type="date"
                required={false}
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="isCurrent" />
                Current role
              </label>
              <div />
              <div className="sm:col-span-2">
                <TextArea
                  label="Notes (optional)"
                  name="notes"
                  placeholder="Example: Led a multi-market transformation and portfolio review."
                />
              </div>
              <Submit>Confirm history record</Submit>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Persisted records: {view.historyCount}
            </p>
          </SectionCard>
        )}
        {complete.has("Blueprint") ? (
          <SectionCard id="blueprint">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">
                  Stage complete
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  2. Minimum Executive Blueprint
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Confirmed revision preserved for this decision journey.
                </p>
              </div>
              <StatusBadge tone="success">Complete</StatusBadge>
            </div>
          </SectionCard>
        ) : complete.has("Professional History") ? (
          <SectionCard id="blueprint">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
              Current stage
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              2. Minimum Executive Blueprint
            </h2>
            <form
              action={saveBlueprintAction}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <TextArea
                  label="Career vision"
                  name="careerVision"
                  required
                  placeholder="Example: Lead a global transformation mandate while building board experience."
                />
              </div>
              <TextArea
                label="Preferred industries — one per line"
                name="preferredIndustries"
                placeholder={"Example:\nTechnology\nProfessional Services"}
              />
              <TextArea
                label="Preferred countries — one per line"
                name="preferredCountries"
                placeholder={"Example:\nNetherlands\nUnited Kingdom"}
              />
              <Input
                label="Minimum compensation"
                name="minimumCompensation"
                type="number"
                required={false}
                placeholder="Example: 220000"
              />
              <Input
                label="Currency (ISO 4217)"
                name="currency"
                required={false}
                placeholder="Example: EUR"
              />
              <Input
                label="Maximum travel %"
                name="maximumTravelPercent"
                type="number"
                required={false}
                placeholder="Example: 30"
              />
              <Input
                label="Leadership level"
                name="leadershipLevel"
                placeholder="Example: C-Suite"
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="Constraints — one per line"
                  name="constraints"
                  placeholder={
                    "Example:\nNo permanent relocation outside Europe\nProtect family time"
                  }
                />
              </div>
              <Submit>Save confirmed revision</Submit>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Active revision: Not created
            </p>
          </SectionCard>
        ) : (
          <LockedStage number={2} title="Minimum Executive Blueprint" after="Professional History"/>
        )}
        {complete.has("Opportunity") ? (
          <SectionCard id="opportunity">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">
                  Stage complete
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  3. Opportunity Context
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Confirmed opportunity context preserved for Atlas review.
                </p>
              </div>
              <StatusBadge tone="success">Complete</StatusBadge>
            </div>
          </SectionCard>
        ) : complete.has("Blueprint") ? (
          <SectionCard id="opportunity">
            {complete.has("Blueprint") && (
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
                Current stage
              </p>
            )}
            <h2
              className={`${complete.has("Blueprint") ? "mt-2 " : ""}text-xl font-semibold`}
            >
              3. Opportunity Context
            </h2>
            <form
              action={saveOpportunityAction}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <Input
                label="Role title"
                name="title"
                placeholder="Example: Group Chief Transformation Officer"
              />
              <Input
                label="Company"
                name="companyName"
                placeholder="Example: Northstar Meridian Holdings"
              />
              <Input
                label="Location"
                name="location"
                placeholder="Example: Amsterdam, Netherlands"
              />
              <Input
                label="Work model"
                name="workModel"
                placeholder="Example: Hybrid"
              />
              <Input
                label="Source"
                name="source"
                placeholder="Example: Executive Search Firm"
              />
              <Input
                label="Recruiter context"
                name="recruiterContext"
                required={false}
                placeholder="Example: Confidential approach; recruiter identity verified"
              />
              <Input
                label="Compensation minimum"
                name="compensationMin"
                type="number"
                required={false}
                placeholder="Example: 230000"
              />
              <Input
                label="Compensation maximum"
                name="compensationMax"
                type="number"
                required={false}
                placeholder="Example: 280000"
              />
              <Input
                label="Currency"
                name="currency"
                required={false}
                placeholder="Example: EUR"
              />
              <div />
              <TextArea
                label="Known facts — one per line"
                name="knownFacts"
                placeholder={
                  "Example:\nReports to Group CEO\nBoard exposure included"
                }
              />
              <TextArea
                label="Unverified claims — one per line"
                name="unverifiedClaims"
                placeholder={
                  "Example:\nEquity may be available\nTravel may exceed the advertised level"
                }
              />
              <TextArea
                label="Constraints — one per line"
                name="constraints"
                placeholder={
                  "Example:\nMaximum travel 30 percent\nNo permanent relocation"
                }
              />
              <TextArea
                label="Notes"
                name="notes"
                placeholder="Example: Context or evidence that should remain attached to this opportunity."
              />
              <Submit>Save opportunity</Submit>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Active opportunity: Not created
            </p>
          </SectionCard>
        ) : (
          <LockedStage number={3} title="Opportunity Context" after="the Executive Blueprint"/>
        )}
        {!complete.has("Opportunity")?<LockedStage number={4} title="Atlas Assessment and Decision" after="Opportunity Context"/>:<SectionCard id="assessment">
          {complete.has("Decision Finalized") && (
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">
              Stage complete
            </p>
          )}
          {complete.has("Opportunity") && !complete.has("Reasoning") && (
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
              Current stage
            </p>
          )}
          <h2
            className={`${complete.has("Opportunity") && !complete.has("Reasoning") ? "mt-2 " : ""}text-xl font-semibold`}
          >
            4. Atlas Assessment and Decision
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Atlas loads only the active persisted Blueprint revision, confirmed
            history, opportunity, and entered compensation. Unknowns remain
            unknown.
          </p>
          {!complete.has("Decision Finalized") && (
            <form action={runReasoningAction} className="mt-5">
              <Submit>
                {view.reasoning
                  ? "Refresh Atlas assessment"
                  : "Ask Atlas to assess"}
              </Submit>
            </form>
          )}
          {view.reasoning && <AtlasAssessment output={view.reasoning.output} />}
          {complete.has("Decision Finalized") ? (
            <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4">
              <p className="text-sm font-semibold text-emerald-200">
                Immutable decision preserved
              </p>
              <p className="mt-2 text-sm text-slate-400">
                The decision snapshot, Career Ledger entry, and follow-up task
                were created together. This completed decision cannot be
                submitted again from the workflow.
              </p>
            </div>
          ) : (
            <form
              action={finalizeDecisionAction}
              className="mt-6 grid gap-4 border-t border-white/10 pt-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
                Executive decision
              </p>
              <label className="text-sm text-slate-300">
                Selected next action
                <select
                  className={field}
                  name="selectedAction"
                  defaultValue={
                    view.reasoning?.output.recommendation.action ?? "Monitor"
                  }
                >
                  {[
                    "Apply",
                    "Wait",
                    "Reject",
                    "Monitor",
                    "Negotiate",
                    "Network First",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <input
                type="hidden"
                name="idempotencyKey"
                value={view.state.activeReasoningSnapshotId ?? ""}
              />
              <Submit disabled={!view.reasoning}>
                Preserve final decision
              </Submit>
            </form>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Decision commit: {view.state.finalizedDecisionId ?? "Not finalized"}
          </p>
        </SectionCard>}
        {!complete.has("Decision Finalized")?<LockedStage number={5} title="Private Feedback" after="the executive decision"/>:<SectionCard id="feedback">
          {complete.has("Decision Finalized") && !complete.has("Feedback") && (
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
              Current stage
            </p>
          )}
          <h2 className="text-xl font-semibold">5. Private Feedback</h2>
          {complete.has("Feedback") ? (
            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4">
              <p className="text-sm font-semibold text-emerald-200">
                Feedback preserved
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {view.feedbackCount} private founder submission recorded for
                review.
              </p>
            </div>
          ) : (
            <form action={submitFeedbackAction} className="mt-5 grid gap-4">
              <input
                type="hidden"
                name="workflowStep"
                value={view.state.currentStep}
              />
              <label className="text-sm text-slate-300">
                Category
                <select className={field} name="category">
                  {[
                    "Bug",
                    "Confusion",
                    "Friction",
                    "Missing Information",
                    "Trust Concern",
                    "Incorrect Assessment",
                    "Useful Insight",
                    "Feature Request",
                    "Performance",
                    "Accessibility",
                    "Privacy",
                    "Security",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-300">
                Severity
                <select className={field} name="severity">
                  {["Low", "Medium", "High", "Critical"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <TextArea
                label="What happened?"
                name="description"
                required
                placeholder="Example: The completed step remained open and the next action was unclear."
              />
              <TextArea
                label="Expected behavior"
                name="expectedBehavior"
                placeholder="Example: Collapse the completed step and move focus to the next stage."
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="consentToFollowUp" />
                Founder may follow up
              </label>
              <Submit>Submit private feedback</Submit>
            </form>
          )}
        </SectionCard>}
        {complete.has("Feedback")&&<SectionCard>
          {complete.has("Feedback") && !complete.has("Lifecycle") && (
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">
              Current stage
            </p>
          )}
          <h2 className="text-xl font-semibold">6. Data Lifecycle Request</h2>
          <p className="mt-2 text-sm text-slate-400">
            Requests are founder-supervised. Append-only decision history and
            security audit records may require a documented retention exception;
            this interface does not promise instant hard deletion.
          </p>
          <form action={submitLifecycleAction} className="mt-5 grid gap-4">
            <label className="text-sm text-slate-300">
              Request type
              <select className={field} name="requestType">
                {[
                  "Export",
                  "Account Closure",
                  "Deletion",
                  "Consent Withdrawal",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <TextArea
              label="Optional note"
              name="userNote"
              placeholder="Example: Please prepare a portable copy of my Workspace records."
            />
            <Submit>Submit reviewed request</Submit>
          </form>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            {view.lifecycleRequests.map((request) => (
              <p key={String(request.id)}>
                {String(request.request_type)} · {String(request.status)} ·{" "}
                {String(request.retention_status)}
              </p>
            ))}
          </div>
        </SectionCard>}
      </div>
    </PageContent>
  );
}
