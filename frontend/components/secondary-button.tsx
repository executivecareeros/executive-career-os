import Link from "next/link";
import type { ButtonLinkProps } from "@/types/design-system";

const styles =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50";

export function SecondaryButton({ children, href, className = "", type = "button", disabled, onClick }: ButtonLinkProps) {
  const classes = `${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}
