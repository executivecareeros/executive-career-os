import type { NavigationItem } from "@/types/design-system";

export const navigationItems: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/", marker: "D" },
  { label: "Executive Blueprint", href: "/blueprint", marker: "BP" },
  { label: "Opportunities", href: "/opportunities", marker: "O" },
  { label: "Discovery", href: "/discovery", marker: "DI" },
  { label: "Knowledge", href: "/knowledge", marker: "K" },
  { label: "Companies", href: "/companies", marker: "C" },
  { label: "Recruiters", href: "/recruiters", marker: "R" },
  { label: "Applications", href: "/applications", marker: "A" },
  { label: "Archive", href: "/archive", marker: "AR" },
  { label: "Compensation", href: "/compensation", marker: "CO" },
  { label: "Reports", href: "/reports", marker: "P" },
  { label: "AI Assistant", href: "/assistant", marker: "AI" },
  { label: "Settings", href: "/settings", marker: "S" },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
