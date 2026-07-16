import Link from "next/link";
import type { ButtonLinkProps } from "@/types/design-system";

const styles =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-[#22211f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#936b3f] disabled:cursor-not-allowed disabled:opacity-50";

export function PrimaryButton({ children, href, className = "", type = "button", disabled, onClick }: ButtonLinkProps) {
  const classes = `${styles} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}
