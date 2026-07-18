import type { Metadata } from "next";
import { PublicMarketingPage } from "@/components/marketing/public-marketing-page";

export const metadata: Metadata = { title: "About ORENDALIS", description: "ORENDALIS is a private executive career platform for opportunity discovery, evidence-backed decision support and durable career memory.", alternates: { canonical: "/about" }, openGraph: { title: "About ORENDALIS", description: "A private executive career platform built around evidence, clarity and executive judgment.", url: "/about" } };

export default function AboutPage() {
  return <PublicMarketingPage eyebrow="About ORENDALIS" title="Executive careers deserve a calmer, more trustworthy system." introduction="ORENDALIS brings opportunity discovery, career context and decision support together in a private workspace. The product is built around a simple standard: unknown information stays unknown, evidence remains visible and the executive remains in control." sections={[
    { title: "Private by design", body: "CV, profile, application and decision information belongs in the executive's authenticated workspace—not in public search pages or marketing content." },
    { title: "Truth before confidence", body: "ORENDALIS does not turn missing facts into certainty. Opportunity and employer information remains attributable to an identified source or clearly marked as unknown." },
    { title: "Built for consequential moves", body: "The objective is not more notifications. It is a clearer view of the opportunities, evidence, questions and next actions that can shape an executive career." },
  ]}/>;
}
