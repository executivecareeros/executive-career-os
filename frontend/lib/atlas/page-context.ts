export type AtlasPageContext = {
  id: "home" | "jobs" | "opportunity" | "company" | "applications" | "profile" | "rooms";
  label: string;
  title: string;
  summary: string;
  prompts: readonly string[];
  returnHref: string;
};

const contexts: Record<AtlasPageContext["id"], AtlasPageContext> = {
  home: {
    id: "home",
    label: "Today",
    title: "Choose the decision that deserves attention",
    summary: "Atlas can connect today’s priorities to confirmed career evidence and unresolved questions.",
    prompts: ["What deserves my attention?", "What changed?", "What should I do next?"],
    returnHref: "/",
  },
  jobs: {
    id: "jobs",
    label: "Jobs",
    title: "Spend attention on the strongest opportunities",
    summary: "Atlas can explain fit, eligibility, evidence gaps, and why one role ranks ahead of another.",
    prompts: ["Why is this a strong match?", "Which roles should I compare?", "What is still unknown?"],
    returnHref: "/opportunities",
  },
  opportunity: {
    id: "opportunity",
    label: "Opportunity review",
    title: "Review the decision, not just the listing",
    summary: "Atlas can separate confirmed evidence, interpretation, risks, and missing information before you act.",
    prompts: ["Why does this fit?", "What could change the recommendation?", "What should I verify first?"],
    returnHref: "/opportunities",
  },
  company: {
    id: "company",
    label: "Company intelligence",
    title: "Interrogate the employer evidence",
    summary: "Atlas can distinguish verified company facts from assumptions and identify the questions worth investigating.",
    prompts: ["What is confirmed?", "What creates career upside?", "Which risks need evidence?"],
    returnHref: "/companies",
  },
  applications: {
    id: "applications",
    label: "Applications",
    title: "Prepare the next move",
    summary: "Atlas can help connect the current application stage, preserved evidence, and the next conversation to prepare.",
    prompts: ["What is the next best action?", "What should I prepare?", "Which assumption needs testing?"],
    returnHref: "/applications",
  },
  profile: {
    id: "profile",
    label: "Career profile",
    title: "Strengthen the context behind every recommendation",
    summary: "Atlas uses only confirmed profile evidence. Missing information remains unknown until you add or verify it.",
    prompts: ["What context is missing?", "What should I update?", "How does this affect matching?"],
    returnHref: "/workspace",
  },
  rooms: {
    id: "rooms",
    label: "Executive Rooms",
    title: "Bring Atlas into the conversation deliberately",
    summary: "Atlas responds only when explicitly invoked and keeps room discussion separate from private career evidence.",
    prompts: ["What evidence supports this?", "What perspectives conflict?", "Which question remains open?"],
    returnHref: "/rooms",
  },
};

export function resolveAtlasPageContext(pathname: string): AtlasPageContext {
  const clean = pathname.split("?")[0]?.split("#")[0] || "/";
  if (/^\/opportunities\/[^/]+/.test(clean)) return contexts.opportunity;
  if (clean.startsWith("/opportunities")) return contexts.jobs;
  if (clean.startsWith("/companies")) return contexts.company;
  if (clean.startsWith("/applications")) return contexts.applications;
  if (clean.startsWith("/workspace") || clean.startsWith("/import") || clean.startsWith("/profile")) return contexts.profile;
  if (clean.startsWith("/rooms")) return contexts.rooms;
  return contexts.home;
}

export function atlasHandoffHref(pathname: string) {
  const context = resolveAtlasPageContext(pathname);
  return `/assistant?from=${encodeURIComponent(context.id)}`;
}

export function resolveAtlasHandoffContext(value: string | undefined) {
  if (!value) return undefined;
  return Object.prototype.hasOwnProperty.call(contexts, value) ? contexts[value as AtlasPageContext["id"]] : undefined;
}
