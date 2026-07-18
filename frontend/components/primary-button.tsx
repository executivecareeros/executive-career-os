import Link from "next/link";
import type { ButtonLinkProps } from "@/types/design-system";

const styles =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1220] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,.14)] transition hover:-translate-y-px hover:bg-[#18243a] hover:shadow-[0_10px_26px_rgba(11,18,32,.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5] disabled:cursor-not-allowed disabled:opacity-50";

export function PrimaryButton({ children, href, className = "", type = "button", disabled, onClick }: ButtonLinkProps) {
  const classes = `${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}
