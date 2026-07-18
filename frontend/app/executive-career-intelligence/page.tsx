import type { Metadata } from "next";
import { PublicMarketingPage } from "@/components/marketing/public-marketing-page";

export const metadata: Metadata = { title: "Executive Career Intelligence with Atlas", description: "Understand executive opportunities through explainable evidence, explicit unknowns, career context and decision guidance from Atlas.", alternates: { canonical: "/executive-career-intelligence" }, openGraph: { title: "Atlas executive career intelligence", description: "Evidence-backed guidance for consequential executive career decisions.", url: "/executive-career-intelligence" } };

export default function ExecutiveCareerIntelligencePage() {
  return <PublicMarketingPage eyebrow="Atlas executive career intelligence" title="A career advisor should show its evidence." introduction="Atlas is designed to help executives examine opportunities—not replace their judgment. It connects confirmed career context with available role and employer evidence, then explains strengths, concerns and unanswered questions." sections={[
    { title: "Explainable guidance", body: "Atlas distinguishes confirmed evidence, interpretation and unknowns. It explains why an opportunity appears relevant instead of hiding the decision inside an opaque score." },
    { title: "Questions that improve decisions", body: "The most valuable next step is often a question: leadership mandate, reporting line, work authorization, compensation, business health or decision authority." },
    { title: "Your judgment remains final", body: "Atlas can recommend, challenge and organize evidence. The executive decides whether to pursue, watch or skip—and that decision remains part of a private career record." },
  ]}/>;
}
