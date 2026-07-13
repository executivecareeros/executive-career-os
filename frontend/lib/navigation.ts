import type { NavigationItem } from "@/types/design-system";

export const navigationItems: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/", marker: "D" },
  { label: "Company Control", href: "/company-control", marker: "CC" },
  { label: "Beta Workflow", href: "/beta-workflow", marker: "BW" },
  { label: "Workspace", href: "/workspace", marker: "W" },
  { label: "Executive Blueprint", href: "/blueprint", marker: "BP" },
  { label: "Import History", href: "/import", marker: "IH" },
  { label: "Opportunities", href: "/opportunities", marker: "O" },
  { label: "Discovery", href: "/discovery", marker: "DI" },
  { label: "Knowledge", href: "/knowledge", marker: "K" },
  { label: "Executive Memory", href: "/memory", marker: "M" },
  { label: "Executive Reasoning", href: "/reasoning", marker: "ER" },
  { label: "Productivity", href: "/productivity", marker: "PX" },
  { label: "Tasks", href: "/tasks", marker: "T" },
  { label: "Repositories", href: "/repositories", marker: "DB" },
  { label: "Companies", href: "/companies", marker: "C" },
  { label: "Recruiters", href: "/recruiters", marker: "R" },
  { label: "Applications", href: "/applications", marker: "A" },
  { label: "Archive", href: "/archive", marker: "AR" },
  { label: "Compensation", href: "/compensation", marker: "CO" },
  { label: "Reports", href: "/reports", marker: "P" },
  { label: "AI Assistant", href: "/assistant", marker: "AI" },
  { label: "Settings", href: "/settings", marker: "S" },
];

export const executiveNavigationItems: readonly NavigationItem[] = [
  { label: "Today", href: "/", marker: "T" },
  { label: "Atlas", href: "/assistant", marker: "A" },
  { label: "Opportunities", href: "/opportunities", marker: "O" },
  { label: "Company Intelligence", href: "/companies", marker: "C" },
  { label: "Executive Blueprint", href: "/blueprint", marker: "B" },
  { label: "Career Ledger", href: "/archive", marker: "L" },
  { label: "Tasks", href: "/tasks", marker: "✓" },
];

export const executiveUtilityItems: readonly NavigationItem[] = [
  { label: "Career Memory", href: "/workspace", marker: "M" },
  { label: "Settings", href: "/settings", marker: "S" },
  { label: "Founder Controls", href: "/company-control", marker: "F" },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
