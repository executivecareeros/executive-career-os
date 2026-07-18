import Link from "next/link";
import type { ButtonLinkProps } from "@/types/design-system";

const styles =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7deea] bg-white px-5 py-2.5 text-sm font-semibold text-[#263246] shadow-sm transition hover:-translate-y-px hover:border-[#aebce0] hover:bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5] disabled:cursor-not-allowed disabled:opacity-50";

export function SecondaryButton({ children, href, className = "", type = "button", disabled, onClick }: ButtonLinkProps) {
  const classes = `${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}
