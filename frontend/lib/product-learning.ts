export type ProductLearningDashboard = {
  windowDays: number;
  generatedAt: string;
  verifiedAccounts: number;
  registeredExecutives: number;
  accountsAwaitingWorkspace: number;
  linkedInAccounts: number;
  activeNow: number;
  executives: number;
  sessions: number;
  returningExecutives: number;
  averageSessionSeconds: number;
  features: Array<{ name: string; events: number; executives: number }>;
  funnel: Array<{ stage: string; executives: number }>;
  devices: Array<{ name: string; sessions: number }>;
  browsers: Array<{ name: string; sessions: number }>;
  profileDimensions: Record<string, Array<{ name: string; executives: number }>>;
};

export function productSurface(pathname: string) {
  if (pathname === "/") return "dashboard";
  if (pathname.startsWith("/import") || pathname.startsWith("/beta-workflow")) return "cv_import";
  if (pathname.startsWith("/opportunities/")) return "opportunity_review";
  if (pathname.startsWith("/opportunities")) return "opportunities";
  if (pathname.startsWith("/assistant") || pathname.startsWith("/reasoning") || pathname.startsWith("/decision-workspace")) return "atlas";
  if (pathname.startsWith("/applications")) return "applications";
  if (pathname.startsWith("/workspace")) return "profile";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/rooms")) return "rooms";
  return pathname.split("/").filter(Boolean)[0]?.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() || "dashboard";
}
