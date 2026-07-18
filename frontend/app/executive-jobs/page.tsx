import type { Metadata } from "next";
import { PublicMarketingPage } from "@/components/marketing/public-marketing-page";

export const metadata: Metadata = { title: "Executive Jobs and Leadership Opportunities", description: "Search executive jobs and leadership opportunities in one private career workspace, with evidence-backed guidance from Atlas.", alternates: { canonical: "/executive-jobs" }, openGraph: { title: "Executive jobs worth your attention", description: "A focused executive opportunity universe with evidence-backed Atlas guidance.", url: "/executive-jobs" } };

export default function ExecutiveJobsPage() {
  return <PublicMarketingPage eyebrow="Executive opportunity universe" title="Spend less time searching. Spend more time deciding well." introduction="ORENDALIS brings executive opportunities into one focused workspace. Search remains familiar, while Atlas helps explain which roles deserve closer attention and which facts are still unknown." sections={[
    { title: "One focused search", body: "Review leadership opportunities without rebuilding your career context on every job platform. Filter by role, company, location and the working model that matters to you." },
    { title: "Evidence before ranking", body: "Recommendations are grounded in available opportunity evidence and your confirmed career context. Missing work authorization, compensation or scope remains explicitly unknown." },
    { title: "A decision you can revisit", body: "Pursue, watch or skip an opportunity while preserving the evidence and reasoning behind your decision in your private career workspace." },
  ]}/>;
}
