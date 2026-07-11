import type { NavigationItem } from "@/types/design-system";

export const navigationItems: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/", marker: "D" },
  { label: "Opportunities", href: "/opportunities", marker: "O" },
  { label: "Companies", href: "/companies", marker: "C" },
  { label: "Recruiters", href: "/recruiters", marker: "R" },
  { label: "Applications", href: "/applications", marker: "A" },
  { label: "Reports", href: "/reports", marker: "P" },
  { label: "AI Assistant", href: "/assistant", marker: "AI" },
  { label: "Settings", href: "/settings", marker: "S" },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
