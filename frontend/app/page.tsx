import { DashboardSection } from "@/components/dashboard-section";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Good afternoon, Cüneyt"
        title="Executive dashboard"
        description="Your command center for executive career intelligence, relationships, and search momentum."
        actions={
          <>
            <SecondaryButton href="/reports">View reports</SecondaryButton>
            <PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton>
          </>
        }
      />

      <div className="grid gap-6 py-8 xl:grid-cols-2">
        <DashboardSection
          title="Today&apos;s Executive Brief"
          description="A focused view of the intelligence that needs your attention today."
          emptyTitle="Your executive brief is ready to take shape"
          emptyDescription="Relevant career intelligence will appear here when real activity is available."
        />
        <DashboardSection
          title="Executive Metrics"
          description="A concise view of meaningful progress across your executive career portfolio."
          emptyTitle="No metrics to report yet"
          emptyDescription="Metrics will appear after genuine opportunity and application activity exists."
        />
        <DashboardSection
          title="Recent Activity"
          description="The latest meaningful changes across opportunities, relationships, and applications."
          emptyTitle="No recent activity"
          emptyDescription="Your latest verified career activity will be summarized here."
        />
        <DashboardSection
          title="Opportunity Pipeline"
          description="A stage-by-stage view of active executive opportunities and candidacies."
          emptyTitle="Your pipeline is clear"
          emptyDescription="Real opportunities will appear here as they move through your workflow."
          action={<PrimaryButton href="/opportunities">Open opportunities</PrimaryButton>}
        />
        <DashboardSection
          className="xl:col-span-2"
          title="Quick Actions"
          description="Move directly to the workspaces that support your next career decision."
          emptyTitle="Choose your next workspace"
          emptyDescription="Start with opportunities, review target companies, or manage active applications."
          action={
            <>
              <PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton>
              <SecondaryButton href="/companies">Review companies</SecondaryButton>
              <SecondaryButton href="/applications">View applications</SecondaryButton>
            </>
          }
        />
      </div>
    </div>
  );
}
