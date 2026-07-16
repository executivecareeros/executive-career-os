import Link from "next/link";
import type { ButtonLinkProps } from "@/types/design-system";

const styles =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8d0c5] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#3c3935] transition hover:-translate-y-px hover:border-[#bda17f] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#936b3f] disabled:cursor-not-allowed disabled:opacity-50";

export function SecondaryButton({ children, href, className = "", type = "button", disabled, onClick }: ButtonLinkProps) {
  const classes = `${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}
